/**
 * エクササイズ取得サービス
 */
import { prisma } from "@/config/database";
import type { Exercise } from "@/validators/exercise";

import { findExerciseForUser } from "./types";

/**
 * Exercise一覧データを返す
 * @param userId ユーザーID
 * @param options.name 名前で前方一致検索（オプション）
 * @param options.bodyPart 部位でフィルタ（オプション）
 */
export async function fetchExercises(
  userId: string,
  options?: { name?: string; bodyPart?: number }
): Promise<Exercise[]> {
  return await prisma.exercise.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(options?.name && { name: { startsWith: options.name } }),
      ...(options?.bodyPart !== undefined && { bodyPart: options.bodyPart }),
    },
  });
}

/**
 * 指定IDのExerciseを取得する
 */
export async function fetchExerciseById({
  exerciseId,
  userId,
}: {
  exerciseId: string;
  userId: string;
}): Promise<Exercise> {
  return await findExerciseForUser(exerciseId, userId);
}
