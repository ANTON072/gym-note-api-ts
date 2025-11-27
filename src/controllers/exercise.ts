/**
 * Exercise controller
 * エクササイズに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { fetchExercises, createExercise } from "@/services/exercise";
import { validateRequest } from "@/utils/validation";
import { exerciseRequestSchema } from "@/validators/exercise";

/**
 * Exercise一覧を取得
 * GET /api/v1/exercises
 */
export async function getExercisesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const exercises = await fetchExercises(user.id);
    res.status(200).json({ exercises });
  } catch (error) {
    next(error);
  }
}

/**
 * Exerciseを作成する
 * POST /api/v1/exercises
 */
export async function createExerciseController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const exerciseData = validateRequest(exerciseRequestSchema, req.body);
    const user = req.user!;
    const exercise = await createExercise({
      userId: user.id,
      exerciseData,
    });

    res.status(201).json({ exercise });
  } catch (error) {
    next(error);
  }
}
