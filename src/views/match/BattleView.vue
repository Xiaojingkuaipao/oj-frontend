<template>
  <div class="battle-view">
    <a-card class="battle-card">
      <template #title>
        <div class="battle-header">
          <div class="battle-status">
            1v1对战中
            <a-badge status="processing" />
          </div>
          <div class="battle-opponents">
            <div class="player current-player">
              <a-avatar size="small">{{ userName.charAt(0) }}</a-avatar>
              <span>{{ userName }}</span>
            </div>
            <span class="vs">VS</span>
            <div class="player opponent">
              <a-avatar size="small">{{ opponentName.charAt(0) }}</a-avatar>
              <span>{{ opponentName }}</span>
            </div>
          </div>
        </div>
      </template>

      <a-spin :loading="loading">
        <div v-if="currentQuestion">
          <h2 class="question-title">{{ currentQuestion.title }}</h2>
          <div class="question-difficulty">
            <a-tag
              :color="getDifficultyColor(currentQuestion.difficulty)"
              size="small"
            >
              {{ currentQuestion.difficulty }}
            </a-tag>
          </div>

          <a-divider />

          <div class="question-content">
            <MdViewer :text="currentQuestion.content" />
          </div>

          <a-divider />

          <div class="code-editor">
            <CodeEditor
              v-model="code"
              :languages="['java', 'cpp', 'javascript', 'python']"
              :default-language="language"
              @language-change="handleLanguageChange"
            />
          </div>

          <div class="action-buttons">
            <a-button type="primary" @click="submitCode">
              <template #icon>
                <icon-send />
              </template>
              提交
            </a-button>
          </div>
        </div>
        <div v-else class="empty-state">
          <a-empty description="题目加载中..." />
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import { Message } from "@arco-design/web-vue";
import { IconSend } from "@arco-design/web-vue/es/icon";

const router = useRouter();
const store = useStore();

const loading = ref(true);
const code = ref("");
const language = ref("java");

// 用户信息
const userName = computed(
  () => store.state.user?.loginUser?.userName || "用户"
);
const opponentName = computed(
  () => store.state.match.opponent?.userName || "对手"
);

// 当前题目
const currentQuestion = computed(() => store.state.match.currentQuestion);

// 处理语言切换
const handleLanguageChange = (newLanguage: string) => {
  language.value = newLanguage;
};

// 提交代码
const submitCode = async () => {
  if (!code.value.trim()) {
    Message.warning("代码不能为空");
    return;
  }

  try {
    // 模拟提交成功
    Message.success("代码提交成功");
    // 创建胜利结果
    const result = {
      winner: userName.value,
      time: Math.floor(Math.random() * 120000 + 30000), // 随机30-150秒
    };
    // 更新比赛结果
    await store.dispatch("match/endBattle", result);
    // 跳转到结果页面
    setTimeout(() => {
      router.push("/match/result");
    }, 1500);
  } catch (error) {
    console.error("提交失败:", error);
    Message.error("提交失败，请稍后重试");
  }
};

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "简单":
      return "green";
    case "中等":
      return "orange";
    case "困难":
      return "red";
    default:
      return "blue";
  }
};

onMounted(async () => {
  // 检查是否有对战题目
  if (!currentQuestion.value) {
    Message.warning("未找到对战题目，即将返回首页");
    setTimeout(() => {
      router.push("/");
    }, 1500);
    return;
  }
  loading.value = false;
});

// 组件销毁前确认是否离开对战
onBeforeUnmount(() => {
  // 实际项目中应该有离开对战的确认逻辑
  console.log("离开对战页面");
});
</script>

<style scoped>
.battle-view {
  padding: 20px;
}

.battle-card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-status {
  font-weight: bold;
  color: #165dff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.battle-opponents {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-player {
  color: #165dff;
  font-weight: 500;
}

.opponent {
  color: #f53f3f;
  font-weight: 500;
}

.vs {
  font-weight: bold;
  color: #86909c;
}

.question-title {
  margin-bottom: 8px;
  font-size: 20px;
}

.question-difficulty {
  margin-bottom: 16px;
}

.question-content {
  margin-bottom: 24px;
}

.code-editor {
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}
</style>
