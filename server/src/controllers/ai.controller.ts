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
    const { message, productId } = req.body; 
    const userId = req.userId;

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

    // --- 新增逻辑：查询当前正在浏览的商品 ---
    let browsingContext = "用户当前位置：商城大厅/列表页。";
    
    if (productId) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: Number(productId) }
      });
      
      if (currentProduct) {
        browsingContext = `
          【用户正在浏览商品详情】：
          商品名：${currentProduct.name}
          价格：¥${currentProduct.price}
          库存：${currentProduct.stock}
          描述：${currentProduct.description}
          
          (注意：如果用户的问题中有指示代词如“这个”、“它”、“这款”，通常指的就是上面这个商品。)
        `;
      }
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
      
      【当前场景】：
      ${browsingContext}
      
      【用户画像】：
      ${userContext}
      
      【全站商品知识库】：
      ${productKnowledge}

      【你的性格】：
      傲娇、毒舌、专业。
      1. 优先根据“用户正在浏览的商品”回答问题。
      2. 如果用户在看具体商品，请多从性价比、适用场景方面进行点评（顺便毒舌一下）。
      3. 回答简短有力（100字以内）。
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