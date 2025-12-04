<template>
  <div class="global-header">
    <div class="header-content container">
      <!-- Logo -->
      <div class="logo" @click="goHome">
        <el-icon class="logo-icon"><Shop /></el-icon>
        <span>Zero Mall</span>
      </div>

      <!-- 搜索框 -->
      <div class="search-section">
        <el-input 
          v-model="keyword" 
          placeholder="搜索商品..." 
          class="search-input"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- 右侧功能区 -->
      <div class="right-actions">
        <!-- [新增] 管理员上架按钮 -->
        <!-- 只有管理员可见 (这里暂时写死为 true 或判断 nickname) -->
        <el-tooltip content="上架新品" placement="bottom" v-if="isAdmin">
          <el-button type="primary" circle :icon="Plus" @click="dialogVisible = true" />
        </el-tooltip>

        <!-- 购物车 -->
        <el-badge :value="cartCount" :max="99" class="item-badge" :hidden="cartCount === 0">
          <el-button link @click="drawerVisible = true">
            <el-icon :size="22"><ShoppingCart /></el-icon>
            <span class="action-text">购物车</span>
          </el-button>
        </el-badge>

        <!-- 订单 -->
        <el-button link @click="orderDrawerVisible = true">
          <el-icon :size="22"><List /></el-icon>
          <span class="action-text">我的订单</span>
        </el-button>

        <!-- 用户下拉 -->
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link user-info">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="nickname">{{ nickname }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" style="color: #f56c6c;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 购物车抽屉 (保持不变) -->
    <el-drawer v-model="drawerVisible" title="我的购物车" direction="rtl" size="400px" destroy-on-close @open="loadCart">
       <div class="cart-drawer-content" v-loading="loading">
        <div v-if="cartList.length > 0" class="cart-layout">
          <div class="cart-items">
            <div v-for="item in cartList" :key="item.id" class="cart-item">
              <div class="item-img-box">
                <img :src="item.product.cover" class="item-img" />
              </div>
              <div class="item-info">
                <h4 class="item-title">{{ item.product.name }}</h4>
                <div class="item-meta">
                  <span class="item-price">¥{{ item.product.price }}</span>
                  <span class="item-qty">x {{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <div class="total-row">
              <span>合计：</span>
              <span class="total-price">¥ {{ totalPrice }}</span>
            </div>
            <el-button type="primary" size="large" style="width: 100%" @click="handleCheckout">立即结算</el-button>
          </div>
        </div>
        <el-empty v-else description="购物车空空如也" />
      </div>
    </el-drawer>

    <!-- [新增] 上架弹窗 (搬家过来的) -->
    <el-dialog v-model="dialogVisible" title="上架新商品" width="500px" destroy-on-close>
      <el-form :model="newProduct" label-width="80px">
        <el-form-item label="名称"><el-input v-model="newProduct.name" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="newProduct.price" :min="0.1" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="newProduct.stock" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="newProduct.category" placeholder="选择分类" style="width: 100%">
            <el-option label="数码科技" value="electronics" />
            <el-option label="美味零食" value="food" />
            <el-option label="生活用品" value="daily" />
            <el-option label="办公家居" value="furniture" />
          </el-select>
        </el-form-item>
        <!-- 修复点：rows 前面加冒号 -->
        <el-form-item label="描述">
          <el-input v-model="newProduct.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="newProduct.cover" placeholder="推荐使用短链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddProduct" :loading="submitting">确认上架</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="orderDrawerVisible"
      title="我的历史订单"
      direction="rtl"
      size="600px"
      destroy-on-close
      @open="loadOrders"
    >
      <div class="order-drawer-content" v-loading="orderLoading">
        <el-scrollbar>
          <div v-if="orderList.length > 0">
            <!-- 循环渲染每个订单卡片 (比表格在抽屉里更好看) -->
            <el-card 
              v-for="order in orderList" 
              :key="order.id" 
              shadow="hover" 
              class="order-card"
            >
              <template #header>
                <div class="order-header">
                  <span class="order-time">{{ new Date(order.createdAt).toLocaleString() }}</span>
                  <el-tag type="success" size="small">已支付</el-tag>
                </div>
              </template>
              
              <!-- 订单里的商品列表 -->
              <div v-for="item in order.items" :key="item.id" class="order-item-row">
                <span class="o-name">{{ item.name }}</span>
                <span class="o-qty">x{{ item.quantity }}</span>
                <span class="o-price">¥{{ item.price }}</span>
              </div>
              
              <div class="order-footer">
                <span>总计：</span>
                <span class="total-price">¥{{ order.totalAmount }}</span>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无订单，快去消费！" />
        </el-scrollbar>
      </div>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Shop, Search, ShoppingCart, List, ArrowDown, Plus } from '@element-plus/icons-vue';
import { getCartAPI, checkoutAPI } from '../api/cart';
import { createProductAPI } from '../api/product';
import { ElMessage } from 'element-plus';
import { getMyOrdersAPI } from '../api/order';

const router = useRouter();
const route = useRoute();

// 基础状态
const keyword = ref('');
const nickname = ref('用户');
const cartCount = ref(0);
const isAdmin = ref(false);

// 购物车状态
const drawerVisible = ref(false);
const loading = ref(false);
const cartList = ref<any[]>([]);

// [新增] 订单抽屉状态
const orderDrawerVisible = ref(false);
const orderLoading = ref(false);
const orderList = ref<any[]>([]);

// [新增] 加载订单逻辑
const loadOrders = async () => {
  orderLoading.value = true;
  try {
    const res: any = await getMyOrdersAPI();
    orderList.value = res.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    orderLoading.value = false;
  }
};

// [新增] 上架弹窗状态
const dialogVisible = ref(false);
const submitting = ref(false);
const newProduct = reactive({
  name: '',
  price: 99,
  stock: 100,
  category: 'electronics',
  description: '',
  cover: ''
});

onMounted(() => {
  nickname.value = localStorage.getItem('nickname') || '顾客';
  if (route.query.q) keyword.value = route.query.q as string;
  
  // [新增] 检查权限
  const role = localStorage.getItem('role');
  // 只有当角色完全等于 'admin' 时，才认为是管理员
  isAdmin.value = role === 'admin';
});

// 搜索
const handleSearch = () => router.push({ path: '/', query: { q: keyword.value } });
const goHome = () => { keyword.value = ''; router.push('/'); };
const handleCommand = (cmd: string) => { if(cmd==='logout'){ localStorage.clear(); router.push('/login'); }};

// 购物车逻辑
const loadCart = async () => {
  loading.value = true;
  try {
    const res: any = await getCartAPI();
    cartList.value = res.data || [];
    cartCount.value = cartList.value.reduce((s:number, i:any)=>s+i.quantity,0);
  } finally { loading.value = false; }
};
const totalPrice = computed(() => cartList.value.reduce((s:number, i:any)=>s+i.quantity*Number(i.product.price),0).toFixed(2));
const handleCheckout = async () => {
  try {
    await checkoutAPI();
    ElMessage.success('支付成功');
    drawerVisible.value = false;
    cartList.value = [];
    cartCount.value = 0;
    if(route.path === '/orders') window.location.reload();
  } catch(e) { ElMessage.error('失败'); }
};

// [新增] 上架逻辑
const handleAddProduct = async () => {
  if (!newProduct.name) {
    ElMessage.warning('请输入名称');
    return;
  }
  submitting.value = true;
  try {
    await createProductAPI(newProduct);
    ElMessage.success('上架成功！');
    dialogVisible.value = false;
    // 重置
    newProduct.name = ''; newProduct.description = ''; newProduct.cover = '';
    
    // 刷新页面，让用户看到新商品 (最简单的办法)
    window.location.reload();
  } catch (error) {
    ElMessage.error('上架失败，请检查网络或URL是否过长');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* 保持原有的样式，这里只列出新增的 */
.global-header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo { font-size: 22px; font-weight: 800; color: var(--el-color-primary); display: flex; align-items: center; gap: 8px; cursor: pointer; }
.search-section { flex: 1; max-width: 500px; margin: 0 40px; }
.right-actions { display: flex; align-items: center; gap: 20px; }
.action-text { margin-left: 4px; font-size: 14px; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.nickname { font-size: 14px; max-width: 100px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

/* 购物车相关样式 */
.cart-drawer-content { height: 100%; display: flex; flex-direction: column; }
.cart-layout { height: 100%; display: flex; flex-direction: column; }
.cart-items { flex: 1; overflow-y: auto; padding: 0 5px; }
.cart-item { display: flex; gap: 12px; border-bottom: 1px solid #f0f0f0; padding: 15px 0; }
.item-img-box { width: 70px; height: 70px; border-radius: 6px; overflow: hidden; border: 1px solid #f0f0f0; flex-shrink: 0; }
.item-img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.item-title { margin: 0; font-size: 14px; line-height: 1.4; color: #333; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-meta { display: flex; justify-content: space-between; align-items: center; }
.item-price { color: #f56c6c; font-weight: bold; }
.item-qty { color: #999; font-size: 13px; }
.drawer-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #eee; }
.total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 16px; font-weight: bold; }
.total-price { color: #f56c6c; font-size: 24px; }

/* 订单抽屉样式 */
.order-drawer-content { height: 100%; }
.order-card { margin-bottom: 15px; border-radius: 8px; }
.order-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #999; }
.order-item-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
.o-name { flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.o-qty { margin: 0 10px; color: #999; }
.order-footer { margin-top: 10px; text-align: right; font-weight: bold; }
</style>