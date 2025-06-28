<template>
  <div class="header">
    <h1>🤖面试官</h1>
    <div class="status">
      <div class="status-dot"></div>
      <span>在线中</span>
    </div>
  </div>
</template>

<script setup>
// 可以添加头部相关的逻辑，比如结束面试、重新开始等
</script>

<style scoped>
.header {
  padding: 20px 30px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
  }
}
</style>
