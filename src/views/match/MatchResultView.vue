<template>
  <div class="match-result-container">
    <div class="result-card">
      <div
        :class="[
          'result-banner',
          { win: isWinner, lose: !isWinner, draw: isDraw },
        ]"
      >
        <div class="result-text">
          <template v-if="isDraw">平局</template>
          <template v-else>{{ isWinner ? "胜利" : "失败" }}</template>
        </div>
      </div>

      <div class="result-details">
        <div class="players-section">
          <div class="player-info user">
            <a-avatar :size="64">
              {{ userName.charAt(0) }}
            </a-avatar>
            <div class="player-name">{{ userName }}</div>
          </div>
          <div class="vs-section">VS</div>
          <div class="player-info opponent">
            <a-avatar :size="64">
              {{ opponentName.charAt(0) }}
            </a-avatar>
            <div class="player-name">{{ opponentName }}</div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <div class="stat-label">题目</div>
            <div class="stat-value">{{ questionTitle }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">用时</div>
            <div class="stat-value">{{ formattedTime }}</div>
          </div>
        </div>

        <div class="actions-section">
          <a-button type="primary" @click="backToHome">返回首页</a-button>
          <a-button style="margin-left: 16px" @click="startNewMatch">
            再来一局
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Message } from "@arco-design/web-vue";

const store = useStore();
const router = useRouter();

// 比赛结果
const matchResult = computed(() => store.state.match.matchResult);
const currentQuestion = computed(() => store.state.match.currentQuestion);
const opponent = computed(() => store.state.match.opponent);

// 计算属性
const isWinner = computed(() => {
  return (
    matchResult.value &&
    matchResult.value.winner === store.state.user?.loginUser?.userName
  );
});

const isDraw = computed(
  () => matchResult.value && matchResult.value.winner === "draw"
);

const userName = computed(
  () => store.state.user?.loginUser?.userName || "用户"
);
const opponentName = computed(() => opponent.value?.userName || "对手");
const questionTitle = computed(
  () => currentQuestion.value?.title || "未知题目"
);

const formattedTime = computed(() => {
  const time = matchResult.value?.time || 0;
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
});

// 返回首页
const backToHome = () => {
  store.dispatch("match/resetMatch");
  router.push("/");
};

// 开始新的匹配
const startNewMatch = () => {
  store.dispatch("match/resetMatch");
  router.push("/match/waiting");
};

// 组件挂载时检查是否有比赛结果
onMounted(() => {
  if (!matchResult.value) {
    Message.warning("没有比赛结果数据");
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
  background-color: #f5f5f5;
}

.result-card {
  background-color: #fff;
  border-radius: 8px;
  width: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.result-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: white;
  font-size: 28px;
  font-weight: bold;
}

.win {
  background: linear-gradient(45deg, #52c41a, #73d13d);
}

.lose {
  background: linear-gradient(45deg, #f5222d, #ff4d4f);
}

.draw {
  background: linear-gradient(45deg, #1677ff, #4096ff);
}

.result-details {
  padding: 24px;
}

.players-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-name {
  margin-top: 8px;
  font-weight: 500;
}

.vs-section {
  font-size: 24px;
  font-weight: bold;
  color: #8c8c8c;
}

.stats-section {
  background-color: #f2f3f5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-weight: 500;
  color: #8c8c8c;
}

.actions-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
