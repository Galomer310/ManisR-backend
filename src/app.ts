// backend/src/app.ts
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: "../.env" });

import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";
import messagesRoutes from "./routes/messages";

import { apiLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

// Use JSON and URL-encoded middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicitly allow requests from your frontend's origin.
// IMPORTANT: Set FRONTEND_URL in your .env to "http://localhost:5173"
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Apply rate limiting to all API routes.
app.use(apiLimiter);

// Mount API routes.
app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/messages", messagesRoutes);

// Serve static uploads.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create HTTP server and configure Socket.IO.
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // IMPORTANT: Allow your frontend origin
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket.IO for real-time chat.
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // When a client joins a conversation, join the room.
  socket.on("joinConversation", ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Broadcast a new message to everyone in the room.
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

app.use(errorHandler);

// Start the server.
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
