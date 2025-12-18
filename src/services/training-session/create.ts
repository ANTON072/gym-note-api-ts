/**
 * トレーニングセッション作成サービス
 */
import { prisma } from "@/config/database";

import {
  trainingSessionWithRelations,
  TrainingSessionWithRelations,
} from "./types";

/**
 * 新規トレーニングセッションを作成する
 */
export async function createTrainingSession({
  userId,
  performedStartAt,
}: {
  userId: string;
  performedStartAt: Date;
}): Promise<TrainingSessionWithRelations> {
  const session = await prisma.trainingSession.create({
    data: {
      userId,
      performedStartAt,
    },
    include: trainingSessionWithRelations,
  });

  return session;
}
