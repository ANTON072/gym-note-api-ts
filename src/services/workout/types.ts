/**
 * ワークアウトサービス共通の型・定数・ヘルパー関数
 */
import { Prisma } from "@prisma/client";

/** Workout の include 設定（関連データを含める） */
export const workoutWithRelations = {
  workoutExercises: {
    include: {
      exercise: true,
      workoutSets: true,
    },
    orderBy: { orderIndex: "asc" },
  },
} as const satisfies Prisma.WorkoutInclude;

/** Workout と関連データを含む型 */
export type WorkoutWithRelations = Prisma.WorkoutGetPayload<{
  include: typeof workoutWithRelations;
}>;

/** ページングのデフォルト件数 */
export const DEFAULT_LIMIT = 20;

/** fetchWorkouts の戻り値の型 */
export type FetchWorkoutsResult = {
  workouts: WorkoutWithRelations[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
};

/**
 * エクササイズ指定が既存IDか新規作成かを判定
 */
export function isExistingExercise(
  exercise:
    | { id: string }
    | { name: string; bodyPart: number | null; laterality: number | null }
): exercise is { id: string } {
  return "id" in exercise;
}
