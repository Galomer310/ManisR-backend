import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: "../.env" });

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// For development, allow all origins
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests explicitly.
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter and routes.
import { apiLimiter } from "./middlewares/rateLimiter";
app.use(apiLimiter);

import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";
import messagesRoutes from "./routes/messages";
import mealConversationRoutes from "./routes/mealConversation";
import userRoutes from "./routes/user";
import mealHistoryRoutes from "./routes/mealHistory";
import mealReviewsRoutes from "./routes/mealReviews";

app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);
app.use("/messages", messagesRoutes);
app.use("/meal-conversation", mealConversationRoutes);
app.use("/users", userRoutes);
app.use("/meal-history", mealHistoryRoutes);
app.use("/meal_reviews", mealReviewsRoutes);
// Serve static uploads.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for socket.io as well
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
