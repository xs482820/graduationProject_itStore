<template>
  <router-view></router-view>
  
  <!-- 只有在 showChat 为 true 时才显示看板娘 -->
  <ChatWidget v-if="showChat" /> 
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ChatWidget from './components/ChatWidget.vue';

const route = useRoute();

// 计算属性：决定要不要显示聊天窗
const showChat = computed(() => {
  // 定义“黑名单”：这些页面不显示 AI
  const hideRoutes = ['Login', 'Register'];
  
  // 如果当前路由的名字在黑名单里，就不显示
  // (注意：这里对比的是路由的 name，确保你 router/index.ts 里都写了 name)
  return !hideRoutes.includes(route.name as string);
});
</script>

<style>
/* 全局样式保持不变 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: var(--zero-bg-color);
  color: var(--zero-text-main);
}
</style>