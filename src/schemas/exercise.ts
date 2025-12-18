/**
 * 種目（Exercise）のバリデーションスキーマ
 */
import { z } from "@hono/zod-openapi";

/**
 * Exerciseスキーマ（レスポンス用）
 */
export const exerciseSchema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    name: z.string().min(1).max(100).openapi({ example: "ベンチプレス" }),
    bodyPart: z
      .number()
      .int()
      .min(0)
      .max(5)
      .nullable()
      .openapi({ description: "部位（0:胸, 1:背中, 2:肩, 3:腕, 4:脚, 5:腹）" }),
    exerciseType: z
      .number()
      .int()
      .min(0)
      .max(1)
      .openapi({ description: "種類（0:筋トレ, 1:有酸素）" }),
    isPreset: z.boolean().openapi({ description: "プリセット種目かどうか" }),
    createdAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("Exercise");

/**
 * Exercise一覧レスポンススキーマ
 */
export const exerciseListResponseSchema = z
  .object({
    exercises: z.array(exerciseSchema),
  })
  .openapi("ExerciseListResponse");

/**
 * Exercise詳細レスポンススキーマ
 */
export const exerciseDetailResponseSchema = z
  .object({
    exercise: exerciseSchema,
  })
  .openapi("ExerciseDetailResponse");

/**
 * Exercise作成/更新リクエストスキーマ
 */
export const exerciseRequestSchema = z
  .object({
    name: z.string().min(1).max(100).openapi({ example: "ベンチプレス" }),
    bodyPart: z
      .number()
      .int()
      .min(0)
      .max(5)
      .nullable()
      .optional()
      .openapi({ description: "部位（0:胸, 1:背中, 2:肩, 3:腕, 4:脚, 5:腹）" }),
    exerciseType: z
      .number()
      .int()
      .min(0)
      .max(1)
      .optional()
      .openapi({ description: "種類（0:筋トレ, 1:有酸素）デフォルト: 0" }),
  })
  .openapi("ExerciseRequest");

/**
 * ExerciseIDパスパラメータスキーマ
 */
export const exerciseIdParamSchema = z.object({
  exerciseId: z.string().openapi({ param: { name: "exerciseId", in: "path" } }),
});

// 型エクスポート
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseRequest = z.infer<typeof exerciseRequestSchema>;
