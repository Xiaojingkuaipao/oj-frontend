/**
 * 在线对战功能组合式API
 */
import { computed, onBeforeUnmount, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import type { BattleResult } from "@/types/match";
import CodeEditor from "@/components/CodeEditor.vue";

export function useMatch() {
  const store = useStore();
  const router = useRouter();

  // 响应式状态
  const isLoading = ref(false);
  const submitLoading = ref(false);
  const pollTimer = ref<NodeJS.Timeout | null>(null);

  // 计算属性
  const isMatching = computed(() => store.getters["match/isMatching"]);
  const isMatched = computed(() => store.getters["match/isMatched"]);
  const isBattling = computed(() => store.getters["match/isBattling"]);
  const isEnded = computed(() => store.getters["match/isEnded"]);
  const canStartBattle = computed(() => store.getters["match/canStartBattle"]);

  const connectionStatus = computed(() => store.state.match.connectionStatus);
  const isConnected = computed(() => store.state.match.isConnected);
  const roomId = computed(() => store.state.match.roomId);
  const userId = computed(() => store.state.match.userId);
  const opponent = computed(() => store.state.match.opponent);
  const currentQuestion = computed(() => store.state.match.currentQuestion);
  const battleResult = computed(() => store.state.match.battleResult);
  const errorMessage = computed(() => store.state.match.errorMessage);
  const submitResults = computed(() => store.state.match.submitResults);

  /**
   * 开始匹配
   */
  const startMatching = async () => {
    try {
      isLoading.value = true;
      await store.dispatch("match/startMatching");
      Message.success("开始匹配，正在寻找对手...");
    } catch (error: unknown) {
      console.error("匹配失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "匹配失败，请稍后重试";
      Message.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 取消匹配
   */
  const cancelMatching = async () => {
    try {
      await store.dispatch("match/cancelMatching");
      Message.info("已取消匹配");
    } catch (error: unknown) {
      console.error("取消匹配失败:", error);
      Message.error("取消匹配失败");
    }
  };

  /**
   * 开始对战
   */
  const startBattle = async () => {
    try {
      if (!canStartBattle.value) {
        Message.warning("无法开始对战，请等待连接建立");
        return;
      }

      await store.dispatch("match/startBattle");
      Message.success("对战开始！");

      // 跳转到对战页面
      router.push(`/match/battle/${currentQuestion.value?.id || ""}`);
    } catch (error: unknown) {
      console.error("开始对战失败:", error);
      Message.error("开始对战失败");
    }
  };

  /**
   * 提交代码
   */
  const submitCode = async (code: string, language: string) => {
    if (!currentQuestion.value) {
      Message.error("没有当前题目");
      return;
    }
    console.log("submit code function, code:", code, "language:", language);
    console.log("currentQusetion:", currentQuestion.value);
    try {
      submitLoading.value = true;

      await store.dispatch("match/submitAnswer", {
        code,
        language,
        questionId: currentQuestion.value.id,
      });

      Message.success("代码提交成功，正在判题...");

      // 开始轮询判题结果
      startSubmitPolling();
    } catch (error: unknown) {
      console.error("提交代码失败:", error);
      Message.error("提交代码失败");
    } finally {
      submitLoading.value = false;
    }
  };

  /**
   * 开始轮询提交结果
   */
  const startSubmitPolling = () => {
    const lastSubmitId = store.state.match.lastSubmitId;
    if (!lastSubmitId) return;

    const poll = async () => {
      try {
        await store.dispatch("match/querySubmitResult", lastSubmitId);

        // 检查最新的提交结果
        const latestResult =
          submitResults.value[submitResults.value.length - 1];
        if (latestResult && latestResult.status !== 0) {
          // 判题完成，停止轮询
          clearSubmitPolling();

          if (latestResult.status === 2) {
            Message.success("恭喜！答案正确，你赢得了这场对战！");
          } else {
            Message.warning("答案错误，继续努力！");
          }
        } else {
          // 继续轮询
          pollTimer.value = setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error("查询提交结果失败:", error);
        clearSubmitPolling();
      }
    };

    // 延迟开始轮询
    pollTimer.value = setTimeout(poll, 1000);
  };

  /**
   * 清除轮询定时器
   */
  const clearSubmitPolling = () => {
    if (pollTimer.value) {
      clearTimeout(pollTimer.value);
      pollTimer.value = null;
    }
  };

  /**
   * 放弃对战
   */
  const giveupBattle = async () => {
    try {
      await store.dispatch("match/giveupBattle");
      Message.info("已放弃对战");

      // 跳转到结果页面
      setTimeout(() => {
        router.push("/match/result");
      }, 1000);
    } catch (error: unknown) {
      console.error("放弃对战失败:", error);
      Message.error("放弃对战失败");
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    clearSubmitPolling();
    store.dispatch("match/reset");
  };

  /**
   * 获取题目难度颜色
   */
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
      case "简单":
        return "green";
      case "medium":
      case "中等":
        return "orange";
      case "hard":
      case "困难":
        return "red";
      default:
        return "blue";
    }
  };

  /**
   * 获取连接状态文本
   */
  const getConnectionStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "已连接";
      case "connecting":
        return "连接中";
      case "reconnecting":
        return "重连中";
      case "disconnected":
      default:
        return "未连接";
    }
  };

  /**
   * 监听对战结果
   */
  const watchBattleResult = (callback: (result: BattleResult) => void) => {
    const unwatch = store.watch(
      (state) => state.match.battleResult,
      (newResult) => {
        if (newResult) {
          callback(newResult);
        }
      }
    );
    return unwatch;
  };

  /**
   * 处理错误消息
   */
  const handleError = (error: string | null) => {
    if (error) {
      Message.error(error);
      store.commit("match/SET_ERROR", null);
    }
  };

  // 监听错误消息
  store.watch(
    (state) => state.match.errorMessage,
    (newError) => {
      handleError(newError);
    }
  );

  // 组件卸载时清理
  onBeforeUnmount(() => {
    clearSubmitPolling();
  });

  return {
    // 状态
    isLoading,
    submitLoading,
    isMatching,
    isMatched,
    isBattling,
    isEnded,
    canStartBattle,
    connectionStatus,
    isConnected,
    roomId,
    userId,
    opponent,
    currentQuestion,
    battleResult,
    errorMessage,
    submitResults,

    // 方法
    startMatching,
    cancelMatching,
    startBattle,
    submitCode,
    giveupBattle,
    reset,
    getDifficultyColor,
    getConnectionStatusText,
    watchBattleResult,
    handleError,
  };
}
