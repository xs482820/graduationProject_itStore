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