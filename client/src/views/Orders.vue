<template>
  <div class="container">
    <el-card>
      <template #header>
        <div class="header">
          <span>我的历史订单</span>
          <el-button @click="$router.push('/')">返回首页</el-button>
        </div>
      </template>

      <el-table :data="orderList" style="width: 100%" empty-text="暂无订单，快去消费！">
        <!-- 1. 展开行：显示订单里的具体商品 -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="order-items">
              <div v-for="item in props.row.items" :key="item.id" class="item-row">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">x {{ item.quantity }}</span>
                <span class="item-price">¥ {{ item.price }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 2. 订单基本信息 -->
        <el-table-column label="订单号" prop="id" width="100" />
        <el-table-column label="下单时间" width="220">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="总金额">
          <template #default="scope">
            <span class="total-price">¥ {{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === 'paid'">已支付</el-tag>
            <el-tag type="warning" v-else>待支付</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyOrdersAPI } from '../api/order';
import { ElMessage } from 'element-plus';

const orderList = ref([]);

onMounted(async () => {
  try {
    const res: any = await getMyOrdersAPI();
    orderList.value = res.data;
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  }
});
</script>

<style scoped>
.container {
  width: var(--zero-container-width);
  margin: 20px auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-items {
  padding: 10px 40px;
  background-color: #f8f9fa;
}
.item-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}
.item-name {
  font-weight: bold;
}
.total-price {
  color: #f56c6c;
  font-weight: bold;
}
</style>