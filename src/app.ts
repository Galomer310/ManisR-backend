import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

// Import route modules
import authRoutes from "./routes/auth";
import foodRoutes from "./routes/food";
import preferencesRoutes from "./routes/preferences";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/food", foodRoutes);
app.use("/preferences", preferencesRoutes);

// Serve the frontend build (if available)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

// Create the HTTP server from the Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO server and allow CORS (adjust origin as needed)
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict to your domain
  },
});

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a user sending their location
  socket.on("userLocation", (location) => {
    console.log(`Received location from ${socket.id}:`, location);
    // Broadcast to all other users (excluding the sender)
    socket.broadcast.emit("newUserLocation", { id: socket.id, ...location });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Notify other clients that this user left
    socket.broadcast.emit("userDisconnected", { id: socket.id });
  });
});

// Start the HTTP server (which includes Express and Socket.IO)
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server error:", err);
});
