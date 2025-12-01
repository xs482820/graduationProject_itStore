import request from '../utils/request';

export const addToCartAPI = (productId: number, quantity: number = 1) => {
  return request({
    url: '/cart/add',
    method: 'POST',
    data: { productId, quantity }
  });
};

// 获取购物车列表
export const getCartAPI = () => {
  return request({
    url: '/cart',
    method: 'GET'
  });
};

export const checkoutAPI = () => {
  return request({
    url: '/orders',
    method: 'POST',
    data: {} // 不需要传参数，后端自己会去查购物车
  });
};