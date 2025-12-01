import request from '../utils/request';

export const chatAPI = (message: string) => {
  return request({
    url: '/ai/chat',
    method: 'POST',
    data: { message }
  });
};