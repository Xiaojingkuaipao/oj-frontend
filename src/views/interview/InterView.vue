<template>
  <div class="interview-chat">
    <div class="chat-header">
      <h2>💼 AI面试助手</h2>
      <p class="subtitle">模拟面试对话，提升面试技能</p>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div class="messages-list">
        <!-- 欢迎消息 -->
        <div class="message assistant-message">
          <div class="avatar">🤖</div>
          <div class="message-content">
            <div class="message-text">
              您好！我是您的AI面试官。今天我们来进行一场模拟面试，请放松心情，像真实面试一样回答问题。准备好了吗？
            </div>
            <div class="message-time">{{ getCurrentTime() }}</div>
          </div>
        </div>

        <!-- 历史消息 -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'message',
            message.type === 'user' ? 'user-message' : 'assistant-message',
          ]"
        >
          <div class="avatar">
            {{ message.type === "user" ? "👤" : "🤖" }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="message assistant-message">
          <div class="avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷输入按钮区域 -->
    <div class="shortcuts-container" v-if="!isLoading">
      <div class="shortcuts-header">
        <span>💡 快捷回复</span>
        <button @click="toggleShortcuts" class="toggle-btn">
          {{ showShortcuts ? "收起" : "展开" }}
        </button>
      </div>

      <div v-show="showShortcuts" class="shortcuts-grid">
        <button
          v-for="(shortcut, index) in currentShortcuts"
          :key="index"
          @click="useShortcut(shortcut.text)"
          class="shortcut-btn"
        >
          <span class="shortcut-icon">{{ shortcut.icon }}</span>
          <span class="shortcut-text">{{ shortcut.label }}</span>
        </button>
      </div>

      <!-- 切换快捷按钮类型 -->
      <div class="shortcut-tabs">
        <button
          v-for="(tab, key) in shortcutTabs"
          :key="key"
          @click="currentShortcutTab = key"
          :class="['tab-btn', { active: currentShortcutTab === key }]"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <input
          v-model="currentInput"
          type="text"
          placeholder="请输入您的回答..."
          @keyup.enter="sendMessage"
          :disabled="isLoading"
          class="message-input"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !currentInput.trim()"
          class="send-btn"
        >
          <span v-if="isLoading">⏳</span>
          <span v-else>📤</span>
        </button>
      </div>
      <div class="input-actions">
        <button @click="clearChat" class="action-btn" :disabled="isLoading">
          🗑️ 清空对话
        </button>
        <button
          @click="startNewInterview"
          class="action-btn"
          :disabled="isLoading"
        >
          🆕 重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, defineExpose, computed } from "vue";

// 响应式数据
const currentInput = ref("");
const messages = ref([]);
const isLoading = ref(false);
const chatContainer = ref(null);
const showShortcuts = ref(true);
const currentShortcutTab = ref("basic");

// API基础URL
const API_BASE_URL = "http://139.9.144.238:8120";

// 快捷输入按钮配置
const shortcutTabs = {
  basic: {
    name: "基础回复",
    shortcuts: [
      {
        icon: "👋",
        label: "自我介绍",
        text: "您好，我先简单介绍一下自己。我叫...",
      },
      { icon: "💼", label: "工作经验", text: "关于我的工作经验，我之前在..." },
      { icon: "🎓", label: "教育背景", text: "我的教育背景是..." },
      { icon: "🚀", label: "职业规划", text: "对于未来的职业规划，我希望..." },
      { icon: "💪", label: "技能特长", text: "我的专业技能包括..." },
      { icon: "⭐", label: "项目经验", text: "我参与过的重要项目有..." },
    ],
  },
  technical: {
    name: "技术相关",
    shortcuts: [
      { icon: "💻", label: "编程语言", text: "我熟悉的编程语言有..." },
      { icon: "🔧", label: "开发工具", text: "我常用的开发工具包括..." },
      { icon: "📊", label: "数据库", text: "在数据库方面，我有..." },
      { icon: "🌐", label: "Web技术", text: "关于Web开发技术，我掌握..." },
      { icon: "📱", label: "移动开发", text: "在移动端开发方面..." },
      { icon: "☁️", label: "云服务", text: "我有使用过云服务平台..." },
    ],
  },
  situation: {
    name: "情景问题",
    shortcuts: [
      {
        icon: "🤔",
        label: "需要思考",
        text: "这是一个很好的问题，让我想一下...",
      },
      { icon: "📝", label: "举例说明", text: "我可以举个具体的例子来说明..." },
      { icon: "💡", label: "解决方案", text: "遇到这种情况，我会..." },
      { icon: "👥", label: "团队合作", text: "在团队协作中，我通常..." },
      { icon: "⚡", label: "应急处理", text: "面对紧急情况，我的做法是..." },
      { icon: "📈", label: "成长学习", text: "从这个经历中我学到了..." },
    ],
  },
  closing: {
    name: "结束语",
    shortcuts: [
      { icon: "❓", label: "反问问题", text: "我想了解一下公司/团队的..." },
      { icon: "🙏", label: "表示感谢", text: "非常感谢您的时间，我很期待..." },
      { icon: "💭", label: "补充说明", text: "我想补充一点..." },
      {
        icon: "🎯",
        label: "表达兴趣",
        text: "我对这个职位非常感兴趣，因为...",
      },
      { icon: "📞", label: "后续联系", text: "请问后续的流程是怎样的？" },
      {
        icon: "✨",
        label: "结束面试",
        text: "综合来看，请给我的面试效果打分，分值在1-10之间",
      },
    ],
  },
};

// 当前快捷按钮
const currentShortcuts = computed(() => {
  return shortcutTabs[currentShortcutTab.value]?.shortcuts || [];
});

// 获取当前时间
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 使用快捷输入
const useShortcut = (text) => {
  currentInput.value = text;
  // 自动发送或者让用户修改后发送
  // sendMessage(); // 如果要自动发送，取消注释这行
};

// 切换快捷按钮显示/隐藏
const toggleShortcuts = () => {
  showShortcuts.value = !showShortcuts.value;
};

// 发送消息
const sendMessage = async () => {
  if (!currentInput.value.trim() || isLoading.value) {
    return;
  }

  const userMessage = {
    type: "user",
    content: currentInput.value,
    time: getCurrentTime(),
  };

  messages.value.push(userMessage);

  // 构建面试对话上下文
  const interviewContext = `作为一名专业的面试官，请基于以下对话历史继续进行面试对话。请保持专业、友好的面试官语调，并根据应聘者的回答提出合适的后续问题,不用把你的动作模拟返回出来，只用说内容。

对话历史：
${messages.value
  .map((msg) => `${msg.type === "user" ? "应聘者" : "面试官"}：${msg.content}`)
  .join("\n")}

请作为面试官回复：`;

  currentInput.value = "";

  await scrollToBottom();

  isLoading.value = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/spark/ask/stream?question=${encodeURIComponent(
        interviewContext
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("响应 body 为空，可能是网络或 CORS 问题");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 创建助手消息
    const assistantMessage = {
      type: "assistant",
      content: "",
      time: getCurrentTime(),
    };

    messages.value.push(assistantMessage);
    await scrollToBottom();

    // 处理流式响应
    const processStream = async () => {
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
          await scrollToBottom();
        }
      } catch (error) {
        console.error("Stream processing error:", error);
        throw error;
      }
    };

    await processStream();
  } catch (error) {
    console.error("Request failed:", error);
    const errorMessage = {
      type: "assistant",
      content: `抱歉，网络连接出现问题：${error.message}。请稍后再试。`,
      time: getCurrentTime(),
    };
    messages.value.push(errorMessage);
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

// 清空对话
const clearChat = () => {
  messages.value = [];
};

// 开始新面试
const startNewInterview = async () => {
  messages.value = [];
  currentInput.value = "";

  // 发送开场白
  isLoading.value = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/spark/ask/stream?question=${encodeURIComponent(
        "请作为一名专业的面试官，开始一场新的面试。请先做自我介绍，然后询问应聘者的基本情况。保持专业但友好的语调。"
      )}`
    );

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const welcomeMessage = {
        type: "assistant",
        content: "",
        time: getCurrentTime(),
      };

      messages.value.push(welcomeMessage);
      await scrollToBottom();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        welcomeMessage.content += chunk;
        await scrollToBottom();
      }
    }
  } catch (error) {
    console.error("Failed to start new interview:", error);
  } finally {
    isLoading.value = false;
  }
};

// 暴露方法
defineExpose({
  sendMessage,
  clearChat,
  startNewInterview,
});
</script>

<style scoped>
.interview-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f8f9fa;
  font-family: "Arial", sans-serif;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5em;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9em;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #ffffff;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  flex-shrink: 0;
}

.user-message .avatar {
  background-color: #007bff;
}

.assistant-message .avatar {
  background-color: #28a745;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-message .message-content {
  align-items: flex-end;
}

.message-text {
  background-color: #f1f3f4;
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.user-message .message-text {
  background-color: #007bff;
  color: white;
}

.message-time {
  font-size: 0.75em;
  color: #6c757d;
  padding: 0 8px;
}

.typing-indicator {
  background-color: #f1f3f4;
  padding: 12px 16px;
  border-radius: 18px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

/* 快捷输入按钮样式 */
.shortcuts-container {
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
  padding: 15px 20px;
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shortcuts-header span {
  font-size: 0.9em;
  color: #6c757d;
  font-weight: 500;
}

.toggle-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 15px;
  padding: 4px 12px;
  font-size: 0.8em;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

.shortcut-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85em;
}

.shortcut-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.shortcut-icon {
  font-size: 1em;
}

.shortcut-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shortcut-tabs {
  display: flex;
  gap: 5px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 15px;
  background-color: white;
  color: #6c757d;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: #f8f9fa;
}

.tab-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.input-container {
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #007bff;
}

.message-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.send-btn {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.input-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background-color: white;
  color: #6c757d;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .interview-chat {
    height: 100vh;
  }

  .chat-header {
    padding: 15px;
  }

  .chat-container {
    padding: 15px;
  }

  .message-content {
    max-width: 85%;
  }

  .shortcuts-container {
    padding: 10px 15px;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .shortcut-btn {
    padding: 8px 10px;
    font-size: 0.8em;
  }

  .shortcut-tabs {
    gap: 3px;
  }

  .tab-btn {
    padding: 5px 10px;
    font-size: 0.75em;
  }

  .input-container {
    padding: 15px;
  }

  .message-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>
