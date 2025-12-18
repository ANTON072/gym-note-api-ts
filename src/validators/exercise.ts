/**
 * 種目（Exercise）のバリデーションスキーマ
 */
import z from "zod";

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  bodyPart: z.number().int().min(0).max(5).nullable(),
  exerciseType: z.number().int().min(0).max(1), // 0: 筋トレ, 1: 有酸素
  isPreset: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const exerciseRequestSchema = z.object({
  name: z.string().min(1).max(100),
  bodyPart: z.number().int().min(0).max(5).nullable().optional(),
  exerciseType: z.number().int().min(0).max(1).optional(), // デフォルト: 0（筋トレ）
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseRequest = z.infer<typeof exerciseRequestSchema>;
