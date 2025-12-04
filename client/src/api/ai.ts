import request from '../utils/request';

// 增加一个可选参数 currentProductId
export const chatAPI = (message: string, currentProductId?: number) => {
  return request({
    url: '/ai/chat',
    method: 'POST',
    data: { 
      message,
      productId: currentProductId // 把 ID 传给后端
    }
  });
};