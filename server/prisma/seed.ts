import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. 先清空旧数据 (防止重复插入)
  await prisma.product.deleteMany({});

  // 2. 准备数据
  const products = [
    {
      name: '高性能 AI 显卡',
      description: '拥有它，你也能训练出像零一样聪明的 AI。',
      price: 8999.00,
      stock: 10,
      cover: 'https://via.placeholder.com/300x300/409eff/ffffff?text=GPU',
      category: 'electronics'
    },
    {
      name: '程序员防脱发洗发水',
      description: '精选草本，守护你的发际线。',
      price: 58.50,
      stock: 999,
      cover: 'https://via.placeholder.com/300x300/67c23a/ffffff?text=Shampoo',
      category: 'daily'
    },
    {
      name: '人体工学椅',
      description: '坐着写代码，腰不酸腿不疼。',
      price: 1299.00,
      stock: 50,
      cover: 'https://via.placeholder.com/300x300/e6a23c/ffffff?text=Chair',
      category: 'furniture'
    },
    {
      name: '快乐肥宅水 (24罐)',
      description: '深夜改 Bug 的最佳伴侣。',
      price: 45.00,
      stock: 200,
      cover: 'https://via.placeholder.com/300x300/f56c6c/ffffff?text=Cola',
      category: 'food'
    }
  ];

  // 3. 批量插入
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  
  console.log('✅ 货架已填满！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });