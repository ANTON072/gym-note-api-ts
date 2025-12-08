/**
 * エクササイズ更新サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import { TEST_USER_ID, mockExercise } from "@/__tests__/fixtures/exercise";

import { updateExercise } from "./update";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("updateExercise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("エクササイズを更新して返す", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockExercise);
    const updatedExercise = {
      ...mockExercise,
      name: "ベンチプレス（ワイド）",
      bodyPart: 0,
    };
    vi.mocked(prisma.exercise.update).mockResolvedValue(updatedExercise);

    const result = await updateExercise({
      exerciseId: "exercise1",
      userId: TEST_USER_ID,
      exerciseData: {
        name: "ベンチプレス（ワイド）",
        bodyPart: 0,
        laterality: null,
      },
    });

    expect(prisma.exercise.findUnique).toHaveBeenCalledWith({
      where: { id: "exercise1" },
    });
    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { id: "exercise1" },
      data: {
        name: "ベンチプレス（ワイド）",
        bodyPart: 0,
        laterality: null,
      },
    });
    expect(result).toEqual(updatedExercise);
  });

  it("存在しないエクササイズの場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);

    await expect(
      updateExercise({
        exerciseId: "nonexistent",
        userId: TEST_USER_ID,
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("他のユーザーのエクササイズは更新できない", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
      ...mockExercise,
      userId: "other-user",
    });

    await expect(
      updateExercise({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("削除済みのエクササイズは更新できない", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
      ...mockExercise,
      deletedAt: new Date(),
    });

    await expect(
      updateExercise({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("同じ名前のエクササイズが存在する場合、CONFLICTエラーをスローする", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockExercise);
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0" }
    );
    vi.mocked(prisma.exercise.update).mockRejectedValue(prismaError);

    await expect(
      updateExercise({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
        exerciseData: {
          name: "スクワット",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "CONFLICT",
    });
  });
});
