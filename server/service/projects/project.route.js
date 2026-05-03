import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { rbacMiddleware } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.js";
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from "./project.service.js";

const router = Router();

const createSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
});

const updateSchema = z.object({
  project_id:  z.string().uuid(),
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
});

const deleteSchema = z.object({
  project_id: z.string().uuid(),
});

router.post("/list",   authMiddleware, listProjects);
router.post("/create", authMiddleware, validate(createSchema), createProject);
router.post("/update", authMiddleware, rbacMiddleware("admin"), validate(updateSchema), updateProject);
router.post("/delete", authMiddleware, rbacMiddleware("admin"), validate(deleteSchema), deleteProject);

// GET deep-link — ver embedded in URL
router.get("/:id", authMiddleware, rbacMiddleware("member"), getProject);

export default router;
