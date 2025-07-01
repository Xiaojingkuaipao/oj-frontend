# Vue3 + TypeScript 在线对战功能使用指南

## 功能概述

本项目实现了完整的Vue3 + TypeScript在线1v1对战功能，包括匹配、WebSocket实时通信、代码提交和判题结果处理等核心功能。

## 🚀 核心功能

### 1. 匹配系统
- **即时匹配**: 点击"开始对战"后立即尝试匹配
- **轮询机制**: 匹配失败时自动进入轮询状态，每2秒查询一次
- **超时处理**: 匹配超时自动取消，避免无限等待

### 2. WebSocket通信
- **自动连接**: 匹配成功后自动建立WebSocket连接
- **消息处理**: 支持题目获取、答案提交、结果查询等消息类型
- **断线重连**: 连接断开时自动重连，确保对战稳定性

### 3. 实时对战
- **题目同步**: 双方同时收到相同题目
- **代码提交**: 支持多种编程语言（Java、C++、Python、JavaScript）
- **实时判题**: 提交后实时显示判题状态和结果
- **胜负判定**: 首先答对题目的一方获胜

### 4. 状态管理
- **Vuex集成**: 使用Vuex管理全局对战状态
- **TypeScript支持**: 完整的类型定义，确保代码安全性
- **组合式API**: 提供便捷的useMatch hook

## 📁 项目结构

```
src/
├── types/match.ts              # TypeScript类型定义
├── utils/
│   ├── websocket.ts           # WebSocket管理工具类
│   └── global.ts              # 全局工具函数
├── store/match.ts             # Vuex状态管理模块
├── composables/useMatch.ts    # 组合式API Hook
└── views/match/
    ├── MatchWaitingView.vue   # 匹配等待页面
    ├── BattleView.vue         # 对战页面
    └── MatchResultView.vue    # 结果页面
```

## 🛠️ 技术实现

### 1. 类型定义 (`src/types/match.ts`)

定义了完整的TypeScript类型，包括：
- 匹配状态枚举 (`MatchStatus`)
- WebSocket连接状态 (`ConnectionStatus`)
- 客户端/服务端消息接口
- 对战相关数据结构

### 2. WebSocket管理 (`src/utils/websocket.ts`)

`MatchWebSocket`类提供：
- 连接管理和自动重连
- 消息发送和接收
- 心跳检测
- 事件监听机制

### 3. 状态管理 (`src/store/match.ts`)

Vuex模块包含：
- 匹配状态管理
- WebSocket连接控制
- 对战流程控制
- 错误处理

### 4. 组合式API (`src/composables/useMatch.ts`)

提供便捷的业务逻辑封装：
- 匹配相关操作
- 代码提交和查询
- 状态监听
- 错误处理

## 🔗 API接口

### HTTP接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/match` | GET | 开始匹配 |
| `/api/querymatch` | GET | 查询匹配结果 |

### WebSocket消息

#### 客户端发送消息

```typescript
interface ClientMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "QUERY_SUBMIT" | "GIVEUP_PLAY";
  roomId?: string;
  questionId?: string;
  code?: string;
  language?: string;
  questionSubmitId?: string;
}
```

#### 服务端返回消息

```typescript
interface ServerMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "QUERY_SUBMIT" | "GIVEUP_PLAY" | "MATCH_START" | "OPPONENT_GIVEUP";
  questionId?: string;
  title?: string;
  content?: string;
  judgeConfig?: object;
  tags?: string[];
  questionSubmitId?: string;
  ans_success?: 0 | 1 | 2; // 0:判题中 1:答案错误 2:有人答对
  userId?: string;
  userName?: string;
  message?: string;
}
```

## 📝 使用方法

### 1. 开始对战

在主页点击"开始对战"按钮：

```vue
<template>
  <a-button type="primary" @click="startMatch">
    开始对战
  </a-button>
</template>

<script setup>
import { useMatch } from '@/composables/useMatch'

const { startMatching } = useMatch()

const startMatch = async () => {
  await startMatching()
  router.push('/match/waiting')
}
</script>
```

### 2. 匹配等待

系统会自动进入匹配状态，显示等待界面：
- 显示匹配状态
- 支持取消匹配
- 匹配成功后显示对手信息

### 3. 开始对战

匹配成功后可以开始对战：
- 自动获取题目
- 显示代码编辑器
- 支持实时提交

### 4. 代码提交

```typescript
const { submitCode } = useMatch()

const handleSubmit = async () => {
  await submitCode(code.value, language.value)
}
```

### 5. 查看结果

对战结束后自动跳转到结果页面：
- 显示胜负结果
- 显示对战统计
- 支持再次对战

## ⚙️ 配置说明

### WebSocket配置

```typescript
const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: "ws://localhost:8080/ws", // WebSocket服务器地址
  reconnectInterval: 3000,        // 重连间隔（毫秒）
  maxReconnectAttempts: 5,        // 最大重连次数
  heartbeatInterval: 30000,       // 心跳间隔（毫秒）
}
```

### 轮询配置

```typescript
const DEFAULT_POLLING_CONFIG: PollingConfig = {
  interval: 2000,      // 轮询间隔（毫秒）
  maxAttempts: 60,     // 最大尝试次数
  timeout: 120000,     // 超时时间（毫秒）
}
```

## 🎯 最佳实践

### 1. 错误处理

所有异步操作都包含完整的错误处理：

```typescript
try {
  await startMatching()
} catch (error) {
  console.error('匹配失败:', error)
  Message.error('匹配失败，请稍后重试')
}
```

### 2. 状态监听

使用computed和watch监听状态变化：

```typescript
const isMatching = computed(() => store.getters['match/isMatching'])

watch(isMatching, (newValue) => {
  if (newValue) {
    console.log('开始匹配')
  }
})
```

### 3. 生命周期管理

在组件卸载时清理资源：

```typescript
onBeforeUnmount(() => {
  if (isMatching.value) {
    cancelMatching()
  }
})
```

## 🔧 自定义扩展

### 1. 添加新的消息类型

在`types/match.ts`中扩展消息接口：

```typescript
interface ClientMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "YOUR_NEW_TYPE";
  // 添加新字段
}
```

### 2. 扩展状态管理

在`store/match.ts`中添加新的mutations和actions：

```typescript
mutations: {
  YOUR_NEW_MUTATION(state, payload) {
    // 处理状态变更
  }
},

actions: {
  async yourNewAction({ commit }) {
    // 处理业务逻辑
  }
}
```

### 3. 扩展组合式API

在`composables/useMatch.ts`中添加新的业务逻辑：

```typescript
export function useMatch() {
  // 现有逻辑...
  
  const yourNewMethod = () => {
    // 新的业务逻辑
  }
  
  return {
    // 现有返回值...
    yourNewMethod,
  }
}
```

## 🐛 故障排除

### 1. WebSocket连接失败

- 检查WebSocket服务器地址是否正确
- 确认网络连接状态
- 查看浏览器控制台错误信息

### 2. 匹配超时

- 检查后端匹配服务是否正常
- 调整轮询配置参数
- 查看网络请求状态

### 3. 状态不同步

- 确认Vuex状态管理配置正确
- 检查组件是否正确订阅状态
- 查看状态变更日志

## 📚 相关文档

- [Vue3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vuex 官方文档](https://vuex.vuejs.org/)
- [Arco Design Vue 文档](https://arco.design/vue)

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License
