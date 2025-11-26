/**
 * User routes
 * /api/v1/user
 */

import { Router } from "express";
import { getCurrentUser } from "../controllers/user";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /api/v1/user
router.get("/", authMiddleware, getCurrentUser);

export default router;
