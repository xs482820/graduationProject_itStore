import request from '../utils/request';

// 定义登录接口
// data 是我们在 Vue 页面里收集到的账号密码
export const loginAPI = (data: any) => {
  return request({
    url: '/auth/login', // 这里的 /auth/login 会拼接到 baseURL 后面
    method: 'POST',
    data
  });
};

// 注册接口
export const registerAPI = (data: any) => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  });
};