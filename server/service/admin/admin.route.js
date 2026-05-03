import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.js";
import { listUsers, updateUserRole, createUser, deleteUser } from "./admin.service.js";
import { error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

const router = Router();

const globalAdminGuard = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return error(res, [makeErr(ERR.UNAUTHORIZED, "role", "Global admin access required")]);
  }
  next();
};

const roleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "member"]),
});

const deleteSchema = z.object({
  user_id: z.string().uuid(),
});

router.use(authMiddleware, globalAdminGuard);

router.post("/list", listUsers);
router.post("/role", validate(roleSchema), updateUserRole);
router.post("/create", validate(createSchema), createUser);
router.post("/delete", validate(deleteSchema), deleteUser);

export default router;
