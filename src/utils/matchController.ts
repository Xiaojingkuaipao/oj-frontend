// 1v1匹配和对战服务的使用示例
import {
  MatchService,
  MatchWebSocket,
  MatchResponse,
  ServerMatchMessage,
} from "@/utils/websocket";

export class MatchController {
  private matchService: MatchService;
  private webSocket: MatchWebSocket | null = null;
  private serverUrl = "https://139.9.144.238:8101";

  constructor() {
    this.matchService = new MatchService(this.serverUrl);
  }

  // 点击1v1对战按钮后的完整流程
  async startMatch(userId: string): Promise<void> {
    try {
      console.log("开始1v1匹配流程...");

      // 使用新的匹配流程
      await this.matchService.performMatch((matchResult: MatchResponse) => {
        if (matchResult.success && matchResult.roomId) {
          console.log("匹配成功！开始建立WebSocket连接...");
          this.createWebSocketConnection(userId, matchResult.roomId);
        }
      });
    } catch (error) {
      console.error("匹配流程失败:", error);
      throw error;
    }
  }

  // 创建WebSocket连接（仅在匹配成功后调用）
  private async createWebSocketConnection(
    userId: string,
    roomId: string
  ): Promise<void> {
    try {
      console.log("创建WebSocket连接...", { userId, roomId });

      this.webSocket = new MatchWebSocket(this.serverUrl, userId, roomId);

      // 设置回调函数
      this.webSocket.setCallbacks({
        onConnected: () => {
          console.log("WebSocket连接成功，开始请求题目...");
          // 连接成功后立即请求题目
          this.webSocket?.queryProblem();
        },

        onProblemReceived: (message: ServerMatchMessage) => {
          console.log("收到题目:", {
            questionId: message.questionId,
            title: message.title,
            content: message.content,
            judgeConfig: message.judgeConfig,
            tags: message.tags,
          });
          // 在这里处理题目显示逻辑
          this.handleProblemReceived(message);
        },

        onSubmitResult: (message: ServerMatchMessage) => {
          console.log("收到提交结果:", {
            questionSubmitId: message.questionSubmitId,
          });
          // 开始轮询提交结果
          if (message.questionSubmitId) {
            this.startQuerySubmitPolling(message.questionSubmitId);
          }
        },

        onQueryResult: (message: ServerMatchMessage) => {
          console.log("收到查询结果:", {
            ans_success: message.ans_success,
            userId: message.userId,
          });
          this.handleQueryResult(message);
        },

        onGameEnd: (message: ServerMatchMessage) => {
          console.log("游戏结束:", {
            userId: message.userId,
          });
          this.handleGameEnd(message);
        },
        onError: (error: Event) => {
          console.error("WebSocket连接错误:", error);
        },

        onDisconnected: () => {
          console.log("WebSocket连接断开");
        },
      });

      // 建立连接
      await this.webSocket.connect();
    } catch (error) {
      console.error("WebSocket连接失败:", error);
      throw error;
    }
  }

  // 处理收到的题目
  private handleProblemReceived(message: ServerMatchMessage): void {
    // 在这里实现题目显示逻辑
    // 例如：更新Vue组件的状态，显示题目内容
    console.log("显示题目:", message.title);
  }

  // 提交答案
  async submitAnswer(
    questionId: string,
    code: string,
    language: string
  ): Promise<void> {
    if (!this.webSocket || !this.webSocket.isConnected()) {
      throw new Error("WebSocket未连接");
    }

    console.log("提交答案:", { questionId, language });
    this.webSocket.submitAnswer(questionId, code, language);
  }

  // 开始轮询提交结果
  private startQuerySubmitPolling(questionSubmitId: string): void {
    const pollInterval = setInterval(() => {
      if (this.webSocket && this.webSocket.isConnected()) {
        this.webSocket.querySubmit(questionSubmitId);
      } else {
        clearInterval(pollInterval);
      }
    }, 2000); // 每2秒查询一次

    // 设置最大轮询时间（例如2分钟）
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  }

  // 处理查询结果
  private handleQueryResult(message: ServerMatchMessage): void {
    const { ans_success, userId } = message;

    switch (ans_success) {
      case 0:
        console.log("判题中，继续等待...");
        break;
      case 1:
        console.log("作答失败");
        // 处理答案错误的逻辑
        break;
      case 2:
        console.log("有人作答成功！");
        // 根据userId判断是自己还是对手成功
        this.handleMatchResult(userId);
        break;
    }
  }

  // 处理匹配结果
  private handleMatchResult(winnerUserId?: string): void {
    // 这里需要知道当前用户的ID来判断胜负
    // const currentUserId = getCurrentUserId(); // 从用户状态获取

    if (winnerUserId) {
      console.log("游戏结束，获胜者:", winnerUserId);
      // 显示游戏结果
    }

    // 关闭WebSocket连接
    this.closeConnection();
  }

  // 处理游戏结束（有人放弃）
  private handleGameEnd(message: ServerMatchMessage): void {
    console.log("有人放弃游戏:", message.userId);
    // 处理游戏结束逻辑
    this.closeConnection();
  }

  // 放弃游戏
  giveUp(): void {
    if (this.webSocket && this.webSocket.isConnected()) {
      this.webSocket.giveupPlay();
    }
    this.closeConnection();
  }

  // 关闭连接
  closeConnection(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    // 停止匹配轮询
    this.matchService.stopPolling();
  }
}

// 使用示例：
// const matchController = new MatchController();
//
// // 在1v1对战按钮点击时调用
// matchController.startMatch("用户ID").then(() => {
//   console.log("匹配流程启动成功");
// }).catch(error => {
//   console.error("匹配失败:", error);
// });
