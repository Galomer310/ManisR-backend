import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

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
// The following code used to serve the frontend build from the backend container.
// Since we are deploying the frontend separately, remove or comment out these lines.
// 
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));
// app.get("*", (_req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
// });
*/

// Create HTTP server and Socket.IO instance
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust as needed in production
  },
});

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user sends their location, broadcast it to others
  socket.on("userLocation", (location) => {
    console.log(`Received location from ${socket.id}:`, location);
    socket.broadcast.emit("newUserLocation", { id: socket.id, ...location });
  });

  // Handle disconnections
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
