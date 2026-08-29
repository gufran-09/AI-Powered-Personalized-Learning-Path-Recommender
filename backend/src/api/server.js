/**
 * Backend — Express Server
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import adminRoutes from "./adminRoutes.js";
import pathsRoutes from "./pathsRoutes.js";
import chatRoutes from "./chatRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/paths", pathsRoutes);
app.use("/api/chat", chatRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    service: "learning-path-backend",
    version: "2.0.0",
    docs: "/api/health",
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});

export default app;
