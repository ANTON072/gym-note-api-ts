/**
 * Workout routes
 * /api/v1/workouts
 * ワークアウトの更新（メモ + セット差分更新）
 */
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import { updateWorkout } from "@/services/workout";
import {
  workoutSchema,
  workoutUpdateRequestSchema,
  workoutIdParamSchema,
} from "@/schemas/training-session";
import { errorResponseSchema } from "@/schemas/common";

const workoutRoutes = new OpenAPIHono<AuthEnv>();

// 全ルートに認証を適用
workoutRoutes.use("*", authMiddleware);

/**
 * PUT /api/v1/workouts/:workoutId
 * ワークアウトを更新（メモ + セット差分更新）
 */
const updateWorkoutRoute = createRoute({
  method: "put",
  path: "/{workoutId}",
  tags: ["Workout"],
  summary: "ワークアウト更新",
  description: "ワークアウトのメモとセットを更新する（セットは差分更新）",
  security: [{ Bearer: [] }],
  request: {
    params: workoutIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: workoutUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: workoutSchema,
        },
      },
      description: "更新されたワークアウト",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "バリデーションエラー",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "認証エラー",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "ワークアウトが見つからない",
    },
  },
});

workoutRoutes.openapi(updateWorkoutRoute, async (c) => {
  const user = c.get("user");
  const { workoutId } = c.req.valid("param");
  const data = c.req.valid("json");

  const workout = await updateWorkout({
    workoutId,
    userId: user.id,
    data,
  });

  return c.json(
    {
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
    },
    200
  );
});

export { workoutRoutes };
