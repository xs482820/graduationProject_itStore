import request from '../utils/request';

// 定义商品的数据结构 (TypeScript 的好处：写代码时有提示)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // 注意：后端 Decimal传过来通常是字符串或数字，这里先用string接
  stock: number;
  cover: string;
  category: string;
}

// 获取商品列表接口
export const getProductsAPI = () => {
  return request({
    url: '/products', // 对应后端的 /api/products
    method: 'GET'
  });
};