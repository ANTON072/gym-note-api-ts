/**
 * エクササイズ作成サービス
 */
import { prisma } from "@/config/database";
import type { Exercise, ExerciseRequest } from "@/schemas/exercise";

import { handleUniqueConstraintError } from "./types";

/**
 * Exerciseを作成する
 * カスタム種目として作成（isPreset: false）
 */
export async function createExercise({
  userId,
  exerciseData,
}: {
  userId: string;
  exerciseData: ExerciseRequest;
}): Promise<Exercise> {
  try {
    const exercise = await prisma.exercise.create({
      data: {
        userId,
        name: exerciseData.name,
        bodyPart: exerciseData.bodyPart ?? null,
        exerciseType: exerciseData.exerciseType ?? 0, // デフォルト: 筋トレ
        isPreset: false, // カスタム種目
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
