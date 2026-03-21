import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Rate limiter: track events per socket per minute
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 120; // max events per minute per socket
const RATE_WINDOW = 60_000;

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(socketId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(socketId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Validate string input (prevent injection of oversized payloads)
function validateString(val: unknown, maxLen: number): string | null {
  if (typeof val !== "string") return null;
  if (val.length > maxLen) return null;
  return val;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: dev
        ? ["http://localhost:3000"]
        : [process.env.NEXTAUTH_URL || ""].filter(Boolean),
      credentials: true,
    },
    // Security: limit payload size (100KB max)
    maxHttpBufferSize: 100_000,
    // Ping timeout settings
    pingTimeout: 30_000,
    pingInterval: 25_000,
  });

  // Authentication middleware — verify NextAuth JWT on every connection
  io.use(async (socket, next) => {
    try {
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        return next(new Error("Server configuration error"));
      }

      // Extract token from cookie or auth header
      const cookies = socket.handshake.headers.cookie || "";
      const tokenCookieName = process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

      let token: string | null = null;

      // Parse cookie
      const cookieMatch = cookies
        .split(";")
        .map((c: string) => c.trim())
        .find((c: string) => c.startsWith(`${tokenCookieName}=`));

      if (cookieMatch) {
        token = cookieMatch.split("=").slice(1).join("=");
      }

      // Fallback: auth header
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify JWT
      const decoded = jwt.verify(token, secret) as {
        id: string;
        role: string;
        email?: string;
        name?: string;
      };

      if (!decoded?.id) {
        return next(new Error("Invalid token"));
      }

      // Attach user data to socket
      (socket as any).userId = decoded.id;
      (socket as any).userRole = decoded.role;
      (socket as any).userName = decoded.name || "Unknown";

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  // Track active sessions: sessionId -> Set of socketIds
  const sessionRooms = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;
    const userName = (socket as any).userName as string;

    console.log(`[Socket] Connected: ${userId} (${socket.id})`);

    // Join a session room
    socket.on("join-session", (data: unknown) => {
      if (!checkRateLimit(socket.id)) {
        socket.emit("error", { message: "Rate limit exceeded" });
        return;
      }

      const sessionId = validateString((data as any)?.sessionId, 100);
      if (!sessionId) {
        socket.emit("error", { message: "Invalid session ID" });
        return;
      }

      const room = `session:${sessionId}`;
      socket.join(room);

      // Track membership
      if (!sessionRooms.has(sessionId)) {
        sessionRooms.set(sessionId, new Set());
      }
      sessionRooms.get(sessionId)!.add(socket.id);

      // Store sessionId on socket for cleanup
      (socket as any).sessionId = sessionId;

      // Notify others
      socket.to(room).emit("user-joined", {
        userId,
        userName,
        timestamp: Date.now(),
      });
    });

    // Code update — candidate sends code changes
    socket.on("code-update", (data: unknown) => {
      if (!checkRateLimit(socket.id)) return;

      const sessionId = (socket as any).sessionId;
      if (!sessionId) return;

      const code = validateString((data as any)?.code, 500_000); // 500KB max
      const language = validateString((data as any)?.language, 50);
      const questionIndex = typeof (data as any)?.questionIndex === "number"
        ? (data as any).questionIndex
        : undefined;

      if (code === null) return;

      socket.to(`session:${sessionId}`).emit("code-update", {
        code,
        language,
        questionIndex,
        userId,
        timestamp: Date.now(),
      });
    });

    // Cursor position — throttled by client (100ms)
    socket.on("cursor-position", (data: unknown) => {
      if (!checkRateLimit(socket.id)) return;

      const sessionId = (socket as any).sessionId;
      if (!sessionId) return;

      const line = typeof (data as any)?.lineNumber === "number" ? (data as any).lineNumber : 0;
      const column = typeof (data as any)?.column === "number" ? (data as any).column : 0;

      socket.to(`session:${sessionId}`).emit("cursor-position", {
        userId,
        userName,
        lineNumber: line,
        column,
        timestamp: Date.now(),
      });
    });

    // Chat message via socket (also saved via HTTP for persistence)
    socket.on("chat-message", (data: unknown) => {
      if (!checkRateLimit(socket.id)) return;

      const sessionId = (socket as any).sessionId;
      if (!sessionId) return;

      const content = validateString((data as any)?.content, 5000);
      if (!content) return;

      socket.to(`session:${sessionId}`).emit("chat-message", {
        senderId: userId,
        senderName: userName,
        content,
        timestamp: Date.now(),
      });
    });

    // AI level override notification
    socket.on("ai-level-changed", (data: unknown) => {
      if (!checkRateLimit(socket.id)) return;

      const sessionId = (socket as any).sessionId;
      if (!sessionId) return;

      const newLevel = typeof (data as any)?.newLevel === "number" ? (data as any).newLevel : null;
      if (newLevel === null || newLevel < 0 || newLevel > 4) return;

      socket.to(`session:${sessionId}`).emit("ai-level-changed", {
        newLevel,
        userId,
        timestamp: Date.now(),
      });
    });

    // Session status change
    socket.on("session-status", (data: unknown) => {
      if (!checkRateLimit(socket.id)) return;

      const sessionId = (socket as any).sessionId;
      if (!sessionId) return;

      const status = validateString((data as any)?.status, 50);
      if (!status) return;

      socket.to(`session:${sessionId}`).emit("session-status", {
        status,
        userId,
        timestamp: Date.now(),
      });
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      const sessionId = (socket as any).sessionId;
      console.log(`[Socket] Disconnected: ${userId} (${socket.id})`);

      if (sessionId) {
        const room = sessionRooms.get(sessionId);
        if (room) {
          room.delete(socket.id);
          if (room.size === 0) {
            sessionRooms.delete(sessionId);
          }
        }

        socket.to(`session:${sessionId}`).emit("user-left", {
          userId,
          userName,
          timestamp: Date.now(),
        });
      }

      // Cleanup rate limit entry
      rateLimits.delete(socket.id);
    });
  });

  // Cleanup stale rate limit entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    rateLimits.forEach((val, key) => {
      if (now > val.resetAt) rateLimits.delete(key);
    });
  }, 300_000);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on path /api/socketio`);
  });
});
