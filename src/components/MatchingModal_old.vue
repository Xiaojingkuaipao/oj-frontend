<template>
  <a-modal
    v-model:visible="visible"
    title="在线匹配"
    :closable="false"
    :mask-closable="false"
    :footer="false"
    width="480px"
    :body-style="{ textAlign: 'center', padding: '40px 24px' }"
  >
    <!-- 匹配中状态 -->
    <div v-if="status === 'matching'" class="matching-container">
      <div class="loading-animation">
        <a-spin size="large" />
      </div>
      <div class="matching-text">
        <h3>正在匹配对手...</h3>
        <p class="waiting-time">已等待: {{ formatTime(waitingTime) }}</p>
        <p class="tips">请耐心等待，我们正在为您寻找合适的对手</p>
      </div>
      <a-button
        type="outline"
        size="large"
        @click="cancelMatching"
        class="cancel-btn"
      >
        取消匹配
      </a-button>
    </div>

    <!-- 匹配成功状态 -->
    <div v-else-if="status === 'matched'" class="matched-container">
      <div class="success-icon">
        <a-icon size="64">
          <icon-check-circle-fill style="color: #00b42a" />
        </a-icon>
      </div>
      <h3>匹配成功！</h3>
      <div class="opponent-info">
        <a-avatar :size="64" class="opponent-avatar">
          <img :src="opponentInfo.avatar" />
        </a-avatar>
        <div class="opponent-details">
          <h4>{{ opponentInfo.userName }}</h4>
          <p>等级: {{ opponentInfo.level }}</p>
          <p>胜率: {{ opponentInfo.winRate }}%</p>
        </div>
      </div>
      <div class="countdown">
        <h2>{{ countdown }}</h2>
        <p>秒后开始对战</p>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { IconCheckCircleFill } from "@arco-design/web-vue/es/icon";
import message from "@arco-design/web-vue/es/message";

// Props
interface Props {
  modelValue: boolean;
}

// 对手信息接口
interface OpponentInfo {
  userName: string;
  avatar: string;
  level: string;
  winRate: number;
}

// Emits
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "matched", opponentInfo: OpponentInfo): void;
  (e: "cancelled"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const status = ref<"matching" | "matched">("matching");
const waitingTime = ref(0);
const countdown = ref(3);
const opponentInfo = ref<OpponentInfo>({
  userName: "智能对手",
  avatar:
    "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp",
  level: "Gold",
  winRate: 85,
});

let matchingTimer: number | null = null;
let countdownTimer: number | null = null;

// 格式化时间显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// 开始匹配
const startMatching = () => {
  console.log("开始匹配...");
  status.value = "matching";
  waitingTime.value = 0;

  // 启动等待时间计时器
  matchingTimer = window.setInterval(() => {
    waitingTime.value++;
    console.log("等待时间:", waitingTime.value);

    // 2秒后匹配成功（演示效果）
    if (waitingTime.value >= 2) {
      matchSuccess();
    }
  }, 1000);
};

// 匹配成功
const matchSuccess = () => {
  console.log("匹配成功！");
  if (matchingTimer) {
    clearInterval(matchingTimer);
    matchingTimer = null;
  }

  status.value = "matched";
  countdown.value = 3;

  message.success("匹配成功！");

  // 开始倒计时
  countdownTimer = window.setInterval(() => {
    countdown.value--;
    console.log("倒计时:", countdown.value);
    if (countdown.value <= 0) {
      enterBattle();
    }
  }, 1000);
};

// 进入对战
const enterBattle = () => {
  console.log("进入对战房间");
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  visible.value = false;
  emit("matched", opponentInfo.value);
};

// 取消匹配
const cancelMatching = () => {
  console.log("取消匹配");
  if (matchingTimer) {
    clearInterval(matchingTimer);
    matchingTimer = null;
  }

  visible.value = false;
  emit("cancelled");
  message.info("已取消匹配");
};

// 清理定时器
onUnmounted(() => {
  if (matchingTimer) {
    clearInterval(matchingTimer);
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

// 监听弹窗显示状态变化
watch(
  () => props.modelValue,
  (newValue) => {
    console.log("Modal 显示状态变化:", newValue);
    if (newValue) {
      // 弹窗显示时开始匹配
      setTimeout(() => {
        startMatching();
      }, 100);
    } else {
      // 弹窗关闭时重置状态
      status.value = "matching";
      waitingTime.value = 0;
      countdown.value = 3;

      if (matchingTimer) {
        clearInterval(matchingTimer);
        matchingTimer = null;
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  },
  { immediate: true }
);

// 暴露方法给父组件
defineExpose({
  startMatching,
  cancelMatching,
});
</script>

<style scoped>
.matching-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-animation {
  margin-bottom: 16px;
}

.matching-text {
  text-align: center;
}

.matching-text h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--color-text-1);
}

.waiting-time {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 8px 0;
}

.tips {
  color: var(--color-text-3);
  font-size: 14px;
  margin: 0;
}

.cancel-btn {
  margin-top: 8px;
}

.matched-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success-icon {
  margin-bottom: 8px;
}

.matched-container h3 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-1);
}

.opponent-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-fill-2);
  border-radius: 8px;
  width: 100%;
}

.opponent-avatar {
  flex-shrink: 0;
}

.opponent-details {
  flex: 1;
  text-align: left;
}

.opponent-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--color-text-1);
}

.opponent-details p {
  margin: 2px 0;
  font-size: 14px;
  color: var(--color-text-3);
}

.countdown {
  text-align: center;
}

.countdown h2 {
  margin: 0;
  font-size: 48px;
  font-weight: bold;
  color: var(--color-primary);
}

.countdown p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--color-text-3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .opponent-info {
    flex-direction: column;
    text-align: center;
  }
  
  .opponent-details {
    text-align: center;
  }
}
</style>
const countdown = ref(3);
const opponentInfo = ref<OpponentInfo>({
  userName: "智能对手",
  avatar:
    "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp",
  level: "Gold",
  winRate: 85,
});

let matchingTimer: number | null = null;
let countdownTimer: number | null = null;

// 格式化时间显示
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// 开始匹配
const startMatching = () => {
  status.value = "matching";
  waitingTime.value = 0;

  // 模拟匹配过程
  matchingTimer = window.setInterval(() => {
    waitingTime.value++;

    // 模拟在5-15秒后匹配成功
    if (waitingTime.value >= 8) {
      matchSuccess();
    }
  }, 1000);
};

// 匹配成功
const matchSuccess = () => {
  if (matchingTimer) {
    clearInterval(matchingTimer);
    matchingTimer = null;
  }

  status.value = "matched";
  countdown.value = 3;

  message.success("匹配成功！");

  // 开始倒计时
  countdownTimer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      enterBattle();
    }
  }, 1000);
};

// 进入对战
const enterBattle = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  visible.value = false;
  emit("matched", opponentInfo.value);
};

// 取消匹配
const cancelMatching = () => {
  if (matchingTimer) {
    clearInterval(matchingTimer);
    matchingTimer = null;
  }

  visible.value = false;
  emit("cancelled");
  message.info("已取消匹配");
};

// 清理定时器
onUnmounted(() => {
  if (matchingTimer) {
    clearInterval(matchingTimer);
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

// 监听弹窗显示
onMounted(() => {
  if (visible.value) {
    startMatching();
  }
});

// 暴露方法给父组件
defineExpose({
  startMatching,
  cancelMatching,
});
</script>

<style scoped>
.matching-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-animation {
  margin-bottom: 16px;
}

.matching-text {
  text-align: center;
}

.matching-text h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--color-text-1);
}

.waiting-time {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 8px 0;
}

.tips {
  color: var(--color-text-3);
  font-size: 14px;
  margin: 0;
}

.cancel-btn {
  margin-top: 8px;
}

.matched-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success-icon {
  margin-bottom: 8px;
}

.matched-container h3 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-1);
}

.opponent-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-fill-2);
  border-radius: 8px;
  width: 100%;
}

.opponent-avatar {
  flex-shrink: 0;
}

.opponent-details {
  flex: 1;
  text-align: left;
}

.opponent-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--color-text-1);
}

.opponent-details p {
  margin: 2px 0;
  font-size: 14px;
  color: var(--color-text-3);
}

.countdown {
  text-align: center;
}

.countdown h2 {
  margin: 0;
  font-size: 48px;
  font-weight: bold;
  color: var(--color-primary);
}

.countdown p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--color-text-3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .opponent-info {
    flex-direction: column;
    text-align: center;
  }

  .opponent-details {
    text-align: center;
  }
}
</style>
