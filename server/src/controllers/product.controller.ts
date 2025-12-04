import { Request, Response } from 'express';
import prisma from '../db';

// 获取商品列表
export const getProducts = async (req: Request, res: Response) => {
  try {
    // 获取查询参数 ?q=xxx
    const { q } = req.query; 

    const products = await prisma.product.findMany({
      where: {
        isOnSale: true,
        // 如果传了 q，就进行模糊搜索；没传就是 undefined (即查询所有)
        name: q ? { contains: String(q) } : undefined 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ message: '获取商品失败' });
  }
};

// 获取单件商品详情
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // 从 URL 里拿 ID
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ message: '获取详情失败' });
  }
};

// 上架新商品 (仅限管理员，实际项目中需要加 Role 校验，这里为了毕设简单，先只做功能)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, category, cover } = req.body;

    // 简单校验
    if (!name || !price || !category) {
      res.status(400).json({ message: '必填项不能为空' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: Number(price), // 确保转成数字
        stock: Number(stock) || 100,
        category,
        cover: cover || 'https://via.placeholder.com/300', // 没图就给个默认图
        isOnSale: true
      }
    });

    res.status(201).json({ message: '上架成功', data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '上架失败' });
  }
};

// 删除商品
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 注意：如果有订单关联了这个商品，物理删除会报错。
    // 严谨的做法是 check 订单，或者 soft delete。
    // 这里为了演示，我们尝试删除，如果报错就告诉前端“该商品已有订单，无法删除”。
    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    // Prisma 错误码 P2003 代表外键约束失败
    res.status(400).json({ message: '删除失败：该商品可能已包含在历史订单中，无法物理删除。' });
  }
};