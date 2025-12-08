/**
 * ワークアウトサービス
 * トレーニング記録の作成・取得・更新・削除
 */
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/errorHandler";
import type { WorkoutRequest } from "@/validators/workout";

/** createWorkout の include 設定 */
const workoutWithRelations = {
  workoutExercises: {
    include: {
      exercise: true,
      workoutSets: true,
    },
    orderBy: { orderIndex: "asc" },
  },
} as const satisfies Prisma.WorkoutInclude;

/** Workout と関連データを含む型 */
type WorkoutWithRelations = Prisma.WorkoutGetPayload<{
  include: typeof workoutWithRelations;
}>;

/**
 * エクササイズ指定が既存IDか新規作成かを判定
 */
function isExistingExercise(
  exercise:
    | { id: string }
    | { name: string; bodyPart: number | null; laterality: number | null }
): exercise is { id: string } {
  return "id" in exercise;
}

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

/** ページングのデフォルト件数 */
const DEFAULT_LIMIT = 20;

/** fetchWorkouts の戻り値の型 */
type FetchWorkoutsResult = {
  workouts: WorkoutWithRelations[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
};

/**
 * ワークアウト一覧を取得する
 * ページング対応
 */
export async function fetchWorkouts({
  userId,
  offset = 0,
}: {
  userId: string;
  offset?: number;
}): Promise<FetchWorkoutsResult> {
  const where = { userId, deletedAt: null };

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where,
      include: workoutWithRelations,
      orderBy: { performedStartAt: "desc" },
      skip: offset,
      take: DEFAULT_LIMIT,
    }),
    prisma.workout.count({ where }),
  ]);

  return {
    workouts,
    paging: {
      total,
      offset,
      limit: DEFAULT_LIMIT,
    },
  };
}

/**
 * 指定IDのワークアウトを取得する
 */
export async function fetchWorkoutById({
  workoutId,
  userId,
}: {
  workoutId: string;
  userId: string;
}): Promise<WorkoutWithRelations> {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: workoutWithRelations,
  });

  if (!workout || workout.userId !== userId || workout.deletedAt !== null) {
    throw new AppError(404, "NOT_FOUND", "ワークアウトが見つかりません");
  }

  return workout;
}
