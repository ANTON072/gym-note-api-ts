/**
 * エクササイズ取得サービス
 * プリセット種目とユーザーのカスタム種目を取得する
 */
import { prisma } from "@/config/database";
import type { ExerciseInternal } from "@/schemas/exercise";

import { findExerciseForUser } from "./types";

/** isPreset を含む Exercise 型（サービス層用） */
export type ExerciseWithPreset = ExerciseInternal;

/**
 * Exercise一覧データを返す
 * プリセット種目とユーザーのカスタム種目の両方を返す
 * @param userId ユーザーID
 */
export async function fetchExercises(
  userId: string
): Promise<ExerciseWithPreset[]> {
  return await prisma.exercise.findMany({
    where: {
      OR: [
        { isPreset: true }, // プリセット種目
        { userId }, // ユーザーのカスタム種目
      ],
      deletedAt: null,
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
