/**
 * エクササイズ削除サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockPresetExercise,
} from "@/__tests__/fixtures/exercise";

import { deleteExercise } from "./delete";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("deleteExercise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("エクササイズを論理削除する", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockExercise);
    vi.mocked(prisma.exercise.update).mockResolvedValue({
      ...mockExercise,
      deletedAt: new Date(),
    });

    await deleteExercise({
      exerciseId: "exercise1",
      userId: TEST_USER_ID,
    });

    expect(prisma.exercise.findUnique).toHaveBeenCalledWith({
      where: { id: "exercise1" },
    });
    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: "exercise1" },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });

  it("存在しないエクササイズの場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);

    await expect(
      deleteExercise({
        exerciseId: "nonexistent",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("他のユーザーのエクササイズは削除できない", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
      ...mockExercise,
      userId: "other-user",
    });

    await expect(
      deleteExercise({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("削除済みのエクササイズは削除できない", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
      ...mockExercise,
      deletedAt: new Date(),
    });

    await expect(
      deleteExercise({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("プリセット種目は削除できない", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockPresetExercise);

    await expect(
      deleteExercise({
        exerciseId: "preset-exercise1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 403,
      message: "プリセット種目は削除できません",
    });

    expect(prisma.exercise.update).not.toHaveBeenCalled();
  });
});
