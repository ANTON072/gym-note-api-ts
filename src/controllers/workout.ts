/**
 * Workout controller
 * ワークアウト（トレーニング記録）に関するAPIエンドポイント
 */
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "@/middlewares/auth";
import { createWorkout } from "@/services/workout";
import { validateRequest } from "@/utils/validation";
import { workoutRequestSchema } from "@/validators/workout";

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
