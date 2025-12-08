/**
 * エクササイズ更新サービス
 */
import { prisma } from "@/config/database";
import type { Exercise, ExerciseRequest } from "@/validators/exercise";

import { findExerciseForUser, handleUniqueConstraintError } from "./types";

/**
 * Exerciseを更新する
 */
export async function updateExercise({
  exerciseId,
  userId,
  exerciseData,
}: {
  exerciseId: string;
  userId: string;
  exerciseData: ExerciseRequest;
}): Promise<Exercise> {
  await findExerciseForUser(exerciseId, userId);

  try {
    return await prisma.exercise.update({
      where: { id: exerciseId },
      data: exerciseData,
    });
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}
