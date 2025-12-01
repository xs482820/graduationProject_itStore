import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';

// 加入购物车
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!; // 从中间件拿到的 ID
    const { productId, quantity = 1 } = req.body; // 前端传过来的

    if (!productId) {
      res.status(400).json({ message: '商品ID不能为空' });
      return;
    }

    // 1. 检查商品存不存在
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    // 2. 检查购物车里是不是已经有这个东西了
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      // A. 如果有，数量 +1
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // B. 如果没有，新建一条
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        }
      });
    }

    res.json({ message: '已加入购物车' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '操作失败' });
  }
};

// 获取购物车列表
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // 查数据库：要把商品详情(product)也一起查出来
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true // <--- 重点：关联查询，把商品信息也带出来
      }
    });

    res.json({ data: cartItems });
  } catch (error) {
    res.status(500).json({ message: '获取购物车失败' });
  }
};