/**
 * Workout controller
 * ワークアウト（トレーニング記録）に関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { createWorkout, fetchWorkouts } from "@/services/workout";
import { validateRequest } from "@/utils/validation";
import { workoutRequestSchema } from "@/validators/workout";

/**
 * Workout一覧を取得
 * GET /api/v1/workouts
 * GET /api/v1/workouts?offset=20
 */
export async function getWorkoutsController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const offsetParam = req.query.offset as string | undefined;
    const offset =
      offsetParam !== undefined ? parseInt(offsetParam, 10) : undefined;

    const result = await fetchWorkouts({ userId: user.id, offset });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Workoutを作成する
 * POST /api/v1/workouts
 */
export async function createWorkoutController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workoutData = validateRequest(workoutRequestSchema, req.body);
    const user = req.user!;
    const workout = await createWorkout({
      userId: user.id,
      workoutData,
    });

    res.status(201).json({ workout });
  } catch (error) {
    next(error);
  }
}
