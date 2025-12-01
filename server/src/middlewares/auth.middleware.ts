import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-zero';

// 扩展 Express 的 Request 类型，让它能携带 userId
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. 从请求头里拿 Token (格式通常是: Bearer xxxxxxx)
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: '未授权，请先登录' });
    return;
  }

  // 把 "Bearer " 去掉，只留 Token 字符串
  const token = authHeader.split(' ')[1];

  try {
    // 2. 验证 Token 是否合法
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };
    
    // 3. 把解析出来的 userId 挂在 req 上，后面的 Controller 就能用了
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next(); // 放行！
  } catch (error) {
    res.status(403).json({ message: 'Token 无效或已过期' });
  }
};