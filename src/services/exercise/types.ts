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
 * プリセット種目またはユーザーのカスタム種目を返す
 */
export async function findExerciseForUser(
  exerciseId: string,
  userId: string
): Promise<Exercise & { deletedAt: Date | null; isPreset: boolean }> {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise || exercise.deletedAt !== null) {
    throw new HTTPException(404, { message: "エクササイズが見つかりません" });
  }

  // プリセット種目は全ユーザーがアクセス可能
  if (exercise.isPreset) {
    return exercise;
  }

  // カスタム種目は所有者のみアクセス可能
  if (exercise.userId !== userId) {
    throw new HTTPException(404, { message: "エクササイズが見つかりません" });
  }

  return exercise;
}

/**
 * プリセット種目の場合は編集・削除不可エラーをスローする
 */
export function assertNotPreset(
  exercise: { isPreset: boolean },
  action: "edit" | "delete"
): void {
  if (exercise.isPreset) {
    const message =
      action === "edit"
        ? "プリセット種目は編集できません"
        : "プリセット種目は削除できません";
    throw new HTTPException(403, { message });
  }
}
