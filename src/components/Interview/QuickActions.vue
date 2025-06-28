<template>
  <div class="quick-actions">
    <button
      v-for="action in quickActions"
      :key="action"
      class="quick-btn"
      @click="$emit('quick-reply', action)"
    >
      {{ action }}
    </button>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
defineEmits(["quick-reply"]);

const quickActions = [
  "我准备好了",
  "请重复一下问题",
  "我需要时间思考",
  "可以给个提示吗",
];
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}
</style>
