/**
 * ワークアウトサービス共通の型・定数
 * ワークアウト = TrainingSession 内の1種目の実施記録
 */
import { Prisma } from "@prisma/client";

/** Workout の include 設定（関連データを含める） */
export const workoutWithRelations = {
  exercise: true,
  workoutSets: true,
} as const satisfies Prisma.WorkoutInclude;

/** Workout と関連データを含む型 */
export type WorkoutWithRelations = Prisma.WorkoutGetPayload<{
  include: typeof workoutWithRelations;
}>;
