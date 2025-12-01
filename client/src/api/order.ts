import request from '../utils/request';

// 获取订单列表
export const getMyOrdersAPI = () => {
  return request({
    url: '/orders',
    method: 'GET'
  });
};