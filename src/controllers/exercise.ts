/**
 * Exercise controller
 * エクササイズに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { AppError } from "@/middlewares/errorHandler";
import { fetchExercises, createExercise } from "@/services/exercise";
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
    // バリデーション
    const result = exerciseRequestSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, "VALIDATION_ERROR", "入力内容に誤りがあります", {
        fields: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const user = req.user!;
    const exercise = await createExercise({
      userId: user.id,
      exerciseData: result.data,
    });

    res.status(201).json({ exercise });
  } catch (error) {
    next(error);
  }
}
