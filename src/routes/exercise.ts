/**
 * Exercise routes
 * /api/v1/exercises
 */

import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth";
import {
  getExercisesController,
  getExerciseByIdController,
  createExerciseController,
  updateExerciseController,
  deleteExerciseController,
} from "@/controllers/exercise";

const router = Router();

// GET /api/v1/exercises
router.get("/", authMiddleware, getExercisesController);
// GET /api/v1/exercises/:exerciseId
router.get("/:exerciseId", authMiddleware, getExerciseByIdController);
// POST /api/v1/exercises
router.post("/", authMiddleware, createExerciseController);
// PUT /api/v1/exercises/:exerciseId
router.put("/:exerciseId", authMiddleware, updateExerciseController);
// DELETE /api/v1/exercises/:exerciseId
router.delete("/:exerciseId", authMiddleware, deleteExerciseController);

export default router;
