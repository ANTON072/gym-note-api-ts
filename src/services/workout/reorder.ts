/**
 * ワークアウト並び替えサービス
 * PATCH /api/v1/training-sessions/:sessionId/workouts/reorder
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

/**
 * ワークアウトの並び順を更新する
 * workoutIds の順番で orderIndex を再設定
 */
export async function reorderWorkouts({
  sessionId,
  userId,
  workoutIds,
}: {
  sessionId: string;
  userId: string;
  workoutIds: string[];
}): Promise<void> {
  // トレーニングセッションの存在確認とオーナー確認
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { workouts: true },
  });

  if (!session || session.userId !== userId) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  // 既存のワークアウトIDを取得
  const existingWorkoutIds = new Set(session.workouts.map((w) => w.id));

  // リクエストのワークアウトIDがすべて存在するか確認
  for (const id of workoutIds) {
    if (!existingWorkoutIds.has(id)) {
      throw new HTTPException(400, {
        message: `無効なワークアウトIDが含まれています: ${id}`,
      });
    }
  }

  // リクエストにすべてのワークアウトが含まれているか確認
  if (workoutIds.length !== existingWorkoutIds.size) {
    throw new HTTPException(400, {
      message: "すべてのワークアウトIDを指定してください",
    });
  }

  // 重複チェック
  if (new Set(workoutIds).size !== workoutIds.length) {
    throw new HTTPException(400, {
      message: "重複したワークアウトIDが含まれています",
    });
  }

  // トランザクションで orderIndex を更新
  // ユニーク制約があるため、一時的に負の値を使用
  await prisma.$transaction(async (tx) => {
    // まず全てを負の値に設定（ユニーク制約を回避）
    for (let i = 0; i < workoutIds.length; i++) {
      await tx.workout.update({
        where: { id: workoutIds[i] },
        data: { orderIndex: -(i + 1) },
      });
    }

    // 正しい順序で更新
    for (let i = 0; i < workoutIds.length; i++) {
      await tx.workout.update({
        where: { id: workoutIds[i] },
        data: { orderIndex: i },
      });
    }
  });
}
