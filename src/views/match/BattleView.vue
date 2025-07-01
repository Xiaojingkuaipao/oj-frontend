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
              <code-editor
                :value="form.code"
                :handle-change="handleCodeChange"
                :language="form.language"
              />
            </div>

            <div class="action-buttons">
              <a-button
                type="primary"
                @click="handleSubmitCode"
                size="large"
                :loading="submitLoading"
              >
                <template #icon>
                  <icon-send />
                </template>
                提交代码
              </a-button>
              <a-button
                type="outline"
                status="danger"
                @click="handleGiveup"
                size="large"
                style="margin-left: 12px"
              >
                放弃对战
              </a-button>
            </div>
          </div>

          <!-- 提交结果显示 -->
          <div v-if="submitResults.length > 0" class="submit-results">
            <h3>提交历史</h3>
            <div
              v-for="(result, index) in submitResults"
              :key="index"
              class="result-item"
            >
              <a-tag :color="getResultColor(result.status)" size="small">
                {{ getResultText(result.status) }}
              </a-tag>
              <span class="submit-id">ID: {{ result.questionSubmitId }}</span>
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
import { defineProps, withDefaults } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import { Message } from "@arco-design/web-vue";
import { IconSend } from "@arco-design/web-vue/es/icon";
import { useMatch } from "@/composables/useMatch";

const router = useRouter();
const {
  submitLoading,
  isBattling,
  currentQuestion,
  opponent,
  submitResults,
  submitCode,
  giveupBattle,
  getDifficultyColor,
  watchBattleResult,
} = useMatch();

console.log("battle View CurrentQusetion:", currentQuestion);

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

// 响应式数据
const loading = ref(false);
const form = ref({
  language: "java",
  code: getDefaultCode("java"),
  questionId: props.id,
});

// 代码模板
function getDefaultCode(language: string): string {
  const templates: Record<string, string> = {
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
    python:
      "# -*- coding: utf-8 -*-\n\n" +
      "def main():\n" +
      "    pass\n\n" +
      "if __name__ == '__main__':\n" +
      "    main()",
    javascript:
      "// Node.js 环境\n\n" +
      "function main() {\n" +
      "    // 你的代码\n" +
      "}\n\n" +
      "main();",
  };
  return templates[language] || "";
}

// 计算属性
const userName = computed(() => "我"); // 可以从store获取真实用户名
const opponentName = computed(() => opponent.value?.userName || "对手");

// 处理代码变更
const handleCodeChange = (newCode: string) => {
  form.value.code = newCode;
};

// 提交代码
const handleSubmitCode = async () => {
  if (!form.value.code.trim()) {
    Message.warning("代码不能为空");
    return;
  }

  if (!currentQuestion.value) {
    Message.error("没有当前题目");
    return;
  }

  try {
    console.log("battle View submit code");
    await submitCode(form.value.code, form.value.language);
  } catch (error) {
    console.error("提交失败:", error);
  }
};

// 放弃对战
const handleGiveup = async () => {
  try {
    await giveupBattle();
  } catch (error) {
    console.error("放弃对战失败:", error);
  }
};

// 获取提交结果颜色
const getResultColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 判题中
    case 1:
      return "red"; // 错误
    case 2:
      return "green"; // 正确
    default:
      return "gray";
  }
};

// 获取提交结果文本
const getResultText = (status: number) => {
  switch (status) {
    case 0:
      return "判题中";
    case 1:
      return "答案错误";
    case 2:
      return "答案正确";
    default:
      return "未知状态";
  }
};

// 监听对战结果
onMounted(() => {
  if (!isBattling.value) {
    Message.warning("请先开始对战");
    router.push("/match/waiting");
    return;
  }

  // 监听对战结果
  const unwatch = watchBattleResult(() => {
    setTimeout(() => {
      router.push("/match/result");
    }, 2000);
  });

  // 组件卸载时取消监听
  onBeforeUnmount(() => {
    unwatch();
  });
});

// 页面卸载前提示
onBeforeUnmount(() => {
  if (isBattling.value) {
    // 实际项目中可以添加确认对话框
    console.log("用户离开对战页面");
  }
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

.submit-results {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.submit-results h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.submit-id {
  font-size: 12px;
  color: #666;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 64px 0;
}
</style>
