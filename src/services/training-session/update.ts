/**
 * トレーニングセッション更新サービス
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

import {
  trainingSessionWithRelations,
  TrainingSessionWithRelations,
} from "./types";

/**
 * トレーニングセッションを更新する
 */
export async function updateTrainingSession({
  sessionId,
  userId,
  data,
}: {
  sessionId: string;
  userId: string;
  data: {
    performedStartAt?: Date;
    performedEndAt?: Date | null;
    place?: string | null;
  };
}): Promise<TrainingSessionWithRelations> {
  // 存在確認とオーナー確認
  const existing = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
  });

  if (!existing || existing.userId !== userId) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  const session = await prisma.trainingSession.update({
    where: { id: sessionId },
    data,
    include: trainingSessionWithRelations,
  });

  return session;
}
