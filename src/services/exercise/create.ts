/**
 * エクササイズ作成サービス
 */
import { prisma } from "@/config/database";
import type { Exercise } from "@/validators/exercise";

import { handleUniqueConstraintError } from "./types";

/**
 * Exerciseを作成する
 */
export async function createExercise({
  userId,
  exerciseData,
}: {
  userId: string;
  exerciseData: Omit<Exercise, "id" | "createdAt" | "updatedAt">;
}): Promise<Exercise> {
  try {
    return await prisma.exercise.create({
      data: {
        ...exerciseData,
        userId,
      },
    });
  } catch (error) {
    handleUniqueConstraintError(error);
  }
}
