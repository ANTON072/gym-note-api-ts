/**
 * Exercise routes
 * /api/v1/exercises
 */

import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth";
import { getExercisesController } from "@/controllers/exercise";

const router = Router();

// GET /api/v1/exercises
router.get("/", authMiddleware, getExercisesController);

export default router;
