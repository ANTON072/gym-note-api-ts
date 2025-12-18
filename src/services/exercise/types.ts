/**
 * エクササイズサービス共通の型・ヘルパー関数
 */
import { Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";
import type { Exercise } from "@/validators/exercise";

/**
 * Prismaのユニーク制約エラー（P2002）をHTTPExceptionに変換する
 */
export function handleUniqueConstraintError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new HTTPException(409, {
      message: "同じ名前のエクササイズが既に存在します",
    });
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
    throw new HTTPException(404, { message: "エクササイズが見つかりません" });
  }

  return exercise;
}
