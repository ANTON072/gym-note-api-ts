/**
 * User routes
 * /api/v1/user
 */

import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth";
import { getCurrentUserController } from "@/controllers/user";

const router = Router();

// GET /api/v1/user
router.get("/", authMiddleware, getCurrentUserController);

export default router;
