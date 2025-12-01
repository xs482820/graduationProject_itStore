import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/auth.middleware';

// 创建订单 (结账)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // 1. 先把购物车里的东西查出来
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ message: '购物车是空的，无法结算' });
      return;
    }

    // 2. 算总价
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.quantity * Number(item.product.price);
    }, 0);

    // 3. 开启事务 (原子操作：要么全成功，要么全失败)
    const result = await prisma.$transaction(async (tx) => {
      // A. 创建订单主表
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'paid', // 毕设为了省事，假设点击即支付成功
        }
      });

      // B. 创建订单详情表 (把购物车每一项搬过来)
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            name: item.product.name,
            price: item.product.price, // 记录购买时的单价
            quantity: item.quantity
          }
        });
        
        // (可选) 这里其实还应该扣减 Product 表的库存，先略过，防止库存不足报错
      }

      // C. 清空该用户的购物车
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return order;
    });

    res.json({ message: '下单成功！', orderId: result.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '结账失败' });
  }
};

// 获取我的订单列表
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const orders = await prisma.order.findMany({
      where: { userId },
      // 重点：关联查询，把订单详情(items)查出来
      include: {
        items: true 
      },
      orderBy: { createdAt: 'desc' } // 最新的订单排前面
    });

    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: '获取订单失败' });
  }
};