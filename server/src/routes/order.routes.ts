import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';


const router = Router();
router.post('/', authMiddleware, createOrder); // POST /api/orders
export default router;
router.get('/', authMiddleware, getMyOrders); // GET /api/orders (获取当前用户的订单列表)