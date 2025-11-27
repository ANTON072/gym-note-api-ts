import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

import type { Exercise } from "@/validators/exercise";
import { AppError } from "@/middlewares/errorHandler";

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
  try {
    return await prisma.exercise.create({
      data: {
        ...exerciseData,
        userId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        409,
        "CONFLICT",
        "同じ名前のエクササイズが既に存在します"
      );
    }
    throw error;
  }
}
