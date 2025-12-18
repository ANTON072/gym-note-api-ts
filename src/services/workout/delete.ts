/**
 * ワークアウト削除サービス
 * DELETE /api/v1/training-sessions/:sessionId/workouts/:workoutId
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

/**
 * ワークアウトを削除する（物理削除）
 * セットはカスケード削除される
 */
export async function deleteWorkout({
  sessionId,
  workoutId,
  userId,
}: {
  sessionId: string;
  workoutId: string;
  userId: string;
}): Promise<void> {
  // トレーニングセッションの存在確認とオーナー確認
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  // ワークアウトの存在確認
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
  });

  if (!workout || workout.trainingSessionId !== sessionId) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  // 物理削除（カスケードでセットも削除される）
  await prisma.workout.delete({
    where: { id: workoutId },
  });
}
