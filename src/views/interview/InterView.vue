<template>
  <div class="interview-page">
    <div class="interview-container">
      <InterviewHeader />

      <div class="chat-area" ref="chatAreaRef">
        <TypingIndicator v-if="isTyping" />

        <ChatMessage
          v-for="(message, index) in messages"
          :key="index"
          :message="message"
        />
      </div>

      <ChatInput
        :is-typing="isTyping"
        @send-message="handleSendMessage"
        @quick-reply="handleQuickReply"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import InterviewHeader from "../../components/Interview/InterviewHeader.vue";
import ChatMessage from "../../components/Interview/ChatMessage.vue";
import ChatInput from "../../components/Interview/ChatInput.vue";
import TypingIndicator from "../../components/Interview/TypingIndicator.vue";
import { useInterview } from "../../composables/useInterview";
import { useChat } from "../../composables/useChat";

const chatAreaRef = ref(null);
const { messages, isTyping, addMessage, simulateAIResponse } = useInterview();
const { scrollToBottom } = useChat(chatAreaRef);

const handleSendMessage = (content) => {
  if (!content.trim() || isTyping.value) return;

  addMessage({
    type: "user",
    content: content.trim(),
    time: formatTime(new Date()),
  });

  scrollToBottom();
  simulateAIResponse();
};

const handleQuickReply = (text) => {
  handleSendMessage(text);
};

function formatTime(date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.interview-page {
  min-height: 20vh;
  padding: -10px 20px;
  display: flex;
  justify-content: center;
  /* align-items: center; */
}
.interview-container {
  width: 100%;
  max-width: 900px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f8fafc;
}

@media (max-width: 1024px) {
  .interview-container {
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .interview-page {
    padding: 20px 10px;
  }

  .interview-container {
    max-width: 100%;
    height: 90vh;
    border-radius: 15px;
  }

  .chat-area {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .interview-page {
    padding: 10px 5px;
  }

  .interview-container {
    height: 95vh;
    border-radius: 12px;
  }

  .chat-area {
    padding: 15px;
  }
}
</style>
