// initial state
import { StoreOptions } from "vuex";
import router from "@/router";

// 匹配状态枚举
export enum MatchStatusEnum {
  IDLE = "idle", // 未匹配
  MATCHING = "matching", // 匹配中
  MATCHED = "matched", // 已匹配
  BATTLING = "battling", // 对战中
  COMPLETED = "completed", // 对战完成
}

export default {
  namespaced: true,
  state: () => ({
    // 匹配状态
    matchStatus: MatchStatusEnum.IDLE,
    // 对手信息
    opponent: null,
    // 当前题目信息
    currentQuestion: null,
    // 匹配结果
    matchResult: null,
    // 模拟等待时间(毫秒)
    waitTime: 3000,
  }),
  actions: {
    // 开始匹配
    async startMatching({ commit, state }) {
      // 更新状态为匹配中
      commit("updateMatchStatus", MatchStatusEnum.MATCHING);
      // 模拟匹配过程 (在实际项目中，这里会调用API)
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟匹配成功
          const mockOpponent = {
            id: 12345,
            userName: "对手用户",
            avatar: "https://via.placeholder.com/100",
          };
          // 模拟题目数据
          const mockQuestion = {
            id: 1,
            title: "两数之和",
            content:
              "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。",
            difficulty: "简单",
          };
          commit("updateOpponent", mockOpponent);
          commit("updateCurrentQuestion", mockQuestion);
          commit("updateMatchStatus", MatchStatusEnum.MATCHED);
          resolve({ success: true });
        }, state.waitTime);
      });
    },
    // 取消匹配
    cancelMatching({ commit }) {
      commit("updateMatchStatus", MatchStatusEnum.IDLE);
      commit("updateOpponent", null);
      return { success: true };
    },
    // 开始对战
    startBattle({ commit }) {
      commit("updateMatchStatus", MatchStatusEnum.BATTLING);
      // 实际项目中可能需要更多处理
      router.push("/match/battle");
    },
    // 结束对战
    endBattle({ commit }, result) {
      commit("updateMatchResult", result);
      commit("updateMatchStatus", MatchStatusEnum.COMPLETED);
    },
    // 重置匹配状态
    resetMatch({ commit }) {
      commit("updateMatchStatus", MatchStatusEnum.IDLE);
      commit("updateOpponent", null);
      commit("updateCurrentQuestion", null);
      commit("updateMatchResult", null);
    },
  },
  mutations: {
    updateMatchStatus(state, status) {
      state.matchStatus = status;
    },
    updateOpponent(state, opponent) {
      state.opponent = opponent;
    },
    updateCurrentQuestion(state, question) {
      state.currentQuestion = question;
    },
    updateMatchResult(state, result) {
      state.matchResult = result;
    },
  },
  getters: {
    isMatching(state) {
      return state.matchStatus === MatchStatusEnum.MATCHING;
    },
    isMatched(state) {
      return state.matchStatus === MatchStatusEnum.MATCHED;
    },
    isBattling(state) {
      return state.matchStatus === MatchStatusEnum.BATTLING;
    },
    isCompleted(state) {
      return state.matchStatus === MatchStatusEnum.COMPLETED;
    },
  },
} as StoreOptions<{
  matchStatus: MatchStatusEnum;
  opponent: {
    id: number;
    userName: string;
    avatar: string;
  } | null;
  currentQuestion: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
  } | null;
  matchResult: {
    winner: string;
    time: number;
  } | null;
  waitTime: number;
}>;
