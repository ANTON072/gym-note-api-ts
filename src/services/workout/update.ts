/**
 * ワークアウト更新サービス
 */
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";
import type { WorkoutRequest } from "@/validators/workout";

import {
  workoutWithRelations,
  WorkoutWithRelations,
  isExistingExercise,
} from "./types";

/**
 * ワークアウトを更新する
 * 既存のWorkoutExercisesは削除して再作成する
 */
export async function updateWorkout({
  workoutId,
  userId,
  workoutData,
}: {
  workoutId: string;
  userId: string;
  workoutData: WorkoutRequest;
}): Promise<WorkoutWithRelations> {
  // 既存のワークアウトを取得して権限を確認
  const existingWorkout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: workoutWithRelations,
  });

  if (
    !existingWorkout ||
    existingWorkout.userId !== userId ||
    existingWorkout.deletedAt !== null
  ) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  const { workoutExercises, ...workoutFields } = workoutData;

  // 既存のworkoutExercisesを削除（カスケードでworkoutSetsも削除される）
  await prisma.workoutExercise.deleteMany({
    where: { workoutId },
  });

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
      throw new HTTPException(400, {
        message: `無効なエクササイズIDが含まれています: ${invalidIds.join(", ")}`,
      });
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

  // ワークアウトを更新（関連データも再作成）
  const workout = await prisma.workout.update({
    where: { id: workoutId },
    data: {
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
