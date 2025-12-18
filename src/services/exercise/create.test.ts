/**
 * エクササイズ作成サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import { TEST_USER_ID, mockExercise } from "@/__tests__/fixtures/exercise";

import { createExercise } from "./create";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      create: vi.fn(),
    },
  },
}));

describe("createExercise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("エクササイズを作成して返す", async () => {
    vi.mocked(prisma.exercise.create).mockResolvedValue(mockExercise);

    const result = await createExercise({
      userId: TEST_USER_ID,
      exerciseData: {
        name: "ベンチプレス",
        bodyPart: 1,
        laterality: null,
      },
    });

    expect(prisma.exercise.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        name: "ベンチプレス",
        bodyPart: 1,
        laterality: null,
      },
    });
    expect(result).toEqual(mockExercise);
  });

  it("同じ名前のエクササイズが存在する場合、CONFLICTエラーをスローする", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0" }
    );
    vi.mocked(prisma.exercise.create).mockRejectedValue(prismaError);

    await expect(
      createExercise({
        userId: TEST_USER_ID,
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toMatchObject({
      status: 409,
      message: "同じ名前のエクササイズが既に存在します",
    });
  });

  it("P2002以外のエラーはそのままスローする", async () => {
    const genericError = new Error("Database connection failed");
    vi.mocked(prisma.exercise.create).mockRejectedValue(genericError);

    await expect(
      createExercise({
        userId: TEST_USER_ID,
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      })
    ).rejects.toThrow("Database connection failed");
  });
});
