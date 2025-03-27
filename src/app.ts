import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: "../.env" });

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Define allowed origins. Ensure these exactly match what your frontend sends.
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://manisr.onrender.com",
  "http://localhost:5173",
];

// Parse JSON and URL-encoded data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration using a custom function.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps or curl)
      if (!origin) return callback(null, true);
      // Check if the request origin exactly matches one of the allowed origins.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error("Origin not allowed by CORS:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Explicitly handle preflight requests.
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Apply rate limiter middleware.
import { apiLimiter } from "./middlewares/rateLimiter";
app.use(apiLimiter);

// Mount routes.
import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";
import messagesRoutes from "./routes/messages";
import mealConversationRoutes from "./routes/mealConversation";

app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/messages", messagesRoutes);
app.use("/meal-conversation", mealConversationRoutes);

// Serve static uploads.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Setup Socket.io.
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  socket.on("joinConversation", ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });
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

import { errorHandler } from "./middlewares/errorHandler";
app.use(errorHandler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
