/**
 * エクササイズ削除サービス
 * プリセット種目は削除不可
 */
import { prisma } from "@/config/database";

import { assertNotPreset, findExerciseForUser } from "./types";

/**
 * Exerciseを物理削除する
 * プリセット種目の場合は403エラーをスローする
 */
export async function deleteExercise({
  exerciseId,
  userId,
}: {
  exerciseId: string;
  userId: string;
}): Promise<void> {
  const exercise = await findExerciseForUser(exerciseId, userId);
  assertNotPreset(exercise, "delete");

  await prisma.exercise.delete({
    where: { id: exerciseId },
  });
}
