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
        <div v-if="currentQuestion" class="battle-content">
          <!-- 题目信息部分 -->
          <div class="question-section">
            <h2 class="question-title">{{ currentQuestion.title }}</h2>
            <div class="question-difficulty">
              <a-tag
                :color="getDifficultyColor(currentQuestion.difficulty)"
                size="small"
              >
                {{ currentQuestion.difficulty }}
              </a-tag>
            </div>
            <div class="question-content">
              <MdViewer :value="currentQuestion.content" />
            </div>
          </div>

          <!-- 代码编辑部分 -->
          <div class="code-section">
            <div class="code-editor">
              <!-- <code-editor
                :value="code"
                :handle-change="handleLanguageChange"
              /> -->
              <code-editor
                :value="form.code"
                :handle-change="handleLanguageChange"
                :language="form.language"
              />
            </div>

            <div class="action-buttons">
              <a-button type="primary" @click="submitCode" size="large">
                <template #icon>
                  <icon-send />
                </template>
                提交代码
              </a-button>
            </div>
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
import { defineProps, withDefaults } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import { Message } from "@arco-design/web-vue";
import { IconSend } from "@arco-design/web-vue/es/icon";
import { QuestionSubmitAddRequest } from "generated/question";

const router = useRouter();
const store = useStore();

const loading = ref(true);
const code = ref("");
const language = ref("java");

const codeTemplates = {
  java:
    "import java.util.*;\n\n" +
    "public class Main {\n" +
    "    public static void main(String[] args) throws Exception {\n\n" +
    "    }\n" +
    "}",
  cpp:
    "#include <iostream>\n" +
    "#include <vector>\n" +
    "#include <algorithm>\n" +
    "using namespace std;\n\n" +
    "int main() {\n\n" +
    "    return 0;\n" +
    "}",
  go:
    "package main\n\n" +
    "import (\n" +
    '    "fmt"\n' +
    ")\n\n" +
    "func main() {\n\n" +
    "}",
};

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code: codeTemplates.java,
  questionId: props.id as any,
});

// 用户信息
const userName = computed(
  () => store.state.user?.loginUser?.userName || "用户"
);
const opponentName = computed(
  () => store.state.match.opponent?.userName || "对手"
);

// 当前题目
const currentQuestion = computed(() => store.state.match.currentQuestion);

// 添加调试信息
console.log("store.state.match:", store.state.match);
console.log("当前题目 currentQuestion.value:", currentQuestion.value);

// 处理语言切换
const handleLanguageChange = (newLanguage: string) => {
  language.value = newLanguage;
};

// 提交代码
const submitCode = async () => {
  if (!form.value) {
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
  console.log("BattleView mounted - 检查题目状态");
  console.log("当前匹配状态:", store.state.match.matchStatus);
  console.log("当前题目:", store.state.match.currentQuestion);
  // 给一个短暂的延迟，确保状态已经更新
  setTimeout(() => {
    if (!currentQuestion.value) {
      console.error("未找到对战题目");
      Message.warning("未找到对战题目，即将返回首页");
      setTimeout(() => {
        router.push("/");
      }, 1500);
      return;
    }
    console.log("题目加载成功:", currentQuestion.value);
    loading.value = false;
  }, 100);
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
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.battle-card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.battle-card :deep(.arco-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.battle-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-section {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.question-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
}

.question-difficulty {
  margin-bottom: 16px;
}

.question-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.code-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.code-editor {
  flex: 1;
  margin-bottom: 16px;
  min-height: 350px;
}

.code-editor :deep(.monaco-editor) {
  min-height: 350px !important;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 64px 0;
}
</style>
