import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; 
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 挂载路由 ---
// 所有 authRoutes 里的接口，都以 /api/auth 开头
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.get('/', (req, res) => {
  res.send({ message: 'Zero Online' });
});
app.listen(PORT, () => {
  console.log(`[Zero]: Server running on http://localhost:${PORT}`);
});
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);