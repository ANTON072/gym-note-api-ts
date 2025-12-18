/**
 * トレーニングセッション API ルート
 * /api/v1/training-sessions
 */
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { authMiddleware } from "@/middlewares/auth";
import type { AuthEnv } from "@/types/hono";
import {
  fetchTrainingSessions,
  fetchTrainingSessionById,
  createTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
} from "@/services/training-session";
import { addWorkout, deleteWorkout, reorderWorkouts } from "@/services/workout";
import {
  trainingSessionSchema,
  trainingSessionListResponseSchema,
  trainingSessionCreateRequestSchema,
  trainingSessionUpdateRequestSchema,
  workoutSchema,
  workoutAddRequestSchema,
  workoutReorderRequestSchema,
  sessionIdParamSchema,
  sessionAndWorkoutIdParamSchema,
  trainingSessionQuerySchema,
} from "@/schemas/training-session";
import { errorResponseSchema, messageResponseSchema } from "@/schemas/common";

const trainingSessionRoutes = new OpenAPIHono<AuthEnv>();

// 認証ミドルウェア適用
trainingSessionRoutes.use("*", authMiddleware);

/**
 * GET /api/v1/training-sessions
 * トレーニングセッション一覧取得
 */
const listSessionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["TrainingSession"],
  summary: "トレーニングセッション一覧取得",
  description: "ユーザーのトレーニングセッション一覧をページングで取得する",
  security: [{ Bearer: [] }],
  request: {
    query: trainingSessionQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: trainingSessionListResponseSchema,
        },
      },
      description: "トレーニングセッション一覧",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "認証エラー",
    },
  },
});

trainingSessionRoutes.openapi(listSessionsRoute, async (c) => {
  const user = c.get("user");
  const { offset } = c.req.valid("query");

  const result = await fetchTrainingSessions({
    userId: user.id,
    offset,
  });

  return c.json(
    {
      trainingSessions: result.trainingSessions.map((session) => ({
        id: session.id,
        performedStartAt: session.performedStartAt.toISOString(),
        performedEndAt: session.performedEndAt?.toISOString() ?? null,
        place: session.place,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
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
            speed: set.speed,
            calories: set.calories,
          })),
        })),
      })),
      paging: result.paging,
    },
    200
  );
});

/**
 * GET /api/v1/training-sessions/:sessionId
 * トレーニングセッション詳細取得
 */
const getSessionRoute = createRoute({
  method: "get",
  path: "/{sessionId}",
  tags: ["TrainingSession"],
  summary: "トレーニングセッション詳細取得",
  description: "指定IDのトレーニングセッション詳細を取得する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: trainingSessionSchema,
        },
      },
      description: "トレーニングセッション詳細",
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
      description: "セッションが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(getSessionRoute, async (c) => {
  const user = c.get("user");
  const { sessionId } = c.req.valid("param");

  const session = await fetchTrainingSessionById({
    sessionId,
    userId: user.id,
  });

  return c.json(
    {
      id: session.id,
      performedStartAt: session.performedStartAt.toISOString(),
      performedEndAt: session.performedEndAt?.toISOString() ?? null,
      place: session.place,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
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
    },
    200
  );
});

/**
 * POST /api/v1/training-sessions
 * トレーニングセッション作成
 */
const createSessionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["TrainingSession"],
  summary: "トレーニングセッション作成",
  description: "新しいトレーニングセッションを作成する",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: trainingSessionCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: trainingSessionSchema,
        },
      },
      description: "作成されたトレーニングセッション",
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
  },
});

trainingSessionRoutes.openapi(createSessionRoute, async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  const session = await createTrainingSession({
    userId: user.id,
    performedStartAt: new Date(data.performedStartAt),
  });

  return c.json(
    {
      id: session.id,
      performedStartAt: session.performedStartAt.toISOString(),
      performedEndAt: session.performedEndAt?.toISOString() ?? null,
      place: session.place,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      workouts: [],
    },
    201
  );
});

/**
 * PUT /api/v1/training-sessions/:sessionId
 * トレーニングセッション更新
 */
const updateSessionRoute = createRoute({
  method: "put",
  path: "/{sessionId}",
  tags: ["TrainingSession"],
  summary: "トレーニングセッション更新",
  description: "指定IDのトレーニングセッションを更新する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: trainingSessionUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: trainingSessionSchema,
        },
      },
      description: "更新されたトレーニングセッション",
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
      description: "セッションが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(updateSessionRoute, async (c) => {
  const user = c.get("user");
  const { sessionId } = c.req.valid("param");
  const data = c.req.valid("json");

  // 日付フィールドの変換
  const performedStartAt = data.performedStartAt
    ? new Date(data.performedStartAt)
    : undefined;

  let performedEndAt: Date | null | undefined;
  if (data.performedEndAt === undefined) {
    performedEndAt = undefined;
  } else if (data.performedEndAt === null) {
    performedEndAt = null;
  } else {
    performedEndAt = new Date(data.performedEndAt);
  }

  const session = await updateTrainingSession({
    sessionId,
    userId: user.id,
    data: {
      performedStartAt,
      performedEndAt,
      place: data.place,
    },
  });

  return c.json(
    {
      id: session.id,
      performedStartAt: session.performedStartAt.toISOString(),
      performedEndAt: session.performedEndAt?.toISOString() ?? null,
      place: session.place,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
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
    },
    200
  );
});

/**
 * DELETE /api/v1/training-sessions/:sessionId
 * トレーニングセッション削除
 */
const deleteSessionRoute = createRoute({
  method: "delete",
  path: "/{sessionId}",
  tags: ["TrainingSession"],
  summary: "トレーニングセッション削除",
  description: "指定IDのトレーニングセッションを削除する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionIdParamSchema,
  },
  responses: {
    204: {
      description: "削除完了",
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
      description: "セッションが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(deleteSessionRoute, async (c) => {
  const user = c.get("user");
  const { sessionId } = c.req.valid("param");

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
const addWorkoutRoute = createRoute({
  method: "post",
  path: "/{sessionId}/workouts",
  tags: ["Workout"],
  summary: "ワークアウト追加",
  description: "トレーニングセッションにワークアウトを追加する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: workoutAddRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: workoutSchema,
        },
      },
      description: "追加されたワークアウト",
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
      description: "セッションまたはExerciseが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(addWorkoutRoute, async (c) => {
  const user = c.get("user");
  const { sessionId } = c.req.valid("param");
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
});

/**
 * PATCH /api/v1/training-sessions/:sessionId/workouts/reorder
 * ワークアウト並び替え
 */
const reorderWorkoutsRoute = createRoute({
  method: "patch",
  path: "/{sessionId}/workouts/reorder",
  tags: ["Workout"],
  summary: "ワークアウト並び替え",
  description: "トレーニングセッション内のワークアウトの順序を変更する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: workoutReorderRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: messageResponseSchema,
        },
      },
      description: "並び替え完了",
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
      description: "セッションが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(reorderWorkoutsRoute, async (c) => {
  const user = c.get("user");
  const { sessionId } = c.req.valid("param");
  const { workoutIds } = c.req.valid("json");

  await reorderWorkouts({
    sessionId,
    userId: user.id,
    workoutIds,
  });

  return c.json({ message: "並び替えが完了しました" }, 200);
});

/**
 * DELETE /api/v1/training-sessions/:sessionId/workouts/:workoutId
 * ワークアウト削除
 */
const deleteWorkoutRoute = createRoute({
  method: "delete",
  path: "/{sessionId}/workouts/{workoutId}",
  tags: ["Workout"],
  summary: "ワークアウト削除",
  description: "トレーニングセッションからワークアウトを削除する",
  security: [{ Bearer: [] }],
  request: {
    params: sessionAndWorkoutIdParamSchema,
  },
  responses: {
    204: {
      description: "削除完了",
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
      description: "セッションまたはワークアウトが見つからない",
    },
  },
});

trainingSessionRoutes.openapi(deleteWorkoutRoute, async (c) => {
  const user = c.get("user");
  const { sessionId, workoutId } = c.req.valid("param");

  await deleteWorkout({
    sessionId,
    workoutId,
    userId: user.id,
  });

  return c.body(null, 204);
});

export { trainingSessionRoutes };
