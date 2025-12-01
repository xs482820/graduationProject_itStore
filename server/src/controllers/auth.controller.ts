import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db'; // 引入刚才写的数据库实例

// 定义密钥，实际开发中应该放在 .env 里，这里为了演示先写死
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-zero';

// --- 注册逻辑 ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname } = req.body;

    // 1. 检查必填项
    if (!email || !password) {
      res.status(400).json({ message: '邮箱和密码是必须的' });
      return;
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: '该邮箱已被注册' });
      return;
    }

    // 3. 密码加密 (这是最重要的一步！)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 写入数据库
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname || '新用户',
      },
    });

    // 5. 返回成功信息 (千万别把密码返回去！)
    res.status(201).json({ 
      message: '注册成功', 
      user: { id: user.id, email: user.email, nickname: user.nickname } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器开小差了' });
  }
};

// --- 登录逻辑 ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. 找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: '用户不存在或密码错误' }); // 模糊报错是为了安全
      return;
    }

    // 2. 比对密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: '用户不存在或密码错误' });
      return;
    }

    // 3. 签发 Token (身份证)
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h', // Token 24小时后过期
    });

    res.json({ 
      message: '登录成功', 
      token, 
      user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};