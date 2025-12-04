<template>
  <div class="home-container">
    <!-- 1. 顶部轮播图 (Banner) -->
    <div class="banner-section">
      <el-carousel trigger="click" height="300px" :interval="4000">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-content" :style="{ background: item.color }">
            <h1>{{ item.title }}</h1>
            <p>{{ item.sub }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 2. 分类筛选 -->
    <div class="category-section">
      <div class="category-header">
        <el-tabs v-model="activeCategory" @tab-click="handleTabClick" style="flex: 1">
          <el-tab-pane label="全部商品" name="all"></el-tab-pane>
          <el-tab-pane label="数码科技" name="electronics"></el-tab-pane>
          <el-tab-pane label="美味零食" name="food"></el-tab-pane>
          <el-tab-pane label="生活用品" name="daily"></el-tab-pane>
          <el-tab-pane label="办公家居" name="furniture"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 3. 商品列表 -->
    <div v-loading="loading" style="min-height: 200px;">
      <el-row :gutter="20">
        <el-col 
          v-for="item in filteredProducts" 
          :key="item.id" 
          :xs="24" :sm="12" :md="8" :lg="6" 
          class="product-col"
        >
          <!-- 点击卡片跳转详情页 -->
          <el-card :body-style="{ padding: '0px' }" shadow="hover" @click="goToDetail(item.id)">
            
            <!-- 图片区域 -->
            <div class="image-wrapper">
              <img :src="item.cover" class="image" loading="lazy" />
              
              <!-- [修复] 删除按钮放这里面，且只对管理员显示 -->
              <el-button 
                v-if="isAdmin"
                type="danger" 
                :icon="Delete" 
                circle 
                size="small" 
                class="delete-btn"
                @click.stop="handleDeleteProduct(item)"
              />
            </div>

            <!-- 信息区域 -->
            <div class="card-body">
              <h3 class="title">{{ item.name }}</h3>
              <p class="desc">{{ item.description }}</p>
              <div class="bottom">
                <span class="price">¥ {{ item.price }}</span>
                <el-button type="primary" size="small" plain @click.stop="handleAddToCart(item)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-if="filteredProducts.length === 0 && !loading" description="该分类下暂时没货..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getProductsAPI, deleteProductAPI, type Product } from '../api/product';
import { addToCartAPI } from '../api/cart';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// --- 数据状态 ---
const productList = ref<Product[]>([]);
const loading = ref(false);
const activeCategory = ref('all');
// [修复] 补回 isAdmin 状态
const isAdmin = ref(false);

const banners = [
  { id: 1, title: 'Zero Mall 开业大促', sub: '全场商品 5 折起', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 2, title: 'AI 显卡现货首发', sub: '算力觉醒，智造未来', color: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { id: 3, title: '程序员关爱计划', sub: '拒绝脱发，从洗头开始', color: 'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)' }
];

// --- 生命周期 ---
onMounted(async () => {
  // [修复] 检查管理员权限 (从 localStorage 读取)
  const role = localStorage.getItem('role');
  isAdmin.value = role === 'admin';

  await loadProducts();
});

// --- 核心逻辑 ---

const loadProducts = async () => {
  loading.value = true;
  try {
    const keyword = route.query.q as string;
    const res: any = await getProductsAPI(keyword);
    productList.value = res.data || [];
    if (keyword) activeCategory.value = 'all';
  } catch (error) {
    ElMessage.error('加载商品失败');
  } finally {
    loading.value = false;
  }
};

watch(() => route.query.q, () => {
  loadProducts();
});

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') return productList.value;
  return productList.value.filter(p => p.category === activeCategory.value);
});

const goToDetail = (id: number) => {
  router.push(`/product/${id}`);
};

const handleAddToCart = async (item: Product) => {
  try {
    await addToCartAPI(item.id, 1);
    ElMessage.success(`已将 ${item.name} 加入购物车`);
  } catch (error) {
    ElMessage.error('加购失败，请先登录');
  }
};

const handleTabClick = () => {};

// [修复] 删除逻辑
const handleDeleteProduct = (item: Product) => {
  ElMessageBox.confirm(
    `确定要下架删除 "${item.name}" 吗？`,
    '高风险操作',
    { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      // 这里的 deleteProductAPI 必须在顶部 import 进来
      await deleteProductAPI(item.id);
      ElMessage.success('已删除');
      loadProducts(); 
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  });
};
</script>

<style scoped>
/* Banner */
.banner-section { margin-bottom: 30px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.banner-content { height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; }
.banner-content h1 { font-size: 36px; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: 2px; }
.banner-content p { font-size: 18px; opacity: 0.9; }

/* Category */
.category-section { margin-bottom: 20px; }
.category-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

/* Products */
.product-col { margin-bottom: 20px; }
.image-wrapper { height: 200px; overflow: hidden; position: relative; background: #f5f7fa; }
.image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.el-card:hover .image { transform: scale(1.08); }
.el-card { cursor: pointer; border: none; transition: transform 0.3s, box-shadow 0.3s; }
.el-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }

/* [修复] 删除按钮样式 */
.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0; /* 平时隐藏 */
  transition: opacity 0.3s;
  z-index: 10;
}
.el-card:hover .delete-btn { opacity: 1; /* 悬停显示 */ }

.card-body { padding: 16px; }
.title { margin: 0 0 8px 0; font-size: 16px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.desc { font-size: 13px; color: #999; margin: 0 0 16px 0; height: 20px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.bottom { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-size: 18px; font-weight: bold; }
</style>