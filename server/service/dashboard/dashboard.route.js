import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getDashboard } from "./dashboard.service.js";

const router = Router();

router.post("/", authMiddleware, getDashboard);

export default router;
