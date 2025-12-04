<template>
  <div class="home-container">
    <el-container>

      <el-main>
        <!-- 1. 顶部轮播图 (Banner) -->
        <div class="banner-section">
          <el-carousel trigger="click" height="300px" :interval="4000">
            <el-carousel-item v-for="item in banners" :key="item.id">
              <!-- 这里为了演示，我用 CSS 渐变色模拟海报，你可以换成 <img :src="item.img" /> -->
              <div class="banner-content" :style="{ background: item.color }">
                <h1>{{ item.title }}</h1>
                <p>{{ item.sub }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      
        <!-- 2. 分类筛选 (Category Tabs) -->
        <div class="category-section">
          <el-tabs v-model="activeCategory" @tab-click="handleTabClick">
            <el-tab-pane label="全部商品" name="all"></el-tab-pane>
            <el-tab-pane label="数码科技" name="electronics"></el-tab-pane>
            <el-tab-pane label="美味零食" name="food"></el-tab-pane>
            <el-tab-pane label="生活用品" name="daily"></el-tab-pane>
            <el-tab-pane label="办公家居" name="furniture"></el-tab-pane>
          </el-tabs>
        </div>
      
        <!-- 3. 商品列表 (Product Grid) -->
        <!-- 注意：这里的 v-for 要改成遍历 filteredProducts (过滤后的列表) -->
        <el-row :gutter="20">
          <el-col 
            v-for="item in filteredProducts" 
            :key="item.id" 
            :span="6" 
            class="product-col"
          >
            <el-card :body-style="{ padding: '0px' }" shadow="hover" @click="goToDetail(item.id)">
              <div class="image-wrapper">
                <img :src="item.cover" class="image" />
              </div>
              <div class="card-body">
                <h3 class="title">{{ item.name }}</h3>
                <p class="desc">{{ item.description }}</p>
                <div class="bottom">
                  <span class="price">¥ {{ item.price }}</span>
                  <!-- 阻止冒泡：点击按钮是加购物车，点击卡片其他地方是进详情 -->
                  <el-button type="primary" size="small" plain @click.stop="handleAddToCart(item)">
                    加入购物车
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      
        <el-empty v-if="filteredProducts.length === 0" description="该分类下暂时没货..." />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getProductsAPI, type Product } from '../api/product';
import { ElMessage } from 'element-plus';
import { addToCartAPI } from '../api/cart';

const router = useRouter();
const banners = [
  { id: 1, title: 'Zero Mall 开业大促', sub: '全场商品 5 折起', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
  { id: 2, title: 'AI 显卡现货首发', sub: '算力觉醒，智造未来', color: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { id: 3, title: '程序员关爱计划', sub: '拒绝脱发，从洗头开始', color: 'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)' }
];
const activeCategory = ref('all'); // 当前选中的分类
// 计算属性：根据选中的分类，自动过滤商品
const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return productList.value;
  }
  // 这里的 category 对应数据库里的字符串 (electronics, food 等)
  return productList.value.filter(p => p.category === activeCategory.value);
});

const handleTabClick = (tab: any) => {
  console.log('切换分类:', tab.props.name);
};
const goToDetail = (id: number) => {
  router.push(`/product/${id}`); 
};

const handleAddToCart = async (product: Product) => {
  try {
    await addToCartAPI(product.id, 1);
    ElMessage.success(`成功将 "${product.name}" 加入购物车`);
  } catch (error) {
    ElMessage.error('加入购物车失败');
  }
};

const productList = ref<Product[]>([]); // 存放商品列表

// 页面加载时触发
onMounted(async () => {
  await loadProducts();
});

// 从后端加载数据
const loadProducts = async () => {
  try {
    const res: any = await getProductsAPI();
    // 注意：后端的结构是 { data: [...] }，根据你的 request 封装，这里可能直接拿到了 data 里的内容
    // 我们在 Thunder Client 看到直接返回了数组吗？还是 { data: [] }？
    // 根据刚才的代码 product.controller.ts 写的是 res.json({ data: products })
    // 所以这里应该是 res.data
    if (res && res.data) {
      productList.value = res.data;
    } else {
      // 容错处理：如果拦截器直接返回了 data 内容
      productList.value = res; 
    }
    console.log('货架已上新:', productList.value);
  } catch (error) {
    ElMessage.error('获取商品列表失败，请检查后端是否启动');
  }
};
</script>

<style scoped>
.banner-section {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
}
.banner-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}
.banner-content h1 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.banner-content p {
  font-size: 18px;
  opacity: 0.9;
}
/* 分类 Tab 样式 */
.category-section {
  margin-bottom: 20px;
  background: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}

/* 优化图片显示 */
.image-wrapper {
  height: 200px;
  overflow: hidden;
}
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.el-card:hover .image {
  transform: scale(1.05); /* 鼠标悬停放大效果 */
}
.el-card {
  cursor: pointer; /* 让鼠标变成手型 */
  transition: all 0.3s;
}
.el-card:hover {
  transform: translateY(-5px); /* 悬停上浮 */
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 40px;
  height: 60px;
}
.logo {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary); /* 使用我们在 style.css 定义的变量 */
}
.product-col {
  margin-bottom: 20px;
}
.image {
  width: 100%;
  height: 200px;
  object-fit: cover; /* 图片裁剪模式，防止变形 */
  display: block;
}
.card-body {
  padding: 14px;
}
.title {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 标题太长显示省略号 */
}
.desc {
  font-size: 13px;
  color: #999;
  margin: 8px 0;
  height: 40px; /* 固定高度，保证卡片对齐 */
  overflow: hidden;
}
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}
</style>