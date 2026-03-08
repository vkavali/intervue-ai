import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socketio",
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(sessionId: string, userId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit("join-session", { sessionId, userId });
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
