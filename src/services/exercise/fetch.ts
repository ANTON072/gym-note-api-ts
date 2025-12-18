/**
 * エクササイズ取得サービス
 * プリセット種目とユーザーのカスタム種目を取得する
 */
import { prisma } from "@/config/database";
import type { Exercise } from "@/validators/exercise";

import { findExerciseForUser } from "./types";

/** isPreset を含む Exercise 型 */
export type ExerciseWithPreset = Exercise & { isPreset: boolean };

/**
 * Exercise一覧データを返す
 * プリセット種目とユーザーのカスタム種目の両方を返す
 * @param userId ユーザーID
 * @param options.name 名前で前方一致検索（オプション）
 * @param options.bodyPart 部位でフィルタ（オプション）
 */
export async function fetchExercises(
  userId: string,
  options?: { name?: string; bodyPart?: number }
): Promise<ExerciseWithPreset[]> {
  return await prisma.exercise.findMany({
    where: {
      OR: [
        { isPreset: true }, // プリセット種目
        { userId }, // ユーザーのカスタム種目
      ],
      deletedAt: null,
      ...(options?.name && { name: { startsWith: options.name } }),
      ...(options?.bodyPart !== undefined && { bodyPart: options.bodyPart }),
    },
    orderBy: [{ isPreset: "desc" }, { name: "asc" }], // プリセット種目を先に表示
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
}): Promise<ExerciseWithPreset> {
  return await findExerciseForUser(exerciseId, userId);
}
