/**
 * Workout routes
 * ワークアウト関連のルーティング
 */
import { Router } from "express";

import {
  getWorkoutByIdController,
  getWorkoutsController,
  createWorkoutController,
  updateWorkoutController,
  deleteWorkoutController,
} from "@/controllers/workout";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

// GET /api/v1/workouts - ワークアウト一覧取得
router.get("/", authMiddleware, getWorkoutsController);

// GET /api/v1/workouts/:workoutId - ワークアウト詳細取得
router.get("/:workoutId", authMiddleware, getWorkoutByIdController);

// POST /api/v1/workouts - ワークアウト作成
router.post("/", authMiddleware, createWorkoutController);

// PUT /api/v1/workouts/:workoutId - ワークアウト更新
router.put("/:workoutId", authMiddleware, updateWorkoutController);

// DELETE /api/v1/workouts/:workoutId - ワークアウト削除
router.delete("/:workoutId", authMiddleware, deleteWorkoutController);

export default router;
