# Zero Mall - 基于 LLM 上下文感知的电商系统实验

![Vue.js](https://img.shields.io/badge/vue-%2335495e.svg?style=flat&logo=vuedotjs&logoColor=%234FC08D)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **A Full-Stack E-Commerce Demo integrated with Context-Aware AI Assistant.**

这是一个基于 **Vue 3** 和 **Node.js** 构建的全栈电子商城项目。

本项目的核心实验目的是：**探索在大语言模型（LLM）应用中，如何通过后端业务数据的“上下文注入 (Context Injection)”，实现具备业务感知能力的 AI 导购。**

*本项目为毕业设计/学习演示性质，非生产级应用。*

## 📸 项目预览 (Preview)

<!-- 建议在这里放 1-2 张 GIF 或截图，比如首页轮播图、AI 侧边栏对话的截图 -->
<div align="center">
    <img src="client/public/images/demo-home.png" alt="首页预览" width="45%">
    <img src="client/public/images/demo-chat.png" alt="AI对话预览" width="45%">
</div>

## 🛠 技术栈 (Tech Stack)

### 前端 (Frontend)
- **Core:** Vue 3 (Composition API + Setup Sugar)
- **Language:** TypeScript
- **Build:** Vite
- **UI Framework:** Element Plus
- **Routing:** Vue Router 4 (动态路由 & 路由守卫)
- **Network:** Axios (封装拦截器)

### 后端 (Backend)
- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Database:** MySQL 8.0
- **ORM:** Prisma (Schema-first design)
- **AI Integration:** OpenAI SDK (接入 DeepSeek V3 API)

## ✨ 核心特性 (Key Features)

### 1. 电商基础闭环
- **用户体系**：JWT 认证、注册/登录、RBAC 权限控制（普通用户/管理员）。
- **商品系统**：列表筛选、模糊搜索、分类过滤、详情页展示。
- **交易系统**：购物车（侧边抽屉式）、原子化下单事务、历史订单查询。
- **管理后台**：管理员专属的商品上架与物理删除功能。

### 2. AI 导购看板娘 (RAG-Lite)
不同于普通的聊天机器人，本项目实现了基于当前用户状态的 **Prompt Engineering**：
- **身份感知**：AI 知道正在对话的用户是谁，以及其历史消费能力。
- **意图识别**：自动读取用户购物车内容，进行关联推荐。
- **场景感知**：当用户位于“商品详情页”时，AI 会自动获取 URL 中的商品 ID，并读取数据库详情，实现针对当前商品的精准问答（如：“这个贵吗？”）。

## 🚀 快速开始 (Getting Started)

### 前置要求
- Node.js (v16+)
- MySQL (v8.0+)
- Git

### 1. 克隆项目
```bash
git clone https://github.com/xs482820/graduationProject_itStore.git
cd graduationProject_itStore
2. 后端设置 (Server)
code
Bash
cd server

# 安装依赖
npm install

# 配置环境变量
# 复制 .env.example 为 .env，并填入你的 MySQL 地址和 DeepSeek API Key
# 格式示例:
# DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_zero"
# DEEPSEEK_API_KEY="sk-xxxxxxxx"

# 数据库迁移 (自动建表)
npx prisma migrate dev --name init

# 填充测试数据 (可选)
npx ts-node prisma/seed.ts

# 启动开发服务器 (默认端口 3000)
npm run dev
3. 前端设置 (Client)
code
Bash
cd client

# 安装依赖
npm install

# 启动前端 (默认端口 5173)
npm run dev
访问 http://localhost:5173 即可看到项目。
📂 项目结构 (Structure)
code
Text
graduationProject_itStore/
├── client/                 # 前端工程
│   ├── src/
│   │   ├── api/            # Axios 请求封装
│   │   ├── components/     # 公共组件 (GlobalHeader, ChatWidget)
│   │   ├── layout/         # 布局组件
│   │   ├── views/          # 页面视图 (Home, Cart, ProductDetail...)
│   │   └── utils/          # 工具函数
├── server/                 # 后端工程
│   ├── prisma/             # 数据库模型与迁移文件
│   ├── src/
│   │   ├── controllers/    # 业务逻辑层
│   │   ├── routes/         # 路由定义
│   │   ├── middlewares/    # 中间件 (Auth)
│   │   └── app.ts          # 入口文件
⚠️ 局限性与反思 (Limitations)
作为一个学习性质的项目，本项目在以下方面做了简化处理（Technical Trade-offs）：
图片存储：为了演示方便，未接入 OSS 对象存储，直接使用了本地静态资源或外部链接。
支付逻辑：移除了第三方支付网关对接，采用“点击即支付”的沙箱模拟逻辑。
安全性：虽然实现了 BCrypt 加密和 JWT 校验，但缺乏由 HTTPS、Rate Limiting、CSRF 防护等构成的完整安全纵深。
并发处理：秒杀场景下的超卖问题（库存锁）仅做了数据库层面的简单事务，未引入 Redis 队列。
