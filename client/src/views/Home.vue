<template>
  <div class="home-container">
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="logo">Zero Mall</div>
        <div class="user-info">
          <span class="welcome-text">{{ nickname }}，欢迎光临</span>
          <el-button type="danger" size="small" @click="logout">退出店铺</el-button>
          <el-button type="info" size="small" @click="$router.push('/orders')">我的订单</el-button>
          <el-button type="warning" size="small" @click="$router.push('/cart')">购物车</el-button>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main>
        <!-- 这里的 gutter="20" 意思是卡片之间的间距是 20px -->
        <el-row :gutter="20">
          <!-- v-for 循环渲染：有多少商品，就生成多少个列 -->
          <!-- :span="6" 意思是每个商品占 24份中的6份，也就是一行放4个 -->
          <el-col 
            v-for="item in productList" 
            :key="item.id" 
            :span="6" 
            class="product-col"
          >
            <el-card :body-style="{ padding: '0px' }" shadow="hover">
              <!-- 商品图片 -->
              <img :src="item.cover" class="image" />
              
              <!-- 商品信息 -->
              <div class="card-body">
                <h3 class="title">{{ item.name }}</h3>
                <p class="desc">{{ item.description }}</p>
                <div class="bottom">
                  <span class="price">¥ {{ item.price }}</span>
                  <el-button type="primary" size="small" plain @click="handleAddToCart(item)">加入购物车</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 如果没数据，显示空状态 -->
        <el-empty v-if="productList.length === 0" description="仓库暂时没货了..." />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProductsAPI, type Product } from '../api/product';
import { ElMessage } from 'element-plus';
import { addToCartAPI } from '../api/cart';

const handleAddToCart = async (product: Product) => {
  try {
    await addToCartAPI(product.id, 1);
    ElMessage.success(`成功将 "${product.name}" 加入购物车`);
  } catch (error) {
    ElMessage.error('加入购物车失败');
  }
};

const router = useRouter();
const productList = ref<Product[]>([]); // 存放商品列表
const nickname = localStorage.getItem('nickname') || '顾客';

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

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
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