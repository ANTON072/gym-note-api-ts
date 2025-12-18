/**
 * トレーニングセッション（TrainingSession）のバリデーションスキーマ
 * トレーニング日（日付、場所、時間）を表す
 */
import { z } from "@hono/zod-openapi";
import { pagingSchema } from "./common";

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
 * セット記録スキーマ（レスポンス用）
 * 筋トレ用: weight, reps
 * 有酸素用: distance, duration, speed, calories
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
 * セット記録リクエストスキーマ（更新用）
 * - id有り → 更新
 * - id無し → 新規作成
 * - リクエストに無いID → 削除
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
 * ワークアウトスキーマ（レスポンス用）
 * 1つの種目の実施記録（種目＋セット群＋メモ）
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
 * ワークアウト追加リクエストスキーマ
 * POST /api/v1/training-sessions/:sessionId/workouts
 */
export const workoutAddRequestSchema = z
  .object({
    exerciseId: z.string().openapi({ example: "clxyz123456789" }),
  })
  .openapi("WorkoutAddRequest");

/**
 * ワークアウト更新リクエストスキーマ
 * PUT /api/v1/workouts/:workoutId
 * メモとセットを差分更新
 */
export const workoutUpdateRequestSchema = z
  .object({
    note: z.string().nullable().optional(),
    sets: z.array(workoutSetRequestSchema).optional(),
  })
  .openapi("WorkoutUpdateRequest");

/**
 * ワークアウト並び替えリクエストスキーマ
 * PATCH /api/v1/training-sessions/:sessionId/workouts/reorder
 */
export const workoutReorderRequestSchema = z
  .object({
    workoutIds: z.array(z.string()),
  })
  .openapi("WorkoutReorderRequest");

/**
 * トレーニングセッションスキーマ（レスポンス用）
 */
export const trainingSessionSchema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    performedStartAt: z.iso
      .datetime()
      .openapi({ example: "2024-01-01T09:00:00Z" }),
    performedEndAt: z.iso
      .datetime()
      .nullable()
      .openapi({ example: "2024-01-01T10:30:00Z" }),
    place: z.string().nullable().openapi({ example: "ジム" }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
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
 * POST /api/v1/training-sessions
 */
export const trainingSessionCreateRequestSchema = z
  .object({
    performedStartAt: z.iso
      .datetime()
      .openapi({ example: "2024-01-01T09:00:00Z" }),
  })
  .openapi("TrainingSessionCreateRequest");

/**
 * トレーニングセッション更新リクエストスキーマ
 * PUT /api/v1/training-sessions/:sessionId
 */
export const trainingSessionUpdateRequestSchema = z
  .object({
    performedStartAt: z.iso.datetime().optional(),
    performedEndAt: z.iso.datetime().nullable().optional(),
    place: z.string().nullable().optional(),
  })
  .openapi("TrainingSessionUpdateRequest");

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

// 型エクスポート
export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type TrainingSessionCreateRequest = z.infer<
  typeof trainingSessionCreateRequestSchema
>;
export type TrainingSessionUpdateRequest = z.infer<
  typeof trainingSessionUpdateRequestSchema
>;
export type Workout = z.infer<typeof workoutSchema>;
export type WorkoutAddRequest = z.infer<typeof workoutAddRequestSchema>;
export type WorkoutUpdateRequest = z.infer<typeof workoutUpdateRequestSchema>;
export type WorkoutReorderRequest = z.infer<typeof workoutReorderRequestSchema>;
export type WorkoutSet = z.infer<typeof workoutSetSchema>;
export type WorkoutSetRequest = z.infer<typeof workoutSetRequestSchema>;
