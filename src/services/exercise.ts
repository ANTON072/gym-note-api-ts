import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import type { Exercise, ExerciseRequest } from "@/validators/exercise";
import { AppError } from "@/middlewares/errorHandler";

/**
 * Prismaのユニーク制約エラー（P2002）をAppErrorに変換する
 */
function handleUniqueConstraintError(error: unknown): never {
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

/**
 * Exercise一覧データを返す
 */
export async function fetchExercises(userId: string): Promise<Exercise[]> {
  return await prisma.exercise.findMany({
    where: { userId, deletedAt: null },
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
}): Promise<Exercise> {
  return await findExerciseForUser(exerciseId, userId);
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
    handleUniqueConstraintError(error);
  }
}

/**
 * エクササイズが存在し、指定ユーザーのものかを確認する
 */
async function findExerciseForUser(
  exerciseId: string,
  userId: string
): Promise<Exercise & { deletedAt: Date | null }> {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise || exercise.userId !== userId || exercise.deletedAt !== null) {
    throw new AppError(404, "NOT_FOUND", "エクササイズが見つかりません");
  }

  return exercise;
}

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
