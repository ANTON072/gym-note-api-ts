/**
 * Workout routes
 * ワークアウト関連のルーティング
 */
import { Router } from "express";

import {
  getWorkoutByIdController,
  getWorkoutsController,
  createWorkoutController,
} from "@/controllers/workout";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

// GET /api/v1/workouts - ワークアウト一覧取得
router.get("/", authMiddleware, getWorkoutsController);

// GET /api/v1/workouts/:workoutId - ワークアウト詳細取得
router.get("/:workoutId", authMiddleware, getWorkoutByIdController);

// POST /api/v1/workouts - ワークアウト作成
router.post("/", authMiddleware, createWorkoutController);

export default router;
