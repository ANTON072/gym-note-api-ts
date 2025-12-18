/**
 * トレーニングセッション API ルート
 * /api/v1/training-sessions
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

import { authMiddleware } from "@/middlewares/auth";
import type { AuthEnv } from "@/types/hono";
import {
  fetchTrainingSessions,
  fetchTrainingSessionById,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
} from "@/services/training-session";
import {
  addWorkout,
  deleteWorkout,
  reorderWorkouts,
} from "@/services/workout";
import {
  trainingSessionCreateRequestSchema,
  trainingSessionUpdateRequestSchema,
  workoutAddRequestSchema,
  workoutReorderRequestSchema,
} from "@/validators/training-session";

const trainingSessionRoutes = new Hono<AuthEnv>();

// 認証ミドルウェア適用
trainingSessionRoutes.use("*", authMiddleware);

/**
 * GET /api/v1/training-sessions
 * トレーニングセッション一覧取得
 */
trainingSessionRoutes.get(
  "/",
  zValidator(
    "query",
    z.object({
      offset: z.coerce.number().int().min(0).optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { offset } = c.req.valid("query");

    const result = await fetchTrainingSessions({
      userId: user.id,
      offset,
    });

    return c.json({
      trainingSessions: result.trainingSessions.map((session) => ({
        id: session.id,
        performedStartAt: session.performedStartAt,
        performedEndAt: session.performedEndAt,
        place: session.place,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        workouts: session.workouts.map((workout) => ({
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
            speed: set.speed ? Number(set.speed) : null,
            calories: set.calories,
          })),
        })),
      })),
      paging: result.paging,
    });
  }
);

/**
 * GET /api/v1/training-sessions/:sessionId
 * トレーニングセッション詳細取得
 */
trainingSessionRoutes.get("/:sessionId", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("sessionId");

  const session = await fetchTrainingSessionById({
    sessionId,
    userId: user.id,
  });

  return c.json({
    id: session.id,
    performedStartAt: session.performedStartAt,
    performedEndAt: session.performedEndAt,
    place: session.place,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    workouts: session.workouts.map((workout) => ({
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
        speed: set.speed ? Number(set.speed) : null,
        calories: set.calories,
      })),
    })),
  });
});

/**
 * POST /api/v1/training-sessions
 * トレーニングセッション作成
 */
trainingSessionRoutes.post(
  "/",
  zValidator("json", trainingSessionCreateRequestSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    const session = await createTrainingSession({
      userId: user.id,
      performedStartAt: data.performedStartAt,
    });

    return c.json(
      {
        id: session.id,
        performedStartAt: session.performedStartAt,
        performedEndAt: session.performedEndAt,
        place: session.place,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        workouts: [],
      },
      201
    );
  }
);

/**
 * PUT /api/v1/training-sessions/:sessionId
 * トレーニングセッション更新
 */
trainingSessionRoutes.put(
  "/:sessionId",
  zValidator("json", trainingSessionUpdateRequestSchema),
  async (c) => {
    const user = c.get("user");
    const sessionId = c.req.param("sessionId");
    const data = c.req.valid("json");

    const session = await updateTrainingSession({
      sessionId,
      userId: user.id,
      data,
    });

    return c.json({
      id: session.id,
      performedStartAt: session.performedStartAt,
      performedEndAt: session.performedEndAt,
      place: session.place,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      workouts: session.workouts.map((workout) => ({
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
          speed: set.speed ? Number(set.speed) : null,
          calories: set.calories,
        })),
      })),
    });
  }
);

/**
 * DELETE /api/v1/training-sessions/:sessionId
 * トレーニングセッション削除
 */
trainingSessionRoutes.delete("/:sessionId", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("sessionId");

  await deleteTrainingSession({
    sessionId,
    userId: user.id,
  });

  return c.body(null, 204);
});

// =========================================
// ワークアウト関連のルート
// =========================================

/**
 * POST /api/v1/training-sessions/:sessionId/workouts
 * ワークアウト追加
 */
trainingSessionRoutes.post(
  "/:sessionId/workouts",
  zValidator("json", workoutAddRequestSchema),
  async (c) => {
    const user = c.get("user");
    const sessionId = c.req.param("sessionId");
    const { exerciseId } = c.req.valid("json");

    const workout = await addWorkout({
      sessionId,
      userId: user.id,
      exerciseId,
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
        sets: [],
      },
      201
    );
  }
);

/**
 * PATCH /api/v1/training-sessions/:sessionId/workouts/reorder
 * ワークアウト並び替え
 */
trainingSessionRoutes.patch(
  "/:sessionId/workouts/reorder",
  zValidator("json", workoutReorderRequestSchema),
  async (c) => {
    const user = c.get("user");
    const sessionId = c.req.param("sessionId");
    const { workoutIds } = c.req.valid("json");

    await reorderWorkouts({
      sessionId,
      userId: user.id,
      workoutIds,
    });

    return c.json({ message: "並び替えが完了しました" });
  }
);

/**
 * DELETE /api/v1/training-sessions/:sessionId/workouts/:workoutId
 * ワークアウト削除
 */
trainingSessionRoutes.delete("/:sessionId/workouts/:workoutId", async (c) => {
  const user = c.get("user");
  const sessionId = c.req.param("sessionId");
  const workoutId = c.req.param("workoutId");

  await deleteWorkout({
    sessionId,
    workoutId,
    userId: user.id,
  });

  return c.body(null, 204);
});

export { trainingSessionRoutes };
