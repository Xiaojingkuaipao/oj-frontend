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
          <a-button
            type="primary"
            @click="handleStartBattle"
            :disabled="!canStartBattle"
            :loading="isLoading"
          >
            开始对战
          </a-button>
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
import { useMatch } from "@/composables/useMatch";

const store = useStore();
const router = useRouter();
const {
  isLoading,
  isMatching,
  isMatched,
  canStartBattle,
  isConnected,
  roomId,
  opponent,
  errorMessage,
  startMatching,
  cancelMatching,
  startBattle,
  reset,
} = useMatch();

// 计算属性
const currentUserName = computed(() => store.state.user?.loginUser?.userName);

// 开始对战
const handleStartBattle = async () => {
  await startBattle();
};

// 处理取消匹配
const handleCancel = async () => {
  await cancelMatching();
  router.push("/");
};

// 重新匹配
const retryMatching = async () => {
  reset();
  await startMatching();
};

// 返回首页
const goBack = () => {
  reset();
  router.push("/");
};

// 组件挂载时开始匹配
onMounted(async () => {
  try {
    await startMatching();
  } catch (error) {
    console.error("自动开始匹配失败:", error);
  }
});

// 组件卸载时清理
onBeforeUnmount(() => {
  // 如果还在匹配中，取消匹配
  if (isMatching.value) {
    cancelMatching();
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

.avatar {
  margin-bottom: 12px;
}

.opponent-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.action-buttons {
  margin-top: 24px;
}

.error-text {
  font-size: 16px;
  margin: 16px 0;
  color: #f53f3f;
}

.success-icon,
.error-icon {
  margin-bottom: 16px;
}
</style>
