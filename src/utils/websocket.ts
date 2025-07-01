// WebSocket匹配服务
// 接口定义
export interface MatchResponse {
  success: boolean; // 是否匹配成功
  message: string; // 备注
  roomId?: string; // 成功时的房间号
  userId: string; // 自己的userId
  oppoUserName?: string; // 成功时对手名称
}

// 客户端向服务端发送的消息
export interface ClientMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "QUERY_SUBMIT" | "GIVEUP_PLAY";
  roomId?: string;
  questionId?: string;
  code?: string;
  language?: string;
  questionSubmitId?: string;
}

// 服务端向客户端发送的消息
export interface ServerMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "QUERY_SUBMIT" | "GIVEUP_PLAY";
  questionId?: string;
  title?: string;
  content?: string;
  judgeConfig?: Record<string, unknown>;
  tags?: string[];
  questionSubmitId?: string;
  ans_success?: number; // 0: 判题中, 1: 作答失败, 2: 作答成功
  userId?: string;
}

// 匹配服务类
export class MatchService {
  private baseUrl: string;
  private pollingInterval: number | null = null;
  private isPolling = false;

  constructor(serverUrl?: string) {
    // 直接使用指定的服务器地址
    this.baseUrl = serverUrl || "https://139.9.144.238:8101";
  }

  // 发起初次匹配请求
  async startMatch(): Promise<MatchResponse> {
    try {
      console.log("发起匹配请求...");
      console.log("请求URL:", `${this.baseUrl}/api/1v1match/match`);
      const response = await fetch(`${this.baseUrl}/api/1v1match/match`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`${this.baseUrl}/api/1v1match/match 返回：`, response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("匹配请求结果:", result);
      return result;
    } catch (error) {
      console.error("匹配请求失败:", error);
      throw error;
    }
  }

  // 查询匹配状态
  async queryMatch(): Promise<MatchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/1v1match/querymatch`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("查询匹配结果:", result);
      return result;
    } catch (error) {
      console.error("查询匹配失败:", error);
      throw error;
    }
  }

  // 开始轮询匹配状态
  startPolling(
    onMatchResult: (result: MatchResponse) => void,
    interval = 2000
  ) {
    if (this.isPolling) {
      console.log("已在轮询中，跳过重复启动");
      return;
    }

    this.isPolling = true;
    console.log("开始轮询匹配状态，间隔:", interval, "ms");

    this.pollingInterval = window.setInterval(async () => {
      try {
        const result = await this.queryMatch();

        if (result.success) {
          console.log("轮询匹配成功！");
          this.stopPolling();
          onMatchResult(result);
        } else {
          console.log("继续等待匹配...", result.message);
        }
      } catch (error) {
        console.error("轮询匹配出错:", error);
        // 继续轮询，不停止
      }
    }, interval);
  }

  // 停止轮询
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log("停止轮询匹配状态");
  }

  // 完整的匹配流程
  async performMatch(
    onMatchResult: (result: MatchResponse) => void
  ): Promise<void> {
    try {
      // 1. 发起初次匹配
      const initialResult = await this.startMatch();

      if (initialResult.success) {
        // 直接匹配成功
        console.log("初次匹配成功！");
        onMatchResult(initialResult);
      } else {
        // 匹配失败，开始轮询
        console.log("初次匹配失败，开始轮询...");
        this.startPolling(onMatchResult);
      }
    } catch (error) {
      console.error("匹配流程出错:", error);
      throw error;
    }
  }
}

export class MatchWebSocket {
  private ws: WebSocket | null = null; // web socket连接对象
  private url: string;
  private userId: string;
  private roomId: string;
  private reconnectAttempts = 0; // 当前重连次数
  private maxReconnectAttempts = 5; // 最大重连次数
  private reconnectInterval = 3000; // 重连间隔
  private heartbeatInterval: number | null = null;
  private isManualClose = false;

  // 回调函数
  private onProblemReceived?: (message: ServerMatchMessage) => void;
  private onSubmitResult?: (message: ServerMatchMessage) => void;
  private onQueryResult?: (message: ServerMatchMessage) => void;
  private onGameEnd?: (message: ServerMatchMessage) => void;
  private onConnected?: () => void;
  private onError?: (error: Event) => void;
  private onDisconnected?: () => void;

  constructor(serverUrl: string, userId: string, roomId: string) {
    // 确保正确的WebSocket URL格式
    const cleanServerUrl = serverUrl.replace(/^https?:\/\//, "");
    this.url = `ws://${cleanServerUrl}/ws?userId=${userId}`;
    this.userId = userId;
    this.roomId = roomId;
    console.log("WebSocket配置初始化:");
    console.log("- 原始服务器地址:", serverUrl);
    console.log("- 清理后的地址:", cleanServerUrl);
    console.log("- 最终WebSocket URL:", this.url);
    console.log("- 用户ID:", userId);
    console.log("- 房间ID:", roomId);
  }

  // 设置回调函数
  setCallbacks(callbacks: {
    onProblemReceived?: (message: ServerMatchMessage) => void;
    onSubmitResult?: (message: ServerMatchMessage) => void;
    onQueryResult?: (message: ServerMatchMessage) => void;
    onGameEnd?: (message: ServerMatchMessage) => void;
    onConnected?: () => void;
    onError?: (error: Event) => void;
    onDisconnected?: () => void;
  }) {
    this.onProblemReceived = callbacks.onProblemReceived;
    this.onSubmitResult = callbacks.onSubmitResult;
    this.onQueryResult = callbacks.onQueryResult;
    this.onGameEnd = callbacks.onGameEnd;
    this.onConnected = callbacks.onConnected;
    this.onError = callbacks.onError;
    this.onDisconnected = callbacks.onDisconnected;
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("开始建立WebSocket连接...");
        console.log("连接URL:", this.url);
        console.log("用户ID:", this.userId);

        // 检查WebSocket支持
        if (!window.WebSocket) {
          throw new Error("浏览器不支持WebSocket");
        }

        // 设置连接超时
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error("WebSocket连接超时"));
          }
        }, 10000); // 10秒超时

        this.ws = new WebSocket(this.url);
        console.log("WebSocket对象已创建");

        this.ws.onopen = () => {
          console.log("WebSocket连接成功");
          clearTimeout(connectionTimeout); // 清除超时
          this.reconnectAttempts = 0;
          this.startHeartbeat();

          this.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ServerMatchMessage;
            console.log("收到WebSocket消息:", message);

            switch (message.type) {
              case "QUERY_PROBLEM":
                this.onProblemReceived?.(message);
                break;
              case "SUBMIT_ANSWER":
                this.onSubmitResult?.(message);
                break;
              case "QUERY_SUBMIT":
                this.onQueryResult?.(message);
                break;
              case "GIVEUP_PLAY":
                this.onGameEnd?.(message);
                break;
              default:
                console.log("收到心跳响应或未知消息类型");
            }
          } catch (error) {
            console.error("解析WebSocket消息失败:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket错误详情:", {
            url: this.url,
            readyState: this.ws?.readyState,
            error: error,
          });
          clearTimeout(connectionTimeout);
          this.onError?.(error);
          reject(new Error(`WebSocket连接失败: ${this.url}`));
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket连接关闭详情:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: this.url,
          });
          clearTimeout(connectionTimeout);
          this.stopHeartbeat();
          this.onDisconnected?.();

          if (
            !this.isManualClose &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error("创建WebSocket连接失败:", error);
        reject(error);
      }
    });
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("PING");
      }
    }, 30000); // 每30秒发送一次心跳
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 尝试重连
  private attemptReconnect() {
    this.reconnectAttempts++;
    console.log(
      `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch(() => {
        console.log("重连失败");
      });
    }, this.reconnectInterval);
  }

  // 发送消息
  private sendMessage(message: ClientMatchMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log("发送消息:", message);
    } else {
      console.warn("WebSocket未连接，无法发送消息");
    }
  }

  // 请求题目
  queryProblem() {
    this.sendMessage({
      type: "QUERY_PROBLEM",
      roomId: this.roomId,
    });
  }

  // 提交答案
  submitAnswer(questionId: string, code: string, language: string) {
    this.sendMessage({
      type: "SUBMIT_ANSWER",
      questionId,
      code,
      language,
    });
  }

  // 查询提交结果
  querySubmit(questionSubmitId: string) {
    this.sendMessage({
      type: "QUERY_SUBMIT",
      questionSubmitId,
      roomId: this.roomId,
    });
  }

  // 放弃游戏
  giveupPlay() {
    this.sendMessage({
      type: "GIVEUP_PLAY",
      roomId: this.roomId,
    });
  }

  // 测试服务器连接性
  async testConnection(): Promise<boolean> {
    try {
      // 尝试连接到HTTP端口检查服务器是否可达
      const httpUrl = this.url
        .replace("ws://", "http://")
        .replace("/ws", "")
        .split("?")[0]; // 移除查询参数
      console.log("测试HTTP连接:", httpUrl);

      await fetch(httpUrl, {
        method: "GET",
        mode: "no-cors", // 避免CORS问题
      });

      console.log("HTTP连接测试完成");
      return true;
    } catch (error) {
      console.error("服务器连接测试失败:", error);
      return false;
    }
  }

  // 关闭连接
  close() {
    this.isManualClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 获取连接状态
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  // 是否已连接
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
