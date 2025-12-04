import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue'; 
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Cart from '../views/Cart.vue';
import Register from '../views/Register.vue';
import ProductDetail from '../views/ProductDetail.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      // 新增这一行：动态路由，:id 会匹配 url 里的数字
      { path: 'product/:id', name: 'ProductDetail', component: ProductDetail } 
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  
  // 修改这里：增加 && to.name !== 'Register'
  // 意思：如果去的不是登录页，且不是注册页，且没有token，才踢回去
  if (to.name !== 'Login' && to.name !== 'Register' && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;