// WebSocket匹配服务
// 接口定义
export interface MatchResponse {
  success: boolean; // 是否匹配成功
  message: string; // 备注
  roomId?: string; // 成功时的房间号
  userId: string; // 自己的userId
  oppoUserName?: string; // 成功时对手名称
}

export class MatchWebSocket {
  private ws: WebSocket | null = null; // web socket连接对象
  private url: string;
  private userName: string;
  private reconnectAttempts = 0; // 当前重连次数
  private maxReconnectAttempts = 5; // 最大重连次数
  private reconnectInterval = 3000; // 重连间隔
  private heartbeatInterval: number | null = null;
  private isManualClose = false;

  // 回调函数
  private onMatchResult?: (result: MatchResponse) => void;
  private onConnected?: () => void;
  private onError?: (error: Event) => void;
  private onDisconnected?: () => void;

  constructor(serverUrl: string, userName: string) {
    this.url = `${serverUrl}/api/1v1match/ws`;
    this.userName = userName;
  }

  // 设置回调函数
  setCallbacks(callbacks: {
    onMatchResult?: (result: MatchResponse) => void;
    onConnected?: () => void;
    onError?: (error: Event) => void;
    onDisconnected?: () => void;
  }) {
    this.onMatchResult = callbacks.onMatchResult;
    this.onConnected = callbacks.onConnected;
    this.onError = callbacks.onError;
    this.onDisconnected = callbacks.onDisconnected;
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("1");
        console.log("正在连接WebSocket:", this.url);
        console.log("2");
        this.ws = new WebSocket(this.url);
        console.log("3");

        this.ws.onopen = () => {
          console.log("WebSocket连接成功");
          this.reconnectAttempts = 0;
          this.startHeartbeat();

          // 发送用户名到服务器
          this.sendMessage({
            type: "JOIN_MATCH",
            userName: this.userName,
          });

          this.onConnected?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("收到WebSocket消息:", data);

            if (data.type === "MATCH_RESULT") {
              this.onMatchResult?.(data.data as MatchResponse);
            } else if (data.type === "PONG") {
              // 心跳响应
              console.log("收到心跳响应");
            }
          } catch (error) {
            console.error("解析WebSocket消息失败:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket错误:", error);
          this.onError?.(error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket连接关闭:", event.code, event.reason);
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

  // 发送消息
  private sendMessage(message: Record<string, string | number | boolean>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket未连接，无法发送消息");
    }
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.sendMessage({ type: "PING" });
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

  // 取消匹配
  cancelMatch() {
    this.sendMessage({
      type: "CANCEL_MATCH",
      userName: this.userName,
    });
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
