/**
 * トレーニングセッションサービス共通の型・定数
 */
import { Prisma } from "@prisma/client";

/** TrainingSession の include 設定（関連データを含める） */
export const trainingSessionWithRelations = {
  workouts: {
    include: {
      exercise: true,
      workoutSets: true,
    },
    orderBy: { orderIndex: "asc" },
  },
} as const satisfies Prisma.TrainingSessionInclude;

/** TrainingSession と関連データを含む型 */
export type TrainingSessionWithRelations = Prisma.TrainingSessionGetPayload<{
  include: typeof trainingSessionWithRelations;
}>;

/** ページングのデフォルト件数 */
export const DEFAULT_LIMIT = 20;

/** fetchTrainingSessions の戻り値の型 */
export type FetchTrainingSessionsResult = {
  trainingSessions: TrainingSessionWithRelations[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
};
