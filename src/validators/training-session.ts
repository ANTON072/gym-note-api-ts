/**
 * トレーニングセッション（TrainingSession）のバリデーションスキーマ
 * トレーニング日（日付、場所、時間）を表す
 */
import z from "zod";
import { exerciseSchema } from "./exercise";

/**
 * セット記録スキーマ
 * 筋トレ用: weight, reps
 * 有酸素用: distance, duration, speed, calories
 */
export const workoutSetSchema = z.object({
  id: z.string(),
  // 筋トレ用
  weight: z.number().int().min(0).nullable(),
  reps: z.number().int().min(0).nullable(),
  // 有酸素用
  distance: z.number().int().min(0).nullable(), // 距離（メートル）
  duration: z.number().int().min(0).nullable(), // 時間（秒）
  speed: z.number().min(0).nullable(), // 速さ（km/h）
  calories: z.number().int().min(0).nullable(), // カロリー（kcal）
});

/**
 * セット記録リクエストスキーマ（更新用）
 * - id有り → 更新
 * - id無し → 新規作成
 * - リクエストに無いID → 削除
 */
export const workoutSetRequestSchema = z.object({
  id: z.string().optional(),
  // 筋トレ用
  weight: z.number().int().min(0).nullable().optional(),
  reps: z.number().int().min(0).nullable().optional(),
  // 有酸素用
  distance: z.number().int().min(0).nullable().optional(),
  duration: z.number().int().min(0).nullable().optional(),
  speed: z.number().min(0).nullable().optional(),
  calories: z.number().int().min(0).nullable().optional(),
});

/**
 * ワークアウトスキーマ（レスポンス用）
 * 1つの種目の実施記録（種目＋セット群＋メモ）
 */
export const workoutSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int().min(0),
  note: z.string().nullable(),
  exercise: exerciseSchema.omit({ createdAt: true, updatedAt: true }),
  sets: z.array(workoutSetSchema),
});

/**
 * ワークアウト追加リクエストスキーマ
 * POST /api/v1/training-sessions/:sessionId/workouts
 */
export const workoutAddRequestSchema = z.object({
  exerciseId: z.string(),
});

/**
 * ワークアウト更新リクエストスキーマ
 * PUT /api/v1/workouts/:workoutId
 * メモとセットを差分更新
 */
export const workoutUpdateRequestSchema = z.object({
  note: z.string().nullable().optional(),
  sets: z.array(workoutSetRequestSchema).optional(),
});

/**
 * ワークアウト並び替えリクエストスキーマ
 * PATCH /api/v1/training-sessions/:sessionId/workouts/reorder
 */
export const workoutReorderRequestSchema = z.object({
  workoutIds: z.array(z.string()),
});

/**
 * トレーニングセッションスキーマ（レスポンス用）
 */
export const trainingSessionSchema = z.object({
  id: z.string(),
  performedStartAt: z.coerce.date(),
  performedEndAt: z.coerce.date().nullable(),
  place: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  workouts: z.array(workoutSchema),
});

/**
 * トレーニングセッション作成リクエストスキーマ
 * POST /api/v1/training-sessions
 */
export const trainingSessionCreateRequestSchema = z.object({
  performedStartAt: z.coerce.date(),
});

/**
 * トレーニングセッション更新リクエストスキーマ
 * PUT /api/v1/training-sessions/:sessionId
 */
export const trainingSessionUpdateRequestSchema = z.object({
  performedStartAt: z.coerce.date().optional(),
  performedEndAt: z.coerce.date().nullable().optional(),
  place: z.string().nullable().optional(),
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
