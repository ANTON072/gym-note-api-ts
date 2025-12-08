/**
 * ワークアウト作成サービス
 */
import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/errorHandler";
import type { WorkoutRequest } from "@/validators/workout";

import {
  workoutWithRelations,
  WorkoutWithRelations,
  isExistingExercise,
} from "./types";

/**
 * ワークアウトを作成する
 * WorkoutExercises と WorkoutSets も同時に作成
 */
export async function createWorkout({
  userId,
  workoutData,
}: {
  userId: string;
  workoutData: WorkoutRequest;
}): Promise<WorkoutWithRelations> {
  const { workoutExercises, ...workoutFields } = workoutData;

  // 既存エクササイズと新規エクササイズを分離
  const existingExerciseIds: string[] = [];
  const newExerciseIndices: number[] = [];

  workoutExercises.forEach((we, index) => {
    if (isExistingExercise(we.exercise)) {
      existingExerciseIds.push(we.exercise.id);
    } else {
      newExerciseIndices.push(index);
    }
  });

  // 既存エクササイズIDの検証
  if (existingExerciseIds.length > 0) {
    const validExercises = await prisma.exercise.findMany({
      where: {
        id: { in: existingExerciseIds },
        userId,
        deletedAt: null,
      },
    });

    const validExerciseIds = new Set(validExercises.map((e) => e.id));
    const invalidIds = existingExerciseIds.filter(
      (id) => !validExerciseIds.has(id)
    );

    if (invalidIds.length > 0) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        `無効なエクササイズIDが含まれています: ${invalidIds.join(", ")}`
      );
    }
  }

  // 新規エクササイズを作成し、IDを取得
  const exerciseIdMap = new Map<number, string>();

  for (const index of newExerciseIndices) {
    const exerciseData = workoutExercises[index].exercise;
    if (!isExistingExercise(exerciseData)) {
      const newExercise = await prisma.exercise.create({
        data: {
          userId,
          name: exerciseData.name,
          bodyPart: exerciseData.bodyPart,
          laterality: exerciseData.laterality,
        },
      });
      exerciseIdMap.set(index, newExercise.id);
    }
  }

  // ワークアウトとその関連データを一括作成
  const workout = await prisma.workout.create({
    data: {
      userId,
      ...workoutFields,
      workoutExercises: {
        create: workoutExercises.map((we, index) => {
          const exerciseId = isExistingExercise(we.exercise)
            ? we.exercise.id
            : exerciseIdMap.get(index)!;

          return {
            exerciseId,
            orderIndex: we.orderIndex,
            workoutSets: {
              create: we.workoutSets.map((ws) => ({
                weight: ws.weight,
                reps: ws.reps,
              })),
            },
          };
        }),
      },
    },
    include: workoutWithRelations,
  });

  return workout;
}
