/**
 * エクササイズ更新サービス
 * プリセット種目は編集不可
 */
import { prisma } from "@/config/database";
import type { Exercise, ExerciseRequest } from "@/validators/exercise";

import {
  assertNotPreset,
  findExerciseForUser,
  handleUniqueConstraintError,
} from "./types";

/**
 * Exerciseを更新する
 * プリセット種目の場合は403エラーをスローする
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
  const exercise = await findExerciseForUser(exerciseId, userId);
  assertNotPreset(exercise, "edit");

  try {
    return await prisma.exercise.update({
      where: { id: exerciseId },
      data: exerciseData,
    });
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}
