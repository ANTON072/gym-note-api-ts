/**
 * トレーニングセッション削除サービス
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

/**
 * トレーニングセッションを削除する（論理削除）
 */
export async function deleteTrainingSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}): Promise<void> {
  // 存在確認とオーナー確認
  const existing = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!existing || existing.userId !== userId || existing.deletedAt !== null) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { deletedAt: new Date() },
  });
}
