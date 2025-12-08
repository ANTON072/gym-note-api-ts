/**
 * ワークアウト削除サービス
 */
import { prisma } from "@/config/database";
import { AppError } from "@/middlewares/errorHandler";

/**
 * ワークアウトを論理削除する
 * deletedAtに現在時刻を設定
 */
export async function deleteWorkout({
  workoutId,
  userId,
}: {
  workoutId: string;
  userId: string;
}): Promise<void> {
  // 既存のワークアウトを取得して権限を確認
  const existingWorkout = await prisma.workout.findUnique({
    where: { id: workoutId },
  });

  if (
    !existingWorkout ||
    existingWorkout.userId !== userId ||
    existingWorkout.deletedAt !== null
  ) {
    throw new AppError(404, "NOT_FOUND", "ワークアウトが見つかりません");
  }

  // 論理削除（deletedAtを設定）
  await prisma.workout.update({
    where: { id: workoutId },
    data: {
      deletedAt: new Date(),
    },
  });
}
