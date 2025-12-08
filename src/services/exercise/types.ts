/**
 * エクササイズサービス共通の型・ヘルパー関数
 */
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/errorHandler";
import type { Exercise } from "@/validators/exercise";

/**
 * Prismaのユニーク制約エラー（P2002）をAppErrorに変換する
 */
export function handleUniqueConstraintError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      409,
      "CONFLICT",
      "同じ名前のエクササイズが既に存在します"
    );
  }
  throw error;
}

/**
 * エクササイズが存在し、指定ユーザーのものかを確認する
 */
export async function findExerciseForUser(
  exerciseId: string,
  userId: string
): Promise<Exercise & { deletedAt: Date | null }> {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise || exercise.userId !== userId || exercise.deletedAt !== null) {
    throw new AppError(404, "NOT_FOUND", "エクササイズが見つかりません");
  }

  return exercise;
}
