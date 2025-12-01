import { Router } from 'express';
import { handleChat } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/ai/chat
router.post('/chat', authMiddleware, handleChat); // 需要登录才能聊天

export default router;