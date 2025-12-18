/**
 * エクササイズ更新サービス
 * プリセット種目は編集不可
 */
import { prisma } from "@/config/database";
import type { ExerciseInternal, ExerciseRequest } from "@/schemas/exercise";

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
}): Promise<ExerciseInternal> {
  const existing = await findExerciseForUser(exerciseId, userId);
  assertNotPreset(existing, "edit");

  try {
    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        name: exerciseData.name,
        bodyPart: exerciseData.bodyPart ?? null,
        exerciseType: exerciseData.exerciseType ?? existing.exerciseType,
      },
    });

    return {
      id: exercise.id,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      exerciseType: exercise.exerciseType,
      isPreset: exercise.isPreset,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}
