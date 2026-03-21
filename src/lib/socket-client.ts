import { io, Socket } from "socket.io-client";

// ─── Event Types ────────────────────────────────────────────────────────────────

export interface CodeUpdateEvent {
  code: string;
  language?: string | null;
  questionIndex?: number;
  userId: string;
  timestamp: number;
}

export interface CursorPositionEvent {
  userId: string;
  userName: string;
  lineNumber: number;
  column: number;
  timestamp: number;
}

export interface ChatMessageEvent {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface AiLevelChangedEvent {
  newLevel: number;
  userId: string;
  timestamp: number;
}

export interface UserJoinedEvent {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface UserLeftEvent {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface SessionStatusEvent {
  status: string;
  userId: string;
  timestamp: number;
}

export interface SocketError {
  message: string;
}

// ─── Socket Manager ─────────────────────────────────────────────────────────────

let socket: Socket | null = null;
let currentSessionId: string | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function getSocket(): Socket | null {
  return socket;
}

export function isConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Connect to the socket server and join a session room.
 * Uses cookie-based auth (NextAuth JWT is sent automatically).
 * Gracefully degrades — returns null if connection fails.
 */
export function connectSocket(sessionId: string, _userId?: string): Socket | null {
  // Already connected to same session
  if (socket?.connected && currentSessionId === sessionId) {
    return socket;
  }

  // Disconnect previous connection if any
  disconnectSocket();

  try {
    socket = io({
      path: "/api/socketio",
      autoConnect: false,
      // Security: don't send credentials via query params
      withCredentials: true,
      // Reconnection settings
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Transport: start with polling, upgrade to websocket
      transports: ["polling", "websocket"],
      // Timeout
      timeout: 10000,
    });

    currentSessionId = sessionId;
    reconnectAttempts = 0;

    socket.on("connect", () => {
      reconnectAttempts = 0;
      socket?.emit("join-session", { sessionId });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
    });

    socket.on("connect_error", (err) => {
      reconnectAttempts++;
      console.warn(`[Socket] Connection error (attempt ${reconnectAttempts}):`, err.message);

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("[Socket] Max reconnection attempts reached, falling back to polling");
        // Don't disconnect — let the app fall back to HTTP polling
      }
    });

    socket.on("error", (data: SocketError) => {
      console.warn("[Socket] Server error:", data.message);
    });

    socket.connect();
    return socket;
  } catch (err) {
    console.warn("[Socket] Failed to initialize:", err);
    socket = null;
    return null;
  }
}

/**
 * Disconnect and clean up the socket connection.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentSessionId = null;
  reconnectAttempts = 0;
}

// ─── Convenience Emitters ───────────────────────────────────────────────────────

/** Emit a code update to the session room. */
export function emitCodeUpdate(code: string, language?: string | null, questionIndex?: number) {
  if (!socket?.connected) return;
  socket.emit("code-update", { code, language, questionIndex });
}

/** Emit cursor position (should be throttled by caller, ~100ms). */
export function emitCursorPosition(lineNumber: number, column: number) {
  if (!socket?.connected) return;
  socket.emit("cursor-position", { lineNumber, column });
}

/** Emit a chat message via socket (caller should also POST to HTTP for persistence). */
export function emitChatMessage(content: string) {
  if (!socket?.connected) return;
  socket.emit("chat-message", { content });
}

/** Emit AI level change notification. */
export function emitAiLevelChanged(newLevel: number) {
  if (!socket?.connected) return;
  socket.emit("ai-level-changed", { newLevel });
}

/** Emit session status change. */
export function emitSessionStatus(status: string) {
  if (!socket?.connected) return;
  socket.emit("session-status", { status });
}
