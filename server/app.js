import express from "express";
import cors from "cors";
import "./config/env.js"; // validates env vars on startup

import { traceMiddleware }   from "./middleware/trace.middleware.js";
import { versionMiddleware } from "./middleware/version.middleware.js";

import authRouter      from "./service/auth/auth.route.js";
import projectRouter   from "./service/projects/project.route.js";
import taskRouter      from "./service/tasks/task.route.js";
import memberRouter    from "./service/members/member.route.js";
import dashboardRouter from "./service/dashboard/dashboard.route.js";
import adminRouter     from "./service/admin/admin.route.js";
import userRouter      from "./service/users/user.route.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(traceMiddleware);
app.use(versionMiddleware);

// ─── Health check (Railway requires this) ────────────────────────────────────
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// ─── API routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/projects",  projectRouter);
app.use("/api/v1/projects", projectRouter);   // deep-link GET support
app.use("/api/tasks",     taskRouter);
app.use("/api/v1/tasks",  taskRouter);        // deep-link GET support
app.use("/api/members",   memberRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin",     adminRouter);
app.use("/api/users",     userRouter);

// ─── Static files (Production) ────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ status: "error", data: {}, messages: [{ errcode: "not_found", msgid: 3, field: "route", vals: [] }] }));

export default app;
