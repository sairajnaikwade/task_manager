import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { listAllUsers } from "./user.service.js";

const router = Router();

router.use(authMiddleware);
router.post("/list", listAllUsers);

export default router;
