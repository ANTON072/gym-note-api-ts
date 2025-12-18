/**
 * TrainingSession OpenAPI スキーマ定義
 */
import { z } from "@hono/zod-openapi";
import { pagingSchema } from "./common";

/**
 * ワークアウトセットスキーマ
 */
export const workoutSetSchema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    weight: z
      .number()
      .int()
      .min(0)
      .nullable()
      .openapi({ description: "重量（グラム）" }),
    reps: z.number().int().min(0).nullable().openapi({ description: "回数" }),
    distance: z
      .number()
      .int()
      .min(0)
      .nullable()
      .openapi({ description: "距離（メートル）" }),
    duration: z
      .number()
      .int()
      .min(0)
      .nullable()
      .openapi({ description: "時間（秒）" }),
    speed: z
      .number()
      .int()
      .min(0)
      .nullable()
      .openapi({ description: "速さ（0.1 km/h 単位）" }),
    calories: z
      .number()
      .int()
      .min(0)
      .nullable()
      .openapi({ description: "カロリー（kcal）" }),
  })
  .openapi("WorkoutSet");

/**
 * ワークアウトセットリクエストスキーマ（作成/更新用）
 */
export const workoutSetRequestSchema = z
  .object({
    id: z
      .string()
      .optional()
      .openapi({ description: "既存セットのID（更新時）" }),
    weight: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "重量（グラム）" }),
    reps: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "回数" }),
    distance: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "距離（メートル）" }),
    duration: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "時間（秒）" }),
    speed: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "速さ（0.1 km/h 単位）" }),
    calories: z
      .number()
      .int()
      .min(0)
      .nullable()
      .optional()
      .openapi({ description: "カロリー（kcal）" }),
  })
  .openapi("WorkoutSetRequest");

/**
 * Exercise（ワークアウト内で使用）
 */
const workoutExerciseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    bodyPart: z.number().int().nullable(),
    exerciseType: z.number().int(),
    isPreset: z.boolean(),
  })
  .openapi("WorkoutExercise");

/**
 * ワークアウトスキーマ（レスポンス用）
 */
export const workoutSchema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    orderIndex: z.number().int().min(0),
    note: z.string().nullable(),
    exercise: workoutExerciseSchema,
    sets: z.array(workoutSetSchema),
  })
  .openapi("Workout");

/**
 * トレーニングセッションスキーマ（レスポンス用）
 */
export const trainingSessionSchema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    performedStartAt: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-01T09:00:00Z" }),
    performedEndAt: z
      .string()
      .datetime()
      .nullable()
      .openapi({ example: "2024-01-01T10:30:00Z" }),
    place: z.string().nullable().openapi({ example: "ジム" }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    workouts: z.array(workoutSchema),
  })
  .openapi("TrainingSession");

/**
 * トレーニングセッション一覧レスポンススキーマ
 */
export const trainingSessionListResponseSchema = z
  .object({
    trainingSessions: z.array(trainingSessionSchema),
    paging: pagingSchema,
  })
  .openapi("TrainingSessionListResponse");

/**
 * トレーニングセッション作成リクエストスキーマ
 */
export const trainingSessionCreateRequestSchema = z
  .object({
    performedStartAt: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-01T09:00:00Z" }),
  })
  .openapi("TrainingSessionCreateRequest");

/**
 * トレーニングセッション更新リクエストスキーマ
 */
export const trainingSessionUpdateRequestSchema = z
  .object({
    performedStartAt: z.string().datetime().optional(),
    performedEndAt: z.string().datetime().nullable().optional(),
    place: z.string().nullable().optional(),
  })
  .openapi("TrainingSessionUpdateRequest");

/**
 * ワークアウト追加リクエストスキーマ
 */
export const workoutAddRequestSchema = z
  .object({
    exerciseId: z.string().openapi({ example: "clxyz123456789" }),
  })
  .openapi("WorkoutAddRequest");

/**
 * ワークアウト並び替えリクエストスキーマ
 */
export const workoutReorderRequestSchema = z
  .object({
    workoutIds: z.array(z.string()),
  })
  .openapi("WorkoutReorderRequest");

/**
 * ワークアウト更新リクエストスキーマ
 */
export const workoutUpdateRequestSchema = z
  .object({
    note: z.string().nullable().optional(),
    sets: z.array(workoutSetRequestSchema).optional(),
  })
  .openapi("WorkoutUpdateRequest");

/**
 * パスパラメータスキーマ
 */
export const sessionIdParamSchema = z.object({
  sessionId: z.string().openapi({ param: { name: "sessionId", in: "path" } }),
});

export const sessionAndWorkoutIdParamSchema = z.object({
  sessionId: z.string().openapi({ param: { name: "sessionId", in: "path" } }),
  workoutId: z.string().openapi({ param: { name: "workoutId", in: "path" } }),
});

export const workoutIdParamSchema = z.object({
  workoutId: z.string().openapi({ param: { name: "workoutId", in: "path" } }),
});

/**
 * クエリパラメータスキーマ
 */
export const trainingSessionQuerySchema = z.object({
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .openapi({ param: { name: "offset", in: "query" } }),
});
