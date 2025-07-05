/**
 * WebSocket连接管理工具类
 */
import type {
  ClientMatchMessage,
  ServerMatchMessage,
  WebSocketConfig,
  WebSocketEventMap,
} from "@/types/match";
import { ConnectionStatus } from "@/types/match";

export class MatchWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventListeners: Map<keyof WebSocketEventMap, Array<any>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.initEventListeners();
  }

  /**
   * 初始化事件监听器映射
   */
  private initEventListeners() {
    this.eventListeners.set("open", []);
    this.eventListeners.set("close", []);
    this.eventListeners.set("error", []);
    this.eventListeners.set("message", []);
    this.eventListeners.set("reconnect", []);
    this.eventListeners.set("reconnect_failed", []);
  }

  /**
   * 建立WebSocket连接
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws?.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }

        // 构建WebSocket URL
        const wsUrl = `${this.config.url}?userId=${userId}`;
        console.log("连接WebSocket:", wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket连接成功");
          this.reconnectCount = 0;
          //   this.startHeartbeat();
          this.emit("open");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ServerMatchMessage;
            console.log("收到WebSocket消息:", message);
            this.emit("message", message);
          } catch (error) {
            console.error("解析WebSocket消息失败:", error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket连接关闭:", event.code, event.reason);
          this.stopHeartbeat();
          this.emit("close", event);

          // 如果不是主动关闭且未销毁，则尝试重连
          if (!this.isDestroyed && event.code !== 1000) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket错误:", error);
          this.emit("error", error);
          reject(new Error("WebSocket连接失败"));
        };
      } catch (error) {
        console.error("创建WebSocket连接失败:", error);
        reject(error);
      }
    });
  }

  /**
   * 发送消息
   */
  send(message: ClientMatchMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket未连接，无法发送消息");
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
      console.log("发送WebSocket消息:", message);
      return true;
    } catch (error) {
      console.error("发送WebSocket消息失败:", error);
      return false;
    }
  }

  /**
   * 关闭连接
   */
  close() {
    this.isDestroyed = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, "主动关闭");
      this.ws = null;
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): ConnectionStatus {
    if (!this.ws) {
      return ConnectionStatus.DISCONNECTED;
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return ConnectionStatus.CONNECTING;
      case WebSocket.OPEN:
        return ConnectionStatus.CONNECTED;
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return this.reconnectTimer
          ? ConnectionStatus.RECONNECTING
          : ConnectionStatus.DISCONNECTED;
      default:
        return ConnectionStatus.DISCONNECTED;
    }
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect() {
    if (
      this.isDestroyed ||
      this.reconnectCount >= this.config.maxReconnectAttempts
    ) {
      console.log("重连失败，已达最大重连次数");
      this.emit("reconnect_failed");
      return;
    }

    this.reconnectCount++;
    console.log(`准备第${this.reconnectCount}次重连...`);

    this.reconnectTimer = setTimeout(() => {
      if (this.isDestroyed) return;

      // 重连需要获取最新的userId
      this.emit("reconnect");
    }, this.config.reconnectInterval);
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // 发送心跳消息，可以是ping消息或简单的查询消息
        this.ws.send(JSON.stringify({ type: "HEARTBEAT" }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 事件监听
   */
  on<K extends keyof WebSocketEventMap>(
    event: K,
    callback: WebSocketEventMap[K]
  ) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof WebSocketEventMap>(
    event: K,
    callback: WebSocketEventMap[K]
  ) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof WebSocketEventMap>(
    event: K,
    ...args: Parameters<WebSocketEventMap[K]>
  ) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`事件处理器错误 (${event}):`, error);
      }
    });
  }

  /**
   * 手动触发重连
   */
  reconnect(userId: string) {
    this.close();
    this.isDestroyed = false;
    this.reconnectCount = 0;
    return this.connect(userId);
  }
}
