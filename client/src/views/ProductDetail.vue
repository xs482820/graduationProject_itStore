<template>
  <div class="product-detail-container" v-if="product">
    <el-card shadow="never">
      <div class="detail-layout">
        <!-- 左侧：大图区 -->
        <div class="image-section">
          <el-image :src="product.cover" fit="contain" class="main-image">
            <template #placeholder>
              <div class="image-slot">加载中...</div>
            </template>
          </el-image>
        </div>

        <!-- 右侧：信息区 -->
        <div class="info-section">
          <h1 class="title">{{ product.name }}</h1>
          <p class="desc">{{ product.description }}</p>
          
          <div class="price-box">
            <span class="currency">¥</span>
            <span class="price">{{ product.price }}</span>
          </div>

          <div class="meta-info">
            <div class="meta-row">
              <span class="label">分类：</span>
              <el-tag size="small">{{ product.category }}</el-tag>
            </div>
            <div class="meta-row">
              <span class="label">库存：</span>
              <span>{{ product.stock > 0 ? '有货' : '缺货' }} (剩 {{ product.stock }} 件)</span>
            </div>
          </div>

          <!-- 购买操作区 -->
          <div class="action-area">
            <div class="qty-row">
              <span class="label">数量：</span>
              <el-input-number v-model="quantity" :min="1" :max="product.stock" />
            </div>
            
            <div class="btn-row">
              <el-button type="primary" size="large" @click="handleAddToCart">
                加入购物车
              </el-button>
              <el-button type="warning" size="large" plain @click="$router.push('/')">
                继续逛逛
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 商品详情介绍 (模拟富文本) -->
    <div class="detail-content">
      <el-divider content-position="left">商品详情</el-divider>
      <div class="rich-text">
        <p>这里是 {{ product.name }} 的详细介绍页面。</p>
        <p>（注：由于毕设时间有限，这里暂时没有做富文本编辑器，实际项目中这里会展示长图或详细参数表。）</p>
      </div>
    </div>
  </div>
  
  <!-- 加载状态 -->
  <el-skeleton v-else :rows="5" animated style="padding: 20px;" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getProductDetailAPI, type Product } from '../api/product';
import { addToCartAPI } from '../api/cart';
import { ElMessage } from 'element-plus';

const route = useRoute();
const product = ref<Product | null>(null);
const quantity = ref(1);

onMounted(async () => {
  const id = Number(route.params.id);
  await loadProduct(id);
});

const loadProduct = async (id: number) => {
  try {
    const res: any = await getProductDetailAPI(id);
    product.value = res.data;
  } catch (error) {
    ElMessage.error('商品加载失败，可能已下架');
  }
};

const handleAddToCart = async () => {
  if (!product.value) return;
  try {
    // 调用之前写好的加购 API，传入当前选中的数量
    await addToCartAPI(product.value.id, quantity.value);
    ElMessage.success(`成功将 ${quantity.value} 件商品加入购物车`);
  } catch (error) {
    ElMessage.error('加购失败');
  }
};
</script>

<style scoped>
.product-detail-container {
  max-width: 1000px;
  margin: 20px auto;
}

.detail-layout {
  display: flex;
  gap: 40px;
}

.image-section {
  width: 400px;
  height: 400px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.main-image {
  max-width: 100%;
  max-height: 100%;
}

.info-section {
  flex: 1;
}

.title {
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 10px;
}
.desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.price-box {
  background: #fdf5f5;
  padding: 15px;
  color: #e4393c;
  margin-bottom: 20px;
  border-radius: 4px;
}
.currency {
  font-size: 18px;
}
.price {
  font-size: 32px;
  font-weight: bold;
}

.meta-row {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}
.label {
  display: inline-block;
  width: 50px;
}

.action-area {
  margin-top: 30px;
  border-top: 1px dashed #eee;
  padding-top: 20px;
}
.qty-row {
  margin-bottom: 20px;
}
.btn-row {
  display: flex;
  gap: 15px;
}

.detail-content {
  margin-top: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>