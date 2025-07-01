<template>
  <div class="match-result-container">
    <div class="result-card">
      <div
        :class="[
          'result-banner',
          { win: isWinner, lose: !isWinner, draw: isDraw },
        ]"
      >
        <div class="result-icon">
          <icon-trophy v-if="isWinner" />
          <icon-close-circle v-else />
        </div>
        <div class="result-text">
          <template v-if="isDraw">平局</template>
          <template v-else>{{ isWinner ? "胜利" : "失败" }}</template>
        </div>
        <div class="result-reason">{{ reasonText }}</div>
      </div>

      <div class="result-details">
        <div class="players-section">
          <div class="player-info user">
            <a-avatar :size="64">
              {{ userName.charAt(0) }}
            </a-avatar>
            <div class="player-name">{{ userName }}</div>
            <div class="player-status">
              {{ isWinner ? "获胜者" : "失败者" }}
            </div>
          </div>
          <div class="vs-section">VS</div>
          <div class="player-info opponent">
            <a-avatar :size="64">
              {{ opponentName.charAt(0) }}
            </a-avatar>
            <div class="player-name">{{ opponentName }}</div>
            <div class="player-status">
              {{ !isWinner ? "获胜者" : "失败者" }}
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-label">题目</div>
            <div class="stat-value">{{ questionTitle }}</div>
          </div>
          <!-- <div class="stat-item">
            <div class="stat-label">对战时长</div>
            <div class="stat-value">{{ formattedTime }}</div>
          </div> -->
          <div class="stat-item">
            <div class="stat-label">房间ID</div>
            <div class="stat-value">{{ roomId || "N/A" }}</div>
          </div>
        </div>

        <div class="actions-section">
          <a-button type="primary" @click="backToHome">返回首页</a-button>
          <a-button style="margin-left: 16px" @click="startNewMatch">
            再来一局
          </a-button>
          <a-button
            type="outline"
            style="margin-left: 16px"
            @click="viewSubmissions"
          >
            查看提交记录
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { IconTrophy, IconCloseCircle } from "@arco-design/web-vue/es/icon";
import { useMatch } from "@/composables/useMatch";

const router = useRouter();
const { battleResult, currentQuestion, opponent, roomId, reset } = useMatch();

// 计算属性
const userName = computed(() => "我"); // 可以从store获取真实用户名
const opponentName = computed(() => opponent.value?.userName || "对手");
const questionTitle = computed(
  () => currentQuestion.value?.title || "未知题目"
);

const isWinner = computed(() => {
  if (!battleResult.value) return false;
  return battleResult.value.winner === "我";
});

const isDraw = computed(() => false); // 当前设计中没有平局

const reasonText = computed(() => {
  if (!battleResult.value) return "";

  switch (battleResult.value.reason) {
    case "correct_answer":
      return isWinner.value ? "你率先答对了题目！" : "对手率先答对了题目";
    case "opponent_giveup":
      return isWinner.value ? "对手主动放弃了对战" : "你主动放弃了对战";
    case "timeout":
      return "对战超时";
    default:
      return "";
  }
});

const formattedTime = computed(() => {
  if (!battleResult.value) return "0秒";

  const seconds = Math.floor(battleResult.value.time / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
});

// 方法
const backToHome = () => {
  reset();
  router.push("/");
};

const startNewMatch = async () => {
  reset();
  router.push("/match/waiting");
};

const viewSubmissions = () => {
  // 跳转到提交记录页面
  router.push("/question/submit");
};

// 页面挂载时检查是否有对战结果
onMounted(() => {
  if (!battleResult.value) {
    // 如果没有对战结果，跳转到首页
    router.push("/");
  }
});
</script>

<style scoped>
.match-result-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.result-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 600px;
}

.result-banner {
  padding: 40px 20px;
  text-align: center;
  color: white;
  position: relative;
}

.result-banner.win {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.result-banner.lose {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.result-banner.draw {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.result-text {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.result-reason {
  font-size: 16px;
  opacity: 0.9;
}

.result-details {
  padding: 32px;
}

.players-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.player-name {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.player-status {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
}

.vs-section {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  margin: 0 20px;
}

.stats-section {
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 16px;
  color: #666;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.actions-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .match-result-container {
    padding: 10px;
  }

  .result-banner {
    padding: 24px 16px;
  }

  .result-text {
    font-size: 24px;
  }

  .result-details {
    padding: 20px;
  }

  .players-section {
    flex-direction: column;
    gap: 16px;
  }

  .vs-section {
    order: 2;
    margin: 0;
  }

  .actions-section {
    flex-direction: column;
    gap: 12px;
  }

  .actions-section .arco-btn {
    width: 100%;
    margin: 6px 0 !important;
  }
}
</style>
