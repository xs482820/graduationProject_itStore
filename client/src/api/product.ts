import request from '../utils/request';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  cover: string;
  category: string;
  isOnSale: boolean;
}

// 1. 获取商品列表 (支持搜索参数 q)
// 修改点：增加了 q?: string 参数
export const getProductsAPI = (q?: string) => {
  return request({
    url: '/products',
    method: 'GET',
    params: { q } //这会自动拼接成 /products?q=xxx
  });
};

// 2. 获取单件商品详情
export const getProductDetailAPI = (id: number) => {
  return request({
    url: `/products/${id}`,
    method: 'GET'
  });
};

// 3. 上架商品 (管理员用)
export const createProductAPI = (data: any) => {
  return request({
    url: '/products',
    method: 'POST',
    data
  });
};

// 删除商品
export const deleteProductAPI = (id: number) => {
  return request({
    url: `/products/${id}`,
    method: 'DELETE'
  });
};