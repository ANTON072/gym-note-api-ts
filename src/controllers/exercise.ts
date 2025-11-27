/**
 * Exercise controller
 * エクササイズに関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { fetchExercises, createExercise } from "@/services/exercise";
import { findOrCreateUser } from "@/services/user";

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
    const firebaseUid = req.user!.uid;
    const user = await findOrCreateUser(firebaseUid);

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
    const firebaseUid = req.user!.uid;
    const user = await findOrCreateUser(firebaseUid);

    const exerciseData = req.body;
    const exercise = await createExercise({
      userId: user.id,
      exerciseData,
    });

    res.status(201).json({ exercise });
  } catch (error) {
    next(error);
  }
}
