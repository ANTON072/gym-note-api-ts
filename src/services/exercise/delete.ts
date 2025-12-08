/**
 * エクササイズ削除サービス
 */
import { prisma } from "@/config/database";

import { findExerciseForUser } from "./types";

/**
 * Exerciseを論理削除する
 */
export async function deleteExercise({
  exerciseId,
  userId,
}: {
  exerciseId: string;
  userId: string;
}): Promise<void> {
  await findExerciseForUser(exerciseId, userId);

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      deletedAt: new Date(),
    },
  });
}
