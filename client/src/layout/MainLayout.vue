<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <GlobalHeader />

    <!-- 页面主体内容 (变化的区域) -->
    <div class="main-content">
      <router-view /> 
    </div>
    
    <!-- 底部版权 (可选) -->
    <div class="footer">
      <p>© 2025 Zero Mall - AI 驱动的电子商城毕设项目</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '../components/GlobalHeader.vue';
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 64px - 60px); /* 减去头和尾的高度 */
  padding-bottom: 40px;
}
.footer {
  height: 60px;
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 60px;
  background-color: #fafafa;
}
</style>