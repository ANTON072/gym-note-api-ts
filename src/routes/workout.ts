/**
 * Workout routes
 * ワークアウト関連のルーティング
 */
import { Router } from "express";

import { createWorkoutController } from "@/controllers/workout";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

// POST /api/v1/workouts - ワークアウト作成
router.post("/", authMiddleware, createWorkoutController);

export default router;
