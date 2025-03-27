import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from ../.env
dotenv.config({ path: "../.env" });

// Import routes
import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";
import messagesRoutes from "./routes/messages";
import mealConversationRoutes from "./routes/mealConversation";

// Import middlewares
import { apiLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Allow multiple origins (for local testing and production)
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://manisr.onrender.com",
  "http://localhost:5173"
];

// Middleware: JSON parsing, URL-encoded payloads, and CORS configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Apply rate limiting to all API routes
app.use(apiLimiter);

// Mount API routes
app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/messages", messagesRoutes);
app.use("/meal-conversation", mealConversationRoutes);

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Socket.IO: handle chat connections
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // When a client joins a conversation room
  socket.on("joinConversation", ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // When a new message is sent, broadcast to the room
  socket.on("sendMessage", (data) => {
    io.to(data.conversationId).emit("newMessage", {
      senderId: data.senderId,
      message: data.message,
      created_at: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Global error handler middleware
app.use(errorHandler);

// Start the server (listening on all network interfaces)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
