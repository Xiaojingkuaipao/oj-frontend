/* eslint-disable @typescript-eslint/no-explicit-any */
// initial state
import { MatchWebSocket, MatchResponse } from "@/utils/websocket";

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
    // WebSocket实例
    websocket: null as MatchWebSocket | null,
    // 房间ID
    roomId: null as string | null,
    // 连接状态
    isConnected: false,
    // 错误信息
    errorMessage: null as string | null,
  }),
  actions: {
    // 开始匹配 - 建立WebSocket连接
    async startMatching({ commit, rootState }: any) {
      const userName = rootState.user?.loginUser?.userName;
      if (!userName) {
        throw new Error("用户未登录");
      }

      try {
        // 更新状态为匹配中
        commit("updateMatchStatus", MatchStatusEnum.MATCHING);
        commit("updateErrorMessage", null);

        // 创建WebSocket连接
        const websocket = new MatchWebSocket("139.9.144.238:8101", userName);
        commit("updateWebSocket", websocket);

        // 先测试服务器连接性
        console.log("开始测试服务器连接性...");
        const isServerReachable = await websocket.testConnection();
        console.log("服务器连接测试结果:", isServerReachable);

        // 设置回调函数
        websocket.setCallbacks({
          onConnected: () => {
            console.log("WebSocket连接成功，开始匹配");
            commit("updateIsConnected", true);
          },
          onMatchResult: (result: MatchResponse) => {
            console.log("收到匹配结果:", result);
            if (result.success) {
              // 匹配成功
              commit("updateOpponent", {
                id: result.userId,
                userName: result.oppoUserName,
                avatar: "",
              });
              commit("updateRoomId", result.roomId);
              commit("updateMatchStatus", MatchStatusEnum.MATCHED);
            } else {
              // 匹配失败
              commit("updateErrorMessage", result.message);
              commit("updateMatchStatus", MatchStatusEnum.IDLE);
            }
          },
          onError: (error) => {
            console.error("WebSocket错误:", error);
            commit("updateErrorMessage", "连接服务器失败");
            commit("updateMatchStatus", MatchStatusEnum.IDLE);
            commit("updateIsConnected", false);
          },
          onDisconnected: () => {
            console.log("WebSocket连接断开");
            commit("updateIsConnected", false);
          },
        });

        // 建立连接
        await websocket.connect();
        return { success: true };
      } catch (error) {
        console.error("开始匹配失败:", error);
        commit("updateErrorMessage", "开始匹配失败");
        commit("updateMatchStatus", MatchStatusEnum.IDLE);
        throw error;
      }
    },

    // 取消匹配
    async cancelMatching({ commit, state }: any) {
      try {
        if (state.websocket) {
          state.websocket.cancelMatch();
          state.websocket.close();
        }
        commit("updateMatchStatus", MatchStatusEnum.IDLE);
        commit("updateOpponent", null);
        commit("updateWebSocket", null);
        commit("updateIsConnected", false);
        commit("updateRoomId", null);
        return { success: true };
      } catch (error) {
        console.error("取消匹配失败:", error);
        return { success: false, message: "取消匹配失败" };
      }
    },

    // 开始对战
    startBattle({ commit, state }: any) {
      if (state.matchStatus !== MatchStatusEnum.MATCHED) {
        throw new Error("匹配状态不正确");
      }
      commit("updateMatchStatus", MatchStatusEnum.BATTLING);
      return { success: true };
    },

    // 结束对战
    endBattle({ commit }: any, result: any) {
      commit("updateMatchResult", result);
      commit("updateMatchStatus", MatchStatusEnum.COMPLETED);
    },

    // 重置匹配状态
    resetMatch({ commit, state }: any) {
      if (state.websocket) {
        state.websocket.close();
      }
      commit("updateMatchStatus", MatchStatusEnum.IDLE);
      commit("updateOpponent", null);
      commit("updateCurrentQuestion", null);
      commit("updateMatchResult", null);
      commit("updateWebSocket", null);
      commit("updateIsConnected", false);
      commit("updateRoomId", null);
      commit("updateErrorMessage", null);
    },
  },
  mutations: {
    updateMatchStatus(state: any, status: any) {
      state.matchStatus = status;
    },
    updateOpponent(state: any, opponent: any) {
      state.opponent = opponent;
    },
    updateCurrentQuestion(state: any, question: any) {
      state.currentQuestion = question;
    },
    updateMatchResult(state: any, result: any) {
      state.matchResult = result;
    },
    updateWebSocket(state: any, websocket: any) {
      state.websocket = websocket;
    },
    updateRoomId(state: any, roomId: any) {
      state.roomId = roomId;
    },
    updateIsConnected(state: any, isConnected: any) {
      state.isConnected = isConnected;
    },
    updateErrorMessage(state: any, errorMessage: any) {
      state.errorMessage = errorMessage;
    },
  },
  getters: {
    isMatching(state: any) {
      return state.matchStatus === MatchStatusEnum.MATCHING;
    },
    isMatched(state: any) {
      return state.matchStatus === MatchStatusEnum.MATCHED;
    },
    isBattling(state: any) {
      return state.matchStatus === MatchStatusEnum.BATTLING;
    },
    isCompleted(state: any) {
      return state.matchStatus === MatchStatusEnum.COMPLETED;
    },
  },
};
