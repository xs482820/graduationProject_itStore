<template>
  <div class="global-header">
    <div class="header-content container">
      <!-- 1. Logo -->
      <div class="logo" @click="$router.push('/')">
        <el-icon class="logo-icon"><Shop /></el-icon>
        <span>Zero Mall</span>
      </div>

      <!-- 2. 搜索框 (装饰用，暂未接接口) -->
      <div class="search-section">
        <el-input 
          v-model="keyword" 
          placeholder="搜索商品..." 
          class="search-input"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" />
          </template>
        </el-input>
      </div>

      <!-- 3. 右侧功能区 -->
      <div class="right-actions">
        <!-- 购物车入口 -->
        <el-badge :value="cartCount" :max="99" class="item-badge" :hidden="cartCount === 0">
          <el-button link @click="$router.push('/cart')">
            <el-icon :size="20"><ShoppingCart /></el-icon>
            <span class="action-text">购物车</span>
          </el-button>
        </el-badge>

        <!-- 订单入口 -->
        <el-button link @click="$router.push('/orders')">
          <el-icon :size="20"><List /></el-icon>
          <span class="action-text">我的订单</span>
        </el-button>

        <!-- 用户下拉菜单 -->
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link user-info">
            <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="nickname">{{ nickname }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" style="color: #f56c6c;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Shop, Search, ShoppingCart, List, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const keyword = ref('');
const nickname = ref('用户');
const cartCount = ref(0); // 这里先写死，以后可以从 Store 或 API 获取

onMounted(() => {
  nickname.value = localStorage.getItem('nickname') || '顾客';
});

const handleSearch = () => {
  console.log('搜索:', keyword.value);
  // 以后在这里做搜索跳转
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.clear(); // 清空所有缓存
    router.push('/login');
  }
};
</script>

<style scoped>
.global-header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky; /* 吸顶效果 */
  top: 0;
  z-index: 100;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-text {
  margin-left: 4px;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}
.nickname {
  font-size: 14px;
  color: var(--zero-text-main);
}
</style>