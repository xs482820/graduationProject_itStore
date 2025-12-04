<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>Zero 商城 - 管理员登录</span>
        </div>
      </template>
      
      <!-- 表单区域 -->
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="isLoading" style="width: 100%">
            立即登录
          </el-button>
          <div style="text-align: right; margin-top: 10px;">
            <!-- 注意这里调用的是 goToRegister -->
            <el-link type="primary" @click="goToRegister">没有账号？去注册</el-link>
          </div>
        </el-form-item>
      </el-form>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router'; // <--- 1. 引入路由工具
import { loginAPI } from '../api/auth'; // 注意路径变成了 ../api
import { ElMessage } from 'element-plus'; 

const router = useRouter(); // <--- 2. 初始化路由

// 新增一个跳转函数
const goToRegister = () => {
  console.log('正在跳转去注册页...'); // 可以在控制台看到有没有触发
  router.push('/register');
};

// 定义表单数据
const loginForm = reactive({
  email: '',
  password: ''
});

const isLoading = ref(false);

// 点击登录按钮触发
const handleLogin = async () => {
  if(!loginForm.email || !loginForm.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }

  try {
    isLoading.value = true;
    const res: any = await loginAPI(loginForm);
    
    console.log('登录成功，后端返回:', res);
    ElMessage.success('登录成功！欢迎回来');
    // 存储 token 和昵称
    localStorage.setItem('token', res.token);
    localStorage.setItem('nickname', res.user.nickname || '用户');
    localStorage.setItem('role', res.user.role); // 存储角色
    // 存储用户信息
    if(res.user) {
      localStorage.setItem('userInfo', JSON.stringify(res.user));
    }

    // <--- 3. 核心修改：跳转到首页
    router.push('/'); 

  } catch (error) {
    ElMessage.error('登录失败，请检查账号密码');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.card-header {
  font-weight: bold;
  text-align: center;
}
</style>