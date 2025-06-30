<template>
  <div :class="['message', message.type]">
    <div v-if="message.type === 'interviewer'" class="avatar">🤖</div>
    <div class="message-content">
      <div>{{ message.content }}</div>
      <div class="message-time">{{ message.time }}</div>
    </div>
    <div v-if="message.type === 'user'" class="avatar">👤</div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.message {
  margin-bottom: 20px;
  display: flex;
  animation: fadeInUp 0.5s ease-out;
}

.message.user {
  justify-content: flex-end;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  max-width: 70%;
  padding: 15px 20px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.message.interviewer .message-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px 18px 18px 5px;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 5px 18px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 16px;
}

.message.interviewer .avatar {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b95 100%);
}

.message.user .avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-right: 0;
  margin-left: 12px;
  order: 2;
}

.message-time {
  font-size: 12px;
  color: #64748b;
  margin-top: 5px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
}
</style>
