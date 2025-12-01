<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>加入 Zero Mall</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="想怎么称呼你？" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="设置一个密码" 
            show-password 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="handleRegister" :loading="isLoading" style="width: 100%">
            立即注册
          </el-button>
        </el-form-item>
        <div class="links">
          <el-link type="primary" @click="$router.push('/login')">已有账号？去登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerAPI } from '../api/auth'; // 确保你在 api/auth.ts 里写了这个
import { ElMessage } from 'element-plus';

const router = useRouter();
const form = reactive({
  email: '',
  password: '',
  nickname: ''
});

const isLoading = ref(false);

const handleRegister = async () => {
  if(!form.email || !form.password) {
    ElMessage.warning('邮箱和密码不能为空');
    return;
  }

  try {
    isLoading.value = true;
    await registerAPI(form);
    ElMessage.success('注册成功！请登录');
    router.push('/login'); // 注册完踢去登录页
  } catch (error: any) {
    // 这里简单处理，实际上后端如果返回 400 会被拦截器捕获
    ElMessage.error(error.response?.data?.message || '注册失败');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 复用 Login 的样式，保持风格统一 */
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
.links {
  text-align: right;
  margin-top: 10px;
}
</style>