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
import mealConversationRoutes from "./routes/mealConversation"; 

import { apiLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow requests from your frontend's origin
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Apply rate limiting to all API routes
app.use(apiLimiter);

// Mount API routes.
app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/messages", messagesRoutes);
app.use("/meal-conversation", mealConversationRoutes);

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create HTTP server and Socket.IO server.
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Socket.IO for real‑time chat.
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Join a conversation room.
  socket.on("joinConversation", ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle sending messages.
  socket.on("sendMessage", (data) => {
    // Broadcast the new message to all clients in the room.
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://172.26.192.1:${PORT}`);
});

