import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { register, login } from "./auth.service.js";

const router = Router();

const registerSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post("/register", validate(registerSchema), register);
router.post("/login",    validate(loginSchema),    login);

export default router;
