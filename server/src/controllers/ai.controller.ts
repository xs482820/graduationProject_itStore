import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware'; // 引入带 userId 的请求类型
import prisma from '../db';
import OpenAI from 'openai';

// 初始化 OpenAI (DeepSeek)
const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

export const handleChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.userId; // 中间件解出来的用户ID

    if (!message) {
      res.status(400).json({ message: '说点什么吧...' });
      return;
    }

    // --- 1. 搜集情报 (Context Gathering) ---
    let userContext = "用户身份：未登录游客。";
    
    if (userId) {
      // A. 查用户信息
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      // B. 查购物车 (看看他想买啥)
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
      });
      const cartSummary = cartItems.map(item => `${item.product.name} (x${item.quantity})`).join(', ');

      // C. 查最近一笔订单 (看看他刚买了啥)
      const lastOrder = await prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      const orderSummary = lastOrder 
        ? `最近订单包含：${lastOrder.items.map(i => i.name).join(', ')}，花费 ¥${lastOrder.totalAmount}`
        : "暂无历史订单";

      userContext = `
        用户昵称：${user?.nickname || '用户'} (ID: ${userId})。
        购物车内有：${cartSummary || '空'}。
        历史消费情况：${orderSummary}。
      `;
    }

    // --- 2. 查商品知识库 (Product Knowledge) ---
    // 为了省钱省Token，我们只把上架商品的 名字、价格、描述 给 AI
    const products = await prisma.product.findMany({
      where: { isOnSale: true },
      select: { name: true, price: true, description: true }
    });
    const productKnowledge = JSON.stringify(products);

    // --- 3. 组装终极提示词 (System Prompt) ---
    const systemPrompt = `
      你叫“零(Zero)”，是 Zero Mall 的看板娘。
      
      【你拥有上帝视角】：
      ${userContext}
      
      【商城在售商品】：
      ${productKnowledge}

      【你的性格】：
      傲娇、毒舌、但其实很关心用户。
      不要只回答问题，要结合用户的购物车和订单情况进行吐槽或推荐。
      如果用户购物车里有东西，催他赶紧下单；如果用户刚买完，夸他有眼光。
      请简短回答（100字以内）。
    `;

    // --- 4. 发送给 DeepSeek ---
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "deepseek-chat",
      temperature: 1.3,
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: '本小姐的大脑过载了...' });
  }
};