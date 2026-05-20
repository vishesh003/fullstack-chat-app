import "./lib/config.js";

import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";

import { app, server } from "./lib/socket.js";

import path from "path";

const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://fullstack-chat-app-1-g6i1.onrender.com"
        : "http://localhost:5173",
    credentials: true,
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production setup
if (process.env.NODE_ENV === "production") {

  app.use(
    express.static(
      path.join(__dirname, "frontend/dist")
    )
  );

  app.get("/*", (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "frontend",
        "dist",
        "index.html"
      )
    );
  });
}

server.listen(PORT, () => {
  console.log("Server running on port:", PORT);
  connectDB();
});