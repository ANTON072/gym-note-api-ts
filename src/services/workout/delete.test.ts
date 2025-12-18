/**
 * ワークアウト削除サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockWorkoutWithRelations,
} from "@/__tests__/fixtures/workout";

import { deleteWorkout } from "./delete";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    workout: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("deleteWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ワークアウトを論理削除できる", async () => {
    const deletedWorkout = {
      ...mockWorkoutWithRelations,
      deletedAt: new Date("2024-01-16T12:00:00Z"),
    };

    vi.mocked(prisma.workout.findUnique).mockResolvedValue(
      mockWorkoutWithRelations
    );
    vi.mocked(prisma.workout.update).mockResolvedValue(deletedWorkout);

    await deleteWorkout({
      workoutId: "workout1",
      userId: TEST_USER_ID,
    });

    // 既存のワークアウトが取得されることを確認
    expect(prisma.workout.findUnique).toHaveBeenCalledWith({
      where: { id: "workout1" },
    });

    // deletedAtが設定されることを確認
    expect(prisma.workout.update).toHaveBeenCalledWith({
      where: { id: "workout1" },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });

  it("存在しないワークアウトを削除しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue(null);

    await expect(
      deleteWorkout({
        workoutId: "nonexistent",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(prisma.workout.update).not.toHaveBeenCalled();
  });

  it("他のユーザーのワークアウトを削除しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      userId: "other-user",
    });

    await expect(
      deleteWorkout({
        workoutId: "workout1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(prisma.workout.update).not.toHaveBeenCalled();
  });

  it("既に削除済みのワークアウトを削除しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      deletedAt: new Date(),
    });

    await expect(
      deleteWorkout({
        workoutId: "workout1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });

    expect(prisma.workout.update).not.toHaveBeenCalled();
  });
});
