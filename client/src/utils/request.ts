import axios from 'axios';

// 创建一个 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端接口的基础地址
  timeout: 5000, // 请求超时时间
});

// 请求拦截器 (用来统一加 token)
request.interceptors.request.use(
  (config) => {
    // 每次发请求前，从浏览器缓存里拿 VIP 卡
    const token = localStorage.getItem('token');
    if (token) {
      // 把卡贴在请求头里
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 (用来统一处理错误，比如 401 未登录)
request.interceptors.response.use(
  (response) => {
    return response.data; // 只把后端返回的 data 部分给出去
  },
  (error) => {
    // 这里可以加个弹窗提示错误，现在先打印出来
    console.error('请求出错了:', error);
    return Promise.reject(error);
  }
);

export default request;