/**
 * Workout routes
 * /api/v1/workouts
 * ワークアウトの更新（メモ + セット差分更新）
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import { updateWorkout } from "@/services/workout";
import { workoutUpdateRequestSchema } from "@/validators/training-session";

const workoutRoutes = new Hono<AuthEnv>();

// 全ルートに認証を適用
workoutRoutes.use("*", authMiddleware);

/**
 * PUT /api/v1/workouts/:workoutId
 * ワークアウトを更新（メモ + セット差分更新）
 */
workoutRoutes.put(
  "/:workoutId",
  zValidator("json", workoutUpdateRequestSchema),
  async (c) => {
    const user = c.get("user");
    const workoutId = c.req.param("workoutId");
    const data = c.req.valid("json");

    const workout = await updateWorkout({
      workoutId,
      userId: user.id,
      data,
    });

    return c.json({
      id: workout.id,
      orderIndex: workout.orderIndex,
      note: workout.note,
      exercise: {
        id: workout.exercise.id,
        name: workout.exercise.name,
        bodyPart: workout.exercise.bodyPart,
        exerciseType: workout.exercise.exerciseType,
        isPreset: workout.exercise.isPreset,
      },
      sets: workout.workoutSets.map((set) => ({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        distance: set.distance,
        duration: set.duration,
        speed: set.speed,
        calories: set.calories,
      })),
    });
  }
);

export { workoutRoutes };
