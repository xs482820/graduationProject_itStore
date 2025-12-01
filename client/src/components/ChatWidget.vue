<template>
  <div class="chat-widget">
    <!-- 1. 悬浮球 (平时缩成一个球) -->
    <div v-if="!isOpen" class="chat-ball" @click="toggleChat">
      <el-icon size="24"><Comment /></el-icon>
      <span class="ball-text">找零零</span>
    </div>

    <!-- 2. 聊天窗口 (点开后显示) -->
    <transition name="el-zoom-in-bottom">
      <div v-if="isOpen" class="chat-box">
        <!-- 标题栏 -->
        <div class="chat-header">
          <span>Zero (看板娘)</span>
          <el-icon class="close-btn" @click="toggleChat"><Close /></el-icon>
        </div>

        <!-- 消息列表区 -->
        <div class="chat-messages" ref="msgListRef">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message-row', msg.role === 'user' ? 'row-right' : 'row-left']"
          >
            <!-- 头像 -->
            <el-avatar 
              :size="30" 
              :src="msg.role === 'user' ? 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' : 'https://api.iconify.design/carbon:ibm-watson-knowledge-studio.svg'" 
              style="background: #fff"
            />
            
            <!-- 气泡 -->
            <div class="bubble">
              {{ msg.content }}
            </div>
          </div>
          
          <!-- 加载中动画 -->
          <div v-if="isLoading" class="message-row row-left">
            <el-avatar :size="30" src="https://api.iconify.design/carbon:ibm-watson-knowledge-studio.svg" style="background: #fff"/>
            <div class="bubble loading">
              Thinking...
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="chat-input">
          <el-input
            v-model="inputText"
            placeholder="问问有什么推荐..."
            @keyup.enter="handleSend"
            :disabled="isLoading"
          >
            <template #append>
              <el-button @click="handleSend" :loading="isLoading">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Comment, Close } from '@element-plus/icons-vue';
import { chatAPI } from '../api/ai';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const isOpen = ref(false);
const isLoading = ref(false);
const inputText = ref('');
const msgListRef = ref<HTMLElement | null>(null);

// 初始对话历史
const messages = ref<Message[]>([
  { role: 'ai', content: '哼，又来逛商城了？想要什么直接说，本小姐没空猜你的心思。' }
]);

// 切换开关
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  scrollToBottom();
};

// 发送消息
const handleSend = async () => {
  const text = inputText.value.trim();
  if (!text) return;

  // 1. 推入用户消息
  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  scrollToBottom();

  // 2. 请求 AI
  isLoading.value = true;
  try {
    const res: any = await chatAPI(text);
    // 3. 推入 AI 回复
    messages.value.push({ role: 'ai', content: res.reply });
  } catch (error) {
    messages.value.push({ role: 'ai', content: '我累了，连不上服务器...' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999; /* 保证在最上层 */
}

/* 悬浮球样式 */
.chat-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.3s;
}
.chat-ball:hover {
  transform: scale(1.1);
}
.ball-text {
  font-size: 10px;
  margin-top: 2px;
}

/* 聊天窗口样式 */
.chat-box {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transform-origin: bottom right;
}

.chat-header {
  height: 50px;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  font-weight: bold;
}
.close-btn {
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f5f7fa;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: flex-start;
}
.row-right {
  flex-direction: row-reverse;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
.row-left .bubble {
  background: white;
  border: 1px solid #e4e7ed;
  border-top-left-radius: 0;
}
.row-right .bubble {
  background: var(--el-color-primary);
  color: white;
  border-top-right-radius: 0;
}
.loading {
  color: #999;
  font-style: italic;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #ebeef5;
}
</style>