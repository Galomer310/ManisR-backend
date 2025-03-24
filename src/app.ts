import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

// Load environment variables from .env file
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
  Removed static file serving for frontend.
  In development you might have served the frontend build using:
  
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
  });
  
  Now, the frontend will be deployed separately.
*/

// Create the HTTP server from the Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO for real-time features
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
  },
});

// Socket.IO connection handling
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

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("Server error:", err);
});
