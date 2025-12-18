/**
 * ワークアウト追加サービス
 * POST /api/v1/training-sessions/:sessionId/workouts
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

import { workoutWithRelations, WorkoutWithRelations } from "./types";

/**
 * トレーニングセッションにワークアウトを追加する
 * orderIndex はサーバー側で自動採番（末尾に追加）
 */
export async function addWorkout({
  sessionId,
  userId,
  exerciseId,
}: {
  sessionId: string;
  userId: string;
  exerciseId: string;
}): Promise<WorkoutWithRelations> {
  // トレーニングセッションの存在確認とオーナー確認
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  // 種目の存在確認（プリセットまたは自分の種目）
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    throw new HTTPException(404, { message: "種目が見つかりません" });
  }

  // プリセットでない場合は自分の種目か確認
  if (!exercise.isPreset && exercise.userId !== userId) {
    throw new HTTPException(403, { message: "この種目は使用できません" });
  }

  // 同じセッションに同じ種目がすでに存在するか確認
  const existingWorkout = await prisma.workout.findUnique({
    where: {
      trainingSessionId_exerciseId: {
        trainingSessionId: sessionId,
        exerciseId,
      },
    },
  });

  if (existingWorkout) {
    throw new HTTPException(409, {
      message: "この種目はすでに追加されています",
    });
  }

  // 現在の最大 orderIndex を取得
  const maxOrderIndex = await prisma.workout.aggregate({
    where: { trainingSessionId: sessionId },
    _max: { orderIndex: true },
  });

  const nextOrderIndex = (maxOrderIndex._max.orderIndex ?? -1) + 1;

  // ワークアウトを作成
  const workout = await prisma.workout.create({
    data: {
      trainingSessionId: sessionId,
      exerciseId,
      orderIndex: nextOrderIndex,
    },
    include: workoutWithRelations,
  });

  return workout;
}
