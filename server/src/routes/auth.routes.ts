import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// 定义具体的路径
router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login

export default router;