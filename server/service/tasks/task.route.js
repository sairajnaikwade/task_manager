import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { rbacMiddleware } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.js";
import { listTasks, createTask, getTask, updateTask, deleteTask, addComment } from "./task.service.js";

const router = Router();

const createSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  status:      z.enum(["todo", "in_progress", "done"]).optional(),
  priority:    z.enum(["low", "normal", "high", "urgent"]).optional(),
  due_date:    z.string().datetime({ offset: true }).optional().nullable(),
  project_id:  z.string().uuid(),
  assigned_to: z.string().uuid().optional().nullable(),
});

const updateSchema = z.object({
  task_id:     z.string().uuid(),
  title:       z.string().min(1).optional(),
  description: z.string().optional(),
  status:      z.enum(["todo", "in_progress", "done"]).optional(),
  priority:    z.enum(["low", "normal", "high", "urgent"]).optional(),
  due_date:    z.string().datetime({ offset: true }).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

const deleteSchema = z.object({
  task_id: z.string().uuid(),
});

const commentSchema = z.object({
  content: z.string().min(1),
});

router.post("/list",   authMiddleware, listTasks);
router.post("/create", authMiddleware, validate(createSchema), createTask);
router.post("/update", authMiddleware, validate(updateSchema), updateTask);
router.post("/delete", authMiddleware, validate(deleteSchema), deleteTask);

// GET deep-link — /api/v1/tasks/:id
router.get("/:id", authMiddleware, getTask);
// POST comment — /api/v1/tasks/:id/comments
router.post("/:id/comments", authMiddleware, validate(commentSchema), addComment);

export default router;
