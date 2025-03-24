import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API routes
app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);

/*
  Frontend is deployed separately, so static file serving is removed.
*/

// Create HTTP server and set up Socket.IO for real-time features if needed.
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this for production as needed.
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("userLocation", (location) => {
    console.log(`Received location from ${socket.id}:`, location);
    socket.broadcast.emit("newUserLocation", { id: socket.id, ...location });
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("userDisconnected", { id: socket.id });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server error:", err);
});
