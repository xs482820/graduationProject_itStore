import { PrismaClient } from '@prisma/client';

// 保证全局只有一个数据库连接实例
const prisma = new PrismaClient();

export default prisma;