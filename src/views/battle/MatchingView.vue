<template>
  <div class="matching-container">
    <!-- 匹配模态框 -->
    <MatchingModal
      v-model="showMatchingModal"
      @matched="handleMatchSuccess"
      @cancelled="handleMatchCancel"
    />

    <!-- 主要内容区域 -->
    <div class="match-content">
      <div class="match-header">
        <h1 class="match-title">1v1 编程对战</h1>
        <p class="match-subtitle">找到旗鼓相当的对手，开始你的编程挑战</p>
      </div>

      <div v-if="matchStatus === 'idle'" class="match-start">
        <div class="start-card">
          <div class="card-icon">⚔️</div>
          <h3>准备对战</h3>
          <p>系统将为您匹配同等水平的对手</p>
          <a-button
            type="primary"
            size="large"
            class="start-button"
            @click="startMatching"
          >
            开始匹配
          </a-button>
        </div>
      </div>

      <div v-else-if="matchStatus === 'matched'" class="match-success">
        <div class="success-icon">✅</div>
        <h3>匹配成功！</h3>
        <p>即将进入对战房间...</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import MatchingModal from "@/components/MatchingModal.vue";
import message from "@arco-design/web-vue/es/message";

const router = useRouter();

// 匹配状态: 'idle' | 'matching' | 'matched'
const matchStatus = ref<"idle" | "matching" | "matched">("idle");
const showMatchingModal = ref(false);

// 自动启动匹配 - 移除自动行为，让用户主动选择
// onMounted(() => {
//   setTimeout(() => {
//     startMatching();
//   }, 300);
// });

// 开始匹配
const startMatching = () => {
  matchStatus.value = "matching";
  showMatchingModal.value = true;
};

// 匹配成功处理
const handleMatchSuccess = (opponentInfo: {
  userName: string;
  level: string;
}) => {
  matchStatus.value = "matched";
  message.success(`已匹配到对手: ${opponentInfo.userName}，即将进入对战房间`);

  // 模拟生成房间ID并跳转到对战房间
  const roomId = "room_" + Math.floor(Math.random() * 10000);
  setTimeout(() => {
    router.push({
      path: `/battle/room/${roomId}`,
      query: {
        opponentName: opponentInfo.userName,
        opponentLevel: opponentInfo.level,
        // 可以传递更多对手信息
      },
    });
  }, 1000);
};

// 取消匹配处理
const handleMatchCancel = () => {
  matchStatus.value = "idle";
  message.info("已取消匹配");
};
</script>

<style scoped>
.matching-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.match-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.match-header {
  margin-bottom: 60px;
  color: white;
}

.match-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.match-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.match-start {
  display: flex;
  justify-content: center;
}

.start-card {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 400px;
}

.start-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.start-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
}

.start-card p {
  color: #7f8c8d;
  margin-bottom: 32px;
  font-size: 1rem;
}

.start-button {
  height: 48px;
  padding: 0 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.match-success {
  background: white;
  border-radius: 16px;
  padding: 48px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  color: #2c3e50;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.match-success h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #27ae60;
}

.match-success p {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .match-title {
    font-size: 2rem;
  }
  .start-card {
    padding: 32px 24px;
  }
  .matching-container {
    padding: 16px;
  }
}
</style>
