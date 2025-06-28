<template>
  <div class="typing-indicator">
    <span>AI面试官正在输入</span>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  </div>
</template>

<script setup>
// 纯展示组件，无需逻辑
</script>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  font-style: italic;
  margin-bottom: 10px;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #64748b;
  border-radius: 50%;
  animation: typing 1.5s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
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
</style>
