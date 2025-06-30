<template>
  <div class="match-waiting-container">
    <div class="match-card">
      <div v-if="isMatching" class="matching-status">
        <a-spin size="large" :loading="true">
          <div class="spin-content"></div>
        </a-spin>
        <div class="waiting-text">正在寻找对手...</div>
        <div class="cancel-button">
          <a-button type="outline" @click="handleCancel">取消匹配</a-button>
        </div>
      </div>

      <div v-if="isMatched" class="matched-status">
        <div class="success-icon">
          <icon-check-circle-fill style="color: #00b42a; font-size: 48px" />
        </div>
        <div class="match-success-text">匹配成功！</div>
        <div class="opponent-info">
          <div class="avatar">
            <a-avatar :size="64">
              {{ opponent?.userName?.charAt(0) }}
            </a-avatar>
          </div>
          <div class="opponent-name">对手：{{ opponent?.userName }}</div>
        </div>
        <div class="question-info">
          <p class="question-title">题目：{{ currentQuestion?.title }}</p>
          <p class="question-difficulty">
            难度：{{ currentQuestion?.difficulty }}
          </p>
        </div>
        <div class="action-buttons">
          <a-button type="primary" @click="startBattle">开始对战</a-button>
          <a-button style="margin-left: 12px" @click="handleCancel">
            取消
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { IconCheckCircleFill } from "@arco-design/web-vue/es/icon";
import { Message } from "@arco-design/web-vue";

const store = useStore();
const router = useRouter();

// 计算属性
const isMatching = computed(() => store.getters["match/isMatching"]);
const isMatched = computed(() => store.getters["match/isMatched"]);
const opponent = computed(() => store.state.match.opponent);
const currentQuestion = computed(() => store.state.match.currentQuestion);

// 处理取消匹配
const handleCancel = async () => {
  await store.dispatch("match/cancelMatching");
  router.push("/");
};

// 开始对战
const startBattle = async () => {
  try {
    await store.dispatch("match/startBattle");
    router.push("/match/battle");
  } catch (error) {
    console.error("开始对战失败:", error);
    Message.error("开始对战失败，请稍后重试");
  }
};

// 组件挂载时开始匹配
onMounted(async () => {
  // 判断用户是否已登录
  const isLoggedIn =
    store.state.user?.loginUser?.userRole &&
    store.state.user?.loginUser?.userRole !== "notLogin";

  if (!isLoggedIn) {
    Message.error("请先登录再进行匹配");
    router.push("/user/login");
    return;
  }

  try {
    await store.dispatch("match/startMatching");
  } catch (error) {
    console.error("匹配失败:", error);
    Message.error("匹配失败，请稍后重试");
    router.push("/");
  }
});

// 组件销毁前重置匹配状态
onBeforeUnmount(() => {
  // 只有当不是匹配成功状态时才重置
  if (!isMatched.value) {
    store.dispatch("match/resetMatch");
  }
});
</script>

<style scoped>
.match-waiting-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.match-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.matching-status,
.matched-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spin-content {
  height: 60px;
  width: 60px;
}

.waiting-text {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #666;
}

.cancel-button {
  margin-top: 16px;
}

.match-success-text {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0;
}

.opponent-info {
  margin: 20px 0;
}

.opponent-name {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
}

.question-info {
  margin-bottom: 24px;
  padding: 12px;
  background-color: #f2f3f5;
  border-radius: 4px;
  width: 100%;
}

.question-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.action-buttons {
  margin-top: 16px;
}

.success-icon {
  margin-bottom: 8px;
}
</style>
