<template>
  <div class="match-waiting-container">
    <div class="match-card">
      <!-- 连接状态提示 -->
      <div v-if="!isConnected && isMatching" class="connection-status">
        <a-spin size="small" :loading="true" />
        <span style="margin-left: 8px">正在连接服务器...</span>
      </div>

      <!-- 匹配中状态 -->
      <div v-if="isMatching && isConnected" class="matching-status">
        <a-spin size="large" :loading="true">
          <div class="spin-content"></div>
        </a-spin>
        <div class="waiting-text">正在寻找对手...</div>
        <div class="user-info">
          <p>用户名: {{ currentUserName }}</p>
          <p v-if="roomId">房间ID: {{ roomId }}</p>
        </div>
        <div class="cancel-button">
          <a-button type="outline" @click="handleCancel">取消匹配</a-button>
        </div>
      </div>

      <!-- 匹配成功状态 -->
      <div v-if="isMatched" class="matched-status">
        <div class="success-icon">
          <icon-check-circle-fill style="color: #00b42a; font-size: 48px" />
        </div>
        <div class="match-success-text">匹配成功！</div>
        <div class="match-info">
          <div class="room-info">
            <p><strong>房间ID:</strong> {{ roomId }}</p>
          </div>
          <div class="opponent-info">
            <div class="avatar">
              <a-avatar :size="64">
                {{ opponent?.userName?.charAt(0) }}
              </a-avatar>
            </div>
            <div class="opponent-name">对手：{{ opponent?.userName }}</div>
          </div>
        </div>
        <div class="action-buttons">
          <a-button type="primary" @click="startBattle">开始对战</a-button>
          <a-button style="margin-left: 12px" @click="handleCancel">
            取消
          </a-button>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-if="errorMessage" class="error-status">
        <div class="error-icon">
          <icon-close-circle-fill style="color: #f53f3f; font-size: 48px" />
        </div>
        <div class="error-text">{{ errorMessage }}</div>
        <div class="action-buttons">
          <a-button type="primary" @click="retryMatching">重新匹配</a-button>
          <a-button style="margin-left: 12px" @click="goBack">返回</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
} from "@arco-design/web-vue/es/icon";
import { Message } from "@arco-design/web-vue";

const store = useStore();
const router = useRouter();

// 计算属性
const isMatching = computed(() => store.getters["match/isMatching"]);
const isMatched = computed(() => store.getters["match/isMatched"]);
const opponent = computed(() => store.state.match.opponent);
const roomId = computed(() => store.state.match.roomId);
const isConnected = computed(() => store.state.match.isConnected);
const errorMessage = computed(() => store.state.match.errorMessage);
const currentUserName = computed(() => store.state.user?.loginUser?.userName);

// 处理取消匹配
const handleCancel = async () => {
  try {
    await store.dispatch("match/cancelMatching");
    router.push("/");
  } catch (error) {
    console.error("取消匹配失败:", error);
    Message.error("取消匹配失败");
  }
};

// 开始对战
const startBattle = async () => {
  try {
    console.log(
      "MatchWaitingView: 开始对战，当前状态:",
      store.state.match.matchStatus
    );
    const result = await store.dispatch("match/startBattle");
    console.log("MatchWaitingView: startBattle 结果:", result);
    router.push("/match/battle");
  } catch (error) {
    console.error("开始对战失败:", error);
    Message.error("开始对战失败，请稍后重试");
  }
};

// 重新匹配
const retryMatching = async () => {
  try {
    await store.dispatch("match/startMatching");
  } catch (error) {
    console.error("重新匹配失败:", error);
    Message.error("重新匹配失败，请稍后重试");
  }
};

// 返回首页
const goBack = () => {
  router.push("/");
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

  // 如果已经在匹配中，不重新开始
  if (store.state.match.matchStatus !== "idle") {
    console.log("匹配已在进行中，当前状态:", store.state.match.matchStatus);
    return;
  }

  try {
    await store.dispatch("match/startMatching");
  } catch (error) {
    console.error("匹配失败:", error);
    Message.error("匹配失败，请稍后重试");
  }
});

// 组件销毁前处理
onBeforeUnmount(() => {
  // 如果页面关闭但还在匹配中，询问是否取消匹配
  if (isMatching.value) {
    console.log("MatchWaitingView: 页面即将离开，但匹配仍在进行中");
    // 注意：这里可能需要用户确认是否取消匹配
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
  width: 450px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.connection-status,
.matching-status,
.matched-status,
.error-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connection-status {
  padding: 20px 0;
  color: #666;
}

.spin-content {
  height: 60px;
  width: 60px;
}

.waiting-text {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 16px;
  color: #666;
}

.user-info {
  margin: 16px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
}

.user-info p {
  margin: 4px 0;
}

.cancel-button {
  margin-top: 16px;
}

.match-success-text {
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0;
  color: #00b42a;
}

.match-info {
  margin: 20px 0;
  width: 100%;
}

.room-info {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #e8f7ff;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.room-info p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.opponent-info {
  margin: 20px 0;
}

.opponent-name {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
}

.action-buttons {
  margin-top: 24px;
}

.success-icon {
  margin-bottom: 8px;
}

.error-status {
  padding: 20px 0;
}

.error-icon {
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
  color: #f53f3f;
  margin-bottom: 24px;
  padding: 12px;
  background-color: #ffeaea;
  border-radius: 6px;
  border-left: 4px solid #f53f3f;
}
</style>
