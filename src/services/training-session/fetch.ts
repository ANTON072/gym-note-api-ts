/**
 * トレーニングセッション取得サービス
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";

import {
  trainingSessionWithRelations,
  TrainingSessionWithRelations,
  FetchTrainingSessionsResult,
  DEFAULT_LIMIT,
} from "./types";

/**
 * トレーニングセッション一覧を取得する
 * ページング対応
 */
export async function fetchTrainingSessions({
  userId,
  offset = 0,
}: {
  userId: string;
  offset?: number;
}): Promise<FetchTrainingSessionsResult> {
  const where = { userId };

  const [trainingSessions, total] = await Promise.all([
    prisma.trainingSession.findMany({
      where,
      include: trainingSessionWithRelations,
      orderBy: { performedStartAt: "desc" },
      skip: offset,
      take: DEFAULT_LIMIT,
    }),
    prisma.trainingSession.count({ where }),
  ]);

  return {
    trainingSessions,
    paging: {
      total,
      offset,
      limit: DEFAULT_LIMIT,
    },
  };
}

/**
 * 指定IDのトレーニングセッションを取得する
 */
export async function fetchTrainingSessionById({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}): Promise<TrainingSessionWithRelations> {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: trainingSessionWithRelations,
  });

  if (!session || session.userId !== userId) {
    throw new HTTPException(404, {
      message: "トレーニングセッションが見つかりません",
    });
  }

  return session;
}
