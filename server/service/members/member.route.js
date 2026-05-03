import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { rbacMiddleware } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.js";
import { addMember, removeMember, listMembers } from "./member.service.js";

const router = Router();

const addSchema = z.object({
  project_id: z.string().uuid(),
  user_id:    z.string().uuid(),
  role:       z.enum(["admin", "member"]).optional(),
});

const removeSchema = z.object({
  project_id: z.string().uuid(),
  user_id:    z.string().uuid(),
});

const listSchema = z.object({
  project_id: z.string().uuid(),
  page:       z.number().int().positive().optional(),
  per_page:   z.number().int().positive().optional(),
});

router.post("/add",    authMiddleware, rbacMiddleware("admin"), validate(addSchema),    addMember);
router.post("/remove", authMiddleware, rbacMiddleware("admin"), validate(removeSchema), removeMember);
router.post("/list",   authMiddleware, rbacMiddleware("member"), validate(listSchema),  listMembers);

export default router;
