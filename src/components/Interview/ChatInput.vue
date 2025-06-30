<template>
  <div class="input-area">
    <QuickActions @quick-reply="handleQuickReply" />

    <div class="input-group">
      <input
        v-model="currentInput"
        @keyup.enter="sendMessage"
        class="input-field"
        placeholder="输入您的回答..."
        :disabled="isTyping"
        ref="inputRef"
      />
      <button
        @click="sendMessage"
        class="send-btn"
        :disabled="!currentInput.trim() || isTyping"
      >
        <span>发送</span>
        <span>📤</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import QuickActions from "./QuickActions.vue";

const props = defineProps({
  isTyping: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["send-message", "quick-reply"]);

const currentInput = ref("");
const inputRef = ref(null);

const sendMessage = () => {
  if (!currentInput.value.trim() || props.isTyping) return;

  emit("send-message", currentInput.value);
  currentInput.value = "";
  inputRef.value?.focus();
};

const handleQuickReply = (text) => {
  emit("quick-reply", text);
};
</script>

<style scoped>
.input-area {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.input-field {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.send-btn {
  padding: 15px 25px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .input-area {
    padding: 15px 20px;
  }
}
</style>
