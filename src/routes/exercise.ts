/**
 * Exercise routes
 * /api/v1/exercises
 */

import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth";
import {
  getExercisesController,
  createExerciseController,
} from "@/controllers/exercise";

const router = Router();

// GET /api/v1/exercises
router.get("/", authMiddleware, getExercisesController);
// POST /api/v1/exercises
router.post("/", authMiddleware, createExerciseController);

export default router;
