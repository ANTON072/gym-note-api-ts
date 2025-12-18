/**
 * ワークアウト更新サービス
 * PUT /api/v1/workouts/:workoutId
 * メモとセットを差分更新
 */
import { HTTPException } from "hono/http-exception";
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/config/database";
import type { WorkoutSetRequest } from "@/validators/training-session";

import { workoutWithRelations, WorkoutWithRelations } from "./types";

/**
 * ワークアウトを更新する（メモとセットの差分更新）
 * - sets[].id有り → 更新
 * - sets[].id無し → 新規作成
 * - リクエストに無いID → 削除
 */
export async function updateWorkout({
  workoutId,
  userId,
  data,
}: {
  workoutId: string;
  userId: string;
  data: {
    note?: string | null;
    sets?: WorkoutSetRequest[];
  };
}): Promise<WorkoutWithRelations> {
  // 既存のワークアウトを取得して権限を確認
  const existingWorkout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      trainingSession: true,
      workoutSets: true,
    },
  });

  if (!existingWorkout) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  // トレーニングセッションのオーナーを確認
  if (
    existingWorkout.trainingSession.userId !== userId ||
    existingWorkout.trainingSession.deletedAt !== null
  ) {
    throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
  }

  // メモの更新データを準備
  const updateData: { note?: string | null } = {};
  if (data.note !== undefined) {
    updateData.note = data.note;
  }

  // セットの差分更新
  if (data.sets !== undefined) {
    const existingSetIds = new Set(
      existingWorkout.workoutSets.map((s) => s.id)
    );
    const requestSetIds = new Set(
      data.sets.filter((s) => s.id).map((s) => s.id!)
    );

    // 削除対象: リクエストにないID
    const setsToDelete = [...existingSetIds].filter(
      (id) => !requestSetIds.has(id)
    );

    // 更新対象: IDがあるセット
    const setsToUpdate = data.sets.filter(
      (s) => s.id && existingSetIds.has(s.id)
    );

    // 新規作成対象: IDがないセット
    const setsToCreate = data.sets.filter((s) => !s.id);

    // トランザクションで処理
    await prisma.$transaction(async (tx) => {
      // 削除
      if (setsToDelete.length > 0) {
        await tx.workoutSet.deleteMany({
          where: { id: { in: setsToDelete } },
        });
      }

      // 更新
      for (const set of setsToUpdate) {
        await tx.workoutSet.update({
          where: { id: set.id },
          data: {
            weight: set.weight ?? null,
            reps: set.reps ?? null,
            distance: set.distance ?? null,
            duration: set.duration ?? null,
            speed:
              set.speed !== undefined && set.speed !== null
                ? new Decimal(set.speed)
                : null,
            calories: set.calories ?? null,
          },
        });
      }

      // 新規作成
      if (setsToCreate.length > 0) {
        await tx.workoutSet.createMany({
          data: setsToCreate.map((set) => ({
            workoutId,
            weight: set.weight ?? null,
            reps: set.reps ?? null,
            distance: set.distance ?? null,
            duration: set.duration ?? null,
            speed:
              set.speed !== undefined && set.speed !== null
                ? new Decimal(set.speed)
                : null,
            calories: set.calories ?? null,
          })),
        });
      }

      // メモを更新
      if (Object.keys(updateData).length > 0) {
        await tx.workout.update({
          where: { id: workoutId },
          data: updateData,
        });
      }
    });
  } else if (Object.keys(updateData).length > 0) {
    // セットの更新がない場合はメモのみ更新
    await prisma.workout.update({
      where: { id: workoutId },
      data: updateData,
    });
  }

  // 更新後のデータを返す
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: workoutWithRelations,
  });

  return workout!;
}
