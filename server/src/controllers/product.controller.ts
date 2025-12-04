import { Request, Response } from 'express';
import prisma from '../db';

// 获取商品列表
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isOnSale: true }, // 只查上架的
      orderBy: { createdAt: 'desc' } // 新的在前
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