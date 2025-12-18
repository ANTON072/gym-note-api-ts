/**
 * ワークアウト取得サービス
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

import { workoutWithRelations, WorkoutWithRelations } from "./types";

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
    include: {
      ...workoutWithRelations,
      trainingSession: true,
    },
  });

  if (!workout) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  // トレーニングセッションのオーナーを確認
  if (workout.trainingSession.userId !== userId) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  return workout;
}
