/**
 * Workout routes
 * ワークアウト関連のルーティング
 */
import { Router } from "express";

import {
  getWorkoutsController,
  createWorkoutController,
} from "@/controllers/workout";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

// GET /api/v1/workouts - ワークアウト一覧取得
router.get("/", authMiddleware, getWorkoutsController);

// POST /api/v1/workouts - ワークアウト作成
router.post("/", authMiddleware, createWorkoutController);

export default router;
