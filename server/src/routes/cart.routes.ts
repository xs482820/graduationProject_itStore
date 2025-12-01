import { Router } from 'express';
import { addToCart, getCart } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware'; // 引入安保

const router = Router();

// 注意！这里加了 authMiddleware，说明这个接口必须登录才能调
router.post('/add', authMiddleware, addToCart); 
router.get('/', authMiddleware, getCart);

export default router;