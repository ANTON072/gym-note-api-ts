/**
 * Exercise controller
 * エクササイズに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import {
  fetchExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/services/exercise";
import { validateRequest } from "@/utils/validation";
import { exerciseRequestSchema } from "@/validators/exercise";

/**
 * Exercise一覧を取得
 * GET /api/v1/exercises
 * GET /api/v1/exercises?name=ベン （前方一致検索）
 */
export async function getExercisesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const name = req.query.name as string | undefined;
    const exercises = await fetchExercises(user.id, { name });
    res.status(200).json({ exercises });
  } catch (error) {
    next(error);
  }
}

/**
 * 指定IDのExerciseを取得
 * GET /api/v1/exercises/:exerciseId
 */
export async function getExerciseByIdController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { exerciseId } = req.params;
    const user = req.user!;

    const exercise = await fetchExerciseById({
      exerciseId,
      userId: user.id,
    });

    res.status(200).json({ exercise });
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

/**
 * Exerciseを更新する
 * PUT /api/v1/exercises/:exerciseId
 */
export async function updateExerciseController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { exerciseId } = req.params;
    const exerciseData = validateRequest(exerciseRequestSchema, req.body);
    const user = req.user!;

    const exercise = await updateExercise({
      exerciseId,
      userId: user.id,
      exerciseData,
    });

    res.status(200).json({ exercise });
  } catch (error) {
    next(error);
  }
}

/**
 * Exerciseを削除する
 * DELETE /api/v1/exercises/:exerciseId
 */
export async function deleteExerciseController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { exerciseId } = req.params;
    const user = req.user!;

    await deleteExercise({
      exerciseId,
      userId: user.id,
    });

    res.status(200).json({ message: "削除しました" });
  } catch (error) {
    next(error);
  }
}
