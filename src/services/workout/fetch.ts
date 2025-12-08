/**
 * ワークアウト取得サービス
 */
import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/errorHandler";

import {
  workoutWithRelations,
  WorkoutWithRelations,
  FetchWorkoutsResult,
  DEFAULT_LIMIT,
} from "./types";

/**
 * ワークアウト一覧を取得する
 * ページング対応
 */
export async function fetchWorkouts({
  userId,
  offset = 0,
}: {
  userId: string;
  offset?: number;
}): Promise<FetchWorkoutsResult> {
  const where = { userId, deletedAt: null };

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where,
      include: workoutWithRelations,
      orderBy: { performedStartAt: "desc" },
      skip: offset,
      take: DEFAULT_LIMIT,
    }),
    prisma.workout.count({ where }),
  ]);

  return {
    workouts,
    paging: {
      total,
      offset,
      limit: DEFAULT_LIMIT,
    },
  };
}

/**
 * 指定IDのワークアウトを取得する
 */
export async function fetchWorkoutById({
  workoutId,
  userId,
}: {
  workoutId: string;
  userId: string;
}): Promise<WorkoutWithRelations> {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: workoutWithRelations,
  });

  if (!workout || workout.userId !== userId || workout.deletedAt !== null) {
    throw new AppError(404, "NOT_FOUND", "ワークアウトが見つかりません");
  }

  return workout;
}
