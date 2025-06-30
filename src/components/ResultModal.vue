<template>
  <a-modal
    v-model:visible="visible"
    :closable="false"
    :mask-closable="false"
    :footer="false"
    width="600px"
  >
    <div class="result-container">
      <!-- 结果头部 -->
      <div
        class="result-header"
        :class="{
          win: result === 'win',
          lose: result === 'lose',
          draw: result === 'draw',
          timeout: result === 'timeout',
        }"
      >
        <div class="result-icon">
          <icon-check-circle-fill v-if="result === 'win'" />
          <icon-close-circle-fill v-else-if="result === 'lose'" />
          <icon-minus-circle-fill v-else-if="result === 'draw'" />
          <icon-clock-circle v-else />
        </div>
        <h2 class="result-title">
          {{ resultText }}
        </h2>
      </div>

      <!-- 结果统计 -->
      <div class="result-stats">
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <div class="stat-item">
              <div class="stat-label">用时</div>
              <div class="stat-value">{{ formatTime(stats.timeUsed) }}</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="stat-item">
              <div class="stat-label">代码行数</div>
              <div class="stat-value">{{ stats.codeLines }} 行</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="stat-item">
              <div class="stat-label">执行时间</div>
              <div class="stat-value">{{ stats.executionTime }} ms</div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="stat-item">
              <div class="stat-label">内存占用</div>
              <div class="stat-value">{{ stats.memoryUsage }} MB</div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 结果评价 -->
      <div class="result-evaluation">
        <p>{{ evaluation }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="result-actions">
        <a-space>
          <a-button type="primary" @click="handleRematch">再来一局</a-button>
          <a-button @click="handleExit">返回首页</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconMinusCircleFill,
  IconClockCircle,
} from "@arco-design/web-vue/es/icon";

// 定义Props类型
interface Props {
  modelValue: boolean;
  result: "win" | "lose" | "draw" | "timeout" | null;
  stats: {
    timeUsed: number;
    codeLines: number;
    executionTime: number;
    memoryUsage: number;
  };
}

// 定义Emits类型
interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "rematch"): void;
  (e: "exit"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 控制弹窗显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 计算结果文本
const resultText = computed(() => {
  switch (props.result) {
    case "win":
      return "恭喜你，你赢了！";
    case "lose":
      return "很遗憾，你输了";
    case "draw":
      return "平局";
    case "timeout":
      return "时间已到";
    default:
      return "";
  }
});

// 计算评价文本
const evaluation = computed(() => {
  switch (props.result) {
    case "win":
      return "你的解题速度和代码质量都非常出色！继续保持这样的水平。";
    case "lose":
      return "对手这次比你更快一步，再接再厉，下次一定能赢！";
    case "draw":
      return "你们旗鼓相当，这是一场精彩的对决！";
    case "timeout":
      return "这题有点难度，下次可以尝试更简单的题目。";
    default:
      return "";
  }
});

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
};

// 处理再来一局
const handleRematch = () => {
  visible.value = false;
  emit("rematch");
};

// 处理返回首页
const handleExit = () => {
  visible.value = false;
  emit("exit");
};
</script>

<style scoped>
.result-container {
  padding: 16px;
  text-align: center;
}

.result-header {
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 8px;
}

.win {
  background-color: rgba(0, 180, 42, 0.1);
  color: #00b42a;
}

.lose {
  background-color: rgba(245, 63, 63, 0.1);
  color: #f53f3f;
}

.draw {
  background-color: rgba(134, 144, 156, 0.1);
  color: #86909c;
}

.timeout {
  background-color: rgba(255, 125, 0, 0.1);
  color: #ff7d00;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.result-stats {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--color-fill-2);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  padding: 8px;
}

.stat-label {
  color: var(--color-text-3);
  font-size: 14px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.result-evaluation {
  margin-bottom: 24px;
  font-size: 16px;
  color: var(--color-text-2);
}

.result-actions {
  margin-top: 16px;
}
</style>
