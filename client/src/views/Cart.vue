<template>
  <div class="cart-container">
    <el-card>
      <template #header>
        <div class="header">
          <span>我的购物车</span>
          <el-button @click="$router.push('/')">返回首页</el-button>
        </div>
      </template>

      <!-- 购物车表格 -->
      <el-table :data="cartList" style="width: 100%" empty-text="购物车是空的">
        <el-table-column label="商品信息" width="400">
          <template #default="scope">
            <div class="product-info">
              <img :src="scope.row.product.cover" class="img-thumb"/>
              <span>{{ scope.row.product.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="单价" width="150">
          <template #default="scope">
            ¥ {{ scope.row.product.price }}
          </template>
        </el-table-column>

        <el-table-column label="数量" width="200">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="1" size="small" disabled />
          </template>
        </el-table-column>

        <el-table-column label="小计">
          <template #default="scope">
            <span class="price">
              ¥ {{ (scope.row.quantity * scope.row.product.price).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部结算栏 -->
      <div class="footer">
        <div class="total">
          总计: <span class="price">¥ {{ totalPrice }}</span>
        </div>
        <el-button type="primary" size="large" @click="handleCheckout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getCartAPI, checkoutAPI } from '../api/cart';
import { ElMessage } from 'element-plus';

const cartList = ref<any[]>([]);

onMounted(() => {
  loadCart();
});

const loadCart = async () => {
  try {
    const res: any = await getCartAPI();
    cartList.value = res.data || [];
  } catch (error) {
    ElMessage.error('加载购物车失败');
  }
};

// 计算总价
const totalPrice = computed(() => {
  let sum = 0;
  cartList.value.forEach(item => {
    sum += item.quantity * Number(item.product.price);
  });
  return sum.toFixed(2);
});

// 结算函数
const handleCheckout = async () => {
  if (cartList.value.length === 0) {
    ElMessage.warning('购物车是空的');
    return;
  }

  try {
    // 1. 调用后端下单
    await checkoutAPI();
    
    // 2. 提示成功
    ElMessage.success('支付成功！仓库正在发货...');
    
    // 3. 重新加载购物车 (此时应该变空了)
    await loadCart();
    
  } catch (error) {
    ElMessage.error('结算失败');
  }
};
</script>

<style scoped>
.cart-container {
  width: var(--zero-container-width);
  margin: 20px auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.img-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
.footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}
.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}
</style>