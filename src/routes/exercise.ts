/**
 * Exercise routes
 * /api/v1/exercises
 */
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetchExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/services/exercise";
import {
  exerciseListResponseSchema,
  exerciseDetailResponseSchema,
  exerciseRequestSchema,
  exerciseIdParamSchema,
} from "@/schemas/exercise";
import { errorResponseSchema, messageResponseSchema } from "@/schemas/common";

/**
 * Exercise を API レスポンス形式に変換
 * Date を ISO 文字列に変換する
 */
const serializeExercise = (exercise: {
  id: string;
  name: string;
  bodyPart: number | null;
  exerciseType: number;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: exercise.id,
  name: exercise.name,
  bodyPart: exercise.bodyPart,
  exerciseType: exercise.exerciseType,
  isPreset: exercise.isPreset,
  createdAt: exercise.createdAt.toISOString(),
  updatedAt: exercise.updatedAt.toISOString(),
});

const exercise = new OpenAPIHono<AuthEnv>();

// 全ルートに認証を適用
exercise.use("*", authMiddleware);

/**
 * GET /api/v1/exercises
 * Exercise一覧を取得
 */
const listExercisesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Exercise"],
  summary: "Exercise一覧を取得",
  description: "ユーザーが登録したExercise一覧を取得する",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: exerciseListResponseSchema,
        },
      },
      description: "Exercise一覧",
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

exercise.openapi(listExercisesRoute, async (c) => {
  const user = c.get("user");
  const exercises = await fetchExercises(user.id);
  return c.json({ exercises: exercises.map(serializeExercise) }, 200);
});

/**
 * GET /api/v1/exercises/:exerciseId
 * 指定IDのExerciseを取得
 */
const getExerciseRoute = createRoute({
  method: "get",
  path: "/{exerciseId}",
  tags: ["Exercise"],
  summary: "Exercise詳細を取得",
  description: "指定IDのExercise詳細を取得する",
  security: [{ Bearer: [] }],
  request: {
    params: exerciseIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: exerciseDetailResponseSchema,
        },
      },
      description: "Exercise詳細",
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
      description: "Exerciseが見つからない",
    },
  },
});

exercise.openapi(getExerciseRoute, async (c) => {
  const user = c.get("user");
  const { exerciseId } = c.req.valid("param");

  const result = await fetchExerciseById({ exerciseId, userId: user.id });
  return c.json({ exercise: serializeExercise(result) }, 200);
});

/**
 * POST /api/v1/exercises
 * Exerciseを作成
 */
const createExerciseRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Exercise"],
  summary: "Exerciseを作成",
  description: "新しいExerciseを作成する",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: exerciseRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: exerciseDetailResponseSchema,
        },
      },
      description: "作成されたExercise",
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
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "重複エラー",
    },
  },
});

exercise.openapi(createExerciseRoute, async (c) => {
  const user = c.get("user");
  const exerciseData = c.req.valid("json");

  const result = await createExercise({ userId: user.id, exerciseData });
  return c.json({ exercise: serializeExercise(result) }, 201);
});

/**
 * PUT /api/v1/exercises/:exerciseId
 * Exerciseを更新
 */
const updateExerciseRoute = createRoute({
  method: "put",
  path: "/{exerciseId}",
  tags: ["Exercise"],
  summary: "Exerciseを更新",
  description: "指定IDのExerciseを更新する",
  security: [{ Bearer: [] }],
  request: {
    params: exerciseIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: exerciseRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: exerciseDetailResponseSchema,
        },
      },
      description: "更新されたExercise",
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
      description: "Exerciseが見つからない",
    },
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "重複エラー",
    },
  },
});

exercise.openapi(updateExerciseRoute, async (c) => {
  const user = c.get("user");
  const { exerciseId } = c.req.valid("param");
  const exerciseData = c.req.valid("json");

  const result = await updateExercise({
    exerciseId,
    userId: user.id,
    exerciseData,
  });
  return c.json({ exercise: serializeExercise(result) }, 200);
});

/**
 * DELETE /api/v1/exercises/:exerciseId
 * Exerciseを削除
 */
const deleteExerciseRoute = createRoute({
  method: "delete",
  path: "/{exerciseId}",
  tags: ["Exercise"],
  summary: "Exerciseを削除",
  description: "指定IDのExerciseを削除する",
  security: [{ Bearer: [] }],
  request: {
    params: exerciseIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: messageResponseSchema,
        },
      },
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
      description: "Exerciseが見つからない",
    },
  },
});

exercise.openapi(deleteExerciseRoute, async (c) => {
  const user = c.get("user");
  const { exerciseId } = c.req.valid("param");

  await deleteExercise({ exerciseId, userId: user.id });
  return c.json({ message: "削除しました" }, 200);
});

export default exercise;
