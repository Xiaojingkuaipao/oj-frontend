/**
 * 全局WebSocket管理工具
 */
import { MatchWebSocket } from "./websocket";

// 扩展window类型
declare global {
  interface Window {
    matchWebSocket?: MatchWebSocket;
    currentUserId?: string;
  }
}

export const getMatchWebSocket = (): MatchWebSocket | undefined => {
  return window.matchWebSocket;
};

export const setMatchWebSocket = (ws: MatchWebSocket | null): void => {
  window.matchWebSocket = ws || undefined;
};

export const getCurrentUserId = (): string | undefined => {
  return window.currentUserId;
};

export const setCurrentUserId = (userId: string | null): void => {
  window.currentUserId = userId || undefined;
};
