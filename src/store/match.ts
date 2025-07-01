/**
 * 对战匹配状态管理模块
 */
import { Module } from "vuex";
import type {
  MatchState,
  MatchResponse,
  QueryMatchResponse,
  OpponentInfo,
  QuestionInfo,
  BattleResult,
  ClientMatchMessage,
  ServerMatchMessage,
  PollingConfig,
  WebSocketConfig,
} from "@/types/match";
import { MatchStatus, ConnectionStatus } from "@/types/match";
import { MatchWebSocket } from "@/utils/websocket";

// 默认配置
const DEFAULT_POLLING_CONFIG: PollingConfig = {
  interval: 2000,
  maxAttempts: 5,
  timeout: 120000,
};

const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: "ws://139.9.144.238:8106/api/1v1match/api/matched/ws",
  reconnectInterval: 3000, // 重连间隔时间
  maxReconnectAttempts: 5, // 最大重连次数
  heartbeatInterval: 30000, // 心跳
};

// 扩展window类型
declare global {
  interface Window {
    matchWebSocket?: MatchWebSocket;
    currentUserId?: string;
  }
}

const matchModule: Module<MatchState, unknown> = {
  namespaced: true,

  state: (): MatchState => ({
    status: MatchStatus.IDLE,
    connectionStatus: ConnectionStatus.DISCONNECTED,
    isMatching: false,
    isConnected: false,
    roomId: null,
    userId: null,
    opponent: null,
    currentQuestion: null,
    battleResult: null,
    errorMessage: null,
    lastSubmitId: null,
    submitResults: [],
  }),

  getters: {
    isMatching: (state) => state.status === MatchStatus.MATCHING,
    isMatched: (state) => state.status === MatchStatus.MATCHED,
    isBattling: (state) => state.status === MatchStatus.BATTLE,
    isEnded: (state) => state.status === MatchStatus.ENDED,
    canStartBattle: (state) =>
      state.status === MatchStatus.MATCHED &&
      state.roomId &&
      state.opponent &&
      state.isConnected,
  },

  mutations: {
    SET_STATUS(state, status: MatchStatus) {
      state.status = status;
      state.isMatching = status === MatchStatus.MATCHING;
    },

    SET_CONNECTION_STATUS(state, status: ConnectionStatus) {
      state.connectionStatus = status;
      state.isConnected = status === ConnectionStatus.CONNECTED;
    },

    SET_MATCH_INFO(state, info: Partial<MatchState>) {
      Object.assign(state, info);
    },

    SET_OPPONENT(state, opponent: OpponentInfo | null) {
      state.opponent = opponent;
    },

    SET_CURRENT_QUESTION(state, question: QuestionInfo | null) {
      state.currentQuestion = question;
    },

    SET_BATTLE_RESULT(state, result: BattleResult | null) {
      state.battleResult = result;
    },

    SET_ERROR(state, message: string | null) {
      state.errorMessage = message;
    },

    SET_SUBMIT_RESULT(
      state,
      result: { questionSubmitId: string; status: 0 | 1 | 2 }
    ) {
      state.lastSubmitId = result.questionSubmitId;
      state.submitResults.push(result);
    },

    RESET_STATE(state) {
      state.status = MatchStatus.IDLE;
      state.connectionStatus = ConnectionStatus.DISCONNECTED;
      state.isMatching = false;
      state.isConnected = false;
      state.roomId = null;
      state.userId = null;
      state.opponent = null;
      state.currentQuestion = null;
      state.battleResult = null;
      state.errorMessage = null;
      state.lastSubmitId = null;
      state.submitResults = [];
    },
  },

  actions: {
    async startMatching({ commit, dispatch }) {
      try {
        commit("SET_STATUS", MatchStatus.MATCHING);
        commit("SET_ERROR", null);

        const response = await fetch(
          "https://139.9.144.238:8101/api/1v1match/match",
          {
            method: "GET",
            credentials: "include",
          }
        );
        console.log("startMatching, response:", response);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("获取/api/match的data");
        const data: MatchResponse = await response.json();
        console.log("获取获取/api/match的data成功", data);

        if (data.success) {
          commit("SET_MATCH_INFO", {
            roomId: data.roomId,
            userId: data.userId,
            opponent: data.opponentName
              ? {
                  userId: "",
                  userName: data.opponentName,
                }
              : null,
          });
          commit("SET_STATUS", MatchStatus.MATCHED);
          await dispatch("connectWebSocket");
        } else {
          await dispatch("startPolling");
        }
      } catch (error) {
        console.error("开始匹配失败:", error);
        commit("SET_ERROR", "匹配失败，请稍后重试");
        commit("SET_STATUS", MatchStatus.IDLE);
        throw error;
      }
    },

    async startPolling({ commit, dispatch, state }) {
      let attempts = 0;
      const startTime = Date.now();

      const poll = async (): Promise<void> => {
        try {
          if (
            attempts >= DEFAULT_POLLING_CONFIG.maxAttempts ||
            Date.now() - startTime > DEFAULT_POLLING_CONFIG.timeout
          ) {
            throw new Error("匹配超时");
          }

          if (state.status !== MatchStatus.MATCHING) {
            return;
          }

          attempts++;
          console.log(`轮询匹配结果 - 第${attempts}次尝试`);

          const response = await fetch(
            "https://139.9.144.238:8101/api/1v1match/querymatch",
            {
              method: "GET",
              credentials: "include",
            }
          );

          console.log("pool轮询返回：", response);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: QueryMatchResponse = await response.json();
          console.log("pool轮询data：", data);

          if (data.success) {
            commit("SET_MATCH_INFO", {
              roomId: data.roomId,
              userId: data.userId,
              opponent: data.opponentName
                ? {
                    userId: "",
                    userName: data.opponentName,
                  }
                : null,
            });
            commit("SET_STATUS", MatchStatus.MATCHED);
            await dispatch("connectWebSocket");
          } else {
            setTimeout(poll, DEFAULT_POLLING_CONFIG.interval);
          }
        } catch (error) {
          console.error("轮询匹配失败:", error);
          commit("SET_ERROR", "匹配失败，请稍后重试");
          commit("SET_STATUS", MatchStatus.IDLE);
        }
      };

      setTimeout(poll, DEFAULT_POLLING_CONFIG.interval);
    },

    async connectWebSocket({ commit, dispatch, state }) {
      if (!state.userId) {
        throw new Error("缺少用户ID，无法建立WebSocket连接");
      }

      try {
        console.log("1");
        commit("SET_CONNECTION_STATUS", ConnectionStatus.CONNECTING);
        console.log("2");

        const ws = new MatchWebSocket(DEFAULT_WEBSOCKET_CONFIG);
        console.log("3");

        ws.on("open", () => {
          console.log("4");
          commit("SET_CONNECTION_STATUS", ConnectionStatus.CONNECTED);
          console.log("WebSocket连接成功");
        });

        ws.on("close", () => {
          console.log("5");
          commit("SET_CONNECTION_STATUS", ConnectionStatus.DISCONNECTED);
          console.log("WebSocket连接关闭");
        });

        ws.on("error", (error) => {
          console.log("5");
          console.error("WebSocket错误:", error);
          commit("SET_ERROR", "连接失败，请检查网络");
        });

        ws.on("message", (message: ServerMatchMessage) => {
          console.log("5");
          dispatch("handleWebSocketMessage", message);
        });

        ws.on("reconnect", () => {
          console.log("6");
          if (state.userId) {
            ws.connect(state.userId);
          }
        });

        ws.on("reconnect_failed", () => {
          console.log("7");
          commit("SET_ERROR", "连接失败，请重新匹配");
          dispatch("cancelMatching");
        });

        await ws.connect(state.userId);
        window.matchWebSocket = ws;
      } catch (error) {
        console.log("8");
        console.error("WebSocket连接失败:", error);
        commit("SET_CONNECTION_STATUS", ConnectionStatus.DISCONNECTED);
        commit("SET_ERROR", "连接失败，请稍后重试");
        throw error;
      }
    },

    handleWebSocketMessage({ commit }, message: ServerMatchMessage) {
      console.log("处理WebSocket消息:", message);

      switch (message.type) {
        case "QUERY_PROBLEM": {
          if (message.title && message.content) {
            const question: QuestionInfo = {
              id: message.questionId || "",
              title: message.title,
              content: message.content,
              difficulty: "medium",
              tags: message.tags || [],
              judgeConfig: message.judgeConfig,
            };
            commit("SET_CURRENT_QUESTION", question);
            commit("SET_STATUS", MatchStatus.BATTLE);
          }
          break;
        }

        case "SUBMIT_ANSWER": {
          if (message.questionSubmitId) {
            commit("SET_SUBMIT_RESULT", {
              questionSubmitId: message.questionSubmitId,
              status: message.ans_success || 0,
            });
          }
          break;
        }

        case "QUERY_SUBMIT": {
          if (message.questionSubmitId && message.ans_success !== undefined) {
            if (message.ans_success === 2) {
              const currentUserId = window.currentUserId;
              const result: BattleResult = {
                winner: message.userId === currentUserId ? "我" : "对手",
                loser: message.userId === currentUserId ? "对手" : "我",
                time: Date.now(),
                reason: "correct_answer",
              };
              commit("SET_BATTLE_RESULT", result);
              commit("SET_STATUS", MatchStatus.ENDED);
            }
          }
          break;
        }

        case "OPPONENT_GIVEUP": {
          const result: BattleResult = {
            winner: "我",
            loser: "对手",
            time: Date.now(),
            reason: "opponent_giveup",
          };
          commit("SET_BATTLE_RESULT", result);
          commit("SET_STATUS", MatchStatus.ENDED);
          break;
        }

        default:
          console.log("未处理的消息类型:", message.type);
      }
    },

    sendWebSocketMessage({ state }, message: ClientMatchMessage) {
      const ws = window.matchWebSocket;
      if (!ws) {
        throw new Error("WebSocket未连接");
      }

      if (state.roomId) {
        message.roomId = state.roomId;
      }

      return ws.send(message);
    },

    async startBattle({ dispatch, commit }) {
      try {
        commit("SET_STATUS", MatchStatus.BATTLE);
        await dispatch("sendWebSocketMessage", {
          type: "QUERY_PROBLEM",
        });
      } catch (error) {
        console.error("开始对战失败:", error);
        commit("SET_ERROR", "开始对战失败");
        throw error;
      }
    },

    async submitAnswer({ dispatch }, { code, language, questionId }) {
      try {
        await dispatch("sendWebSocketMessage", {
          type: "SUBMIT_ANSWER",
          code,
          language,
          questionId,
        });
      } catch (error) {
        console.error("提交答案失败:", error);
        throw error;
      }
    },

    async querySubmitResult({ dispatch }, questionSubmitId: string) {
      try {
        await dispatch("sendWebSocketMessage", {
          type: "QUERY_SUBMIT",
          questionSubmitId,
        });
      } catch (error) {
        console.error("查询提交结果失败:", error);
        throw error;
      }
    },

    async giveupBattle({ dispatch, commit }) {
      try {
        await dispatch("sendWebSocketMessage", {
          type: "GIVEUP_PLAY",
        });

        const result: BattleResult = {
          winner: "对手",
          loser: "我",
          time: Date.now(),
          reason: "opponent_giveup",
        };
        commit("SET_BATTLE_RESULT", result);
        commit("SET_STATUS", MatchStatus.ENDED);
      } catch (error) {
        console.error("放弃对战失败:", error);
        throw error;
      }
    },

    async cancelMatching({ commit }) {
      try {
        const ws = window.matchWebSocket;
        if (ws) {
          ws.close();
          window.matchWebSocket = undefined;
        }
        commit("RESET_STATE");
      } catch (error) {
        console.error("取消匹配失败:", error);
        throw error;
      }
    },

    endBattle({ commit }, result: BattleResult) {
      commit("SET_BATTLE_RESULT", result);
      commit("SET_STATUS", MatchStatus.ENDED);
    },

    reset({ commit }) {
      const ws = window.matchWebSocket;
      if (ws) {
        ws.close();
        window.matchWebSocket = undefined;
      }
      commit("RESET_STATE");
    },
  },
};

export default matchModule;
