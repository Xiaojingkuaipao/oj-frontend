/**
 * 在线对战相关的TypeScript类型定义
 */

// 匹配状态枚举
export enum MatchStatus {
  IDLE = "idle", // 空闲状态
  MATCHING = "matching", // 匹配中
  MATCHED = "matched", // 匹配成功
  BATTLE = "battle", // 对战中
  ENDED = "ended", // 对战结束
}

// WebSocket连接状态枚举
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
}

// 匹配接口响应
export interface MatchResponse {
  success: boolean;
  roomId?: string;
  userId?: string;
  userName?: string;
  oppoUserName?: string;
  message?: string;
}

// 查询匹配接口响应
export interface QueryMatchResponse {
  success: boolean;
  roomId?: string;
  userId?: string;
  userName?: string;
  oppoUserName?: string;
  message?: string;
}

// 用户信息
export interface UserInfo {
  userId: string;
  userName: string;
}

// 对手信息
export interface OpponentInfo extends UserInfo {
  avatar?: string;
}

// 房间信息
export interface RoomInfo {
  roomId: string;
  users: UserInfo[];
  questionId?: string;
}

// 客户端发送的WebSocket消息
export interface ClientMatchMessage {
  type: "QUERY_PROBLEM" | "SUBMIT_ANSWER" | "QUERY_SUBMIT" | "GIVEUP_PLAY";
  roomId?: string;
  questionId?: string;
  code?: string;
  language?: string;
  questionSubmitId?: string;
}

// 服务端发送的WebSocket消息
export interface ServerMatchMessage {
  type:
    | "QUERY_PROBLEM"
    | "SUBMIT_ANSWER"
    | "QUERY_SUBMIT"
    | "GIVEUP_PLAY"
    | "MATCH_START"
    | "OPPONENT_GIVEUP";
  questionId?: string;
  title?: string;
  content?: string;
  judgeConfig?: {
    timeLimit?: number;
    memoryLimit?: number;
  };
  tags?: string[];
  questionSubmitId?: string;
  ans_success?: 0 | 1 | 2; // 0:判题中 1:答案错误 2:有人答对
  userId?: string;
  userName?: string;
  message?: string;
}

// 题目信息
export interface QuestionInfo {
  id: string;
  title: string;
  content: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  judgeConfig?: {
    timeLimit?: number;
    memoryLimit?: number;
  };
}

// 答题结果
export interface SubmitResult {
  questionSubmitId: string;
  status: 0 | 1 | 2; // 0:判题中 1:答案错误 2:答案正确
  message?: string;
  executionTime?: number;
  memoryUsage?: number;
}

// 对战结果
export interface BattleResult {
  winner: string;
  loser: string;
  time: number; // 用时（毫秒）
  winnerSubmitTime?: number;
  loserSubmitTime?: number;
  reason?: "correct_answer" | "opponent_giveup" | "timeout";
}

// 匹配状态
export interface MatchState {
  status: MatchStatus;
  connectionStatus: ConnectionStatus;
  isMatching: boolean;
  isConnected: boolean;
  roomId: string | null;
  userId: string | null;
  opponent: OpponentInfo | null;
  currentQuestion: QuestionInfo | null;
  battleResult: BattleResult | null;
  errorMessage: string | null;
  lastSubmitId: string | null;
  submitResults: SubmitResult[];
}

// WebSocket事件回调类型
export type WebSocketEventCallback = (data: unknown) => void;

// WebSocket事件映射
export interface WebSocketEventMap {
  open: () => void;
  close: (event: CloseEvent) => void;
  error: (error: Event) => void;
  message: (message: ServerMatchMessage) => void;
  reconnect: () => void;
  reconnect_failed: () => void;
}

// 代码提交请求
export interface CodeSubmitRequest {
  questionId: string;
  code: string;
  language: string;
  roomId: string;
}

// 轮询配置
export interface PollingConfig {
  interval: number; // 轮询间隔（毫秒）
  maxAttempts: number; // 最大尝试次数
  timeout: number; // 超时时间（毫秒）
}

// WebSocket配置
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

// 错误类型
export interface MatchError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
