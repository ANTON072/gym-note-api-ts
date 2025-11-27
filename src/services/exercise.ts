import { prisma } from "../config/database";

import type { Exercise } from "@/validators/exercise";

/**
 * Exercise一覧データを返す
 */
export async function fetchExercises(userId: string): Promise<Exercise[]> {
  return await prisma.exercise.findMany({
    where: { userId },
  });
}

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
  return await prisma.exercise.create({
    data: {
      ...exerciseData,
      userId,
    },
  });
}
