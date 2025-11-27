/**
 * エクササイズサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";

import { fetchExercises, createExercise } from "./exercise";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("エクササイズサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchExercises", () => {
    const mockExercises = [
      {
        id: "exercise1",
        userId: "user123",
        name: "ベンチプレス",
        bodyPart: 1,
        laterality: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "exercise2",
        userId: "user123",
        name: "スクワット",
        bodyPart: 3,
        laterality: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("指定したユーザーのエクササイズ一覧を返す", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue(mockExercises);

      const result = await fetchExercises("user123");

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: { userId: "user123", deletedAt: null },
      });
      expect(result).toEqual(mockExercises);
      expect(result).toHaveLength(2);
    });

    it("エクササイズが存在しない場合、空配列を返す", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

      const result = await fetchExercises("user123");

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("createExercise", () => {
    const mockExercise = {
      id: "exercise1",
      userId: "user123",
      name: "ベンチプレス",
      bodyPart: 1,
      laterality: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("エクササイズを作成して返す", async () => {
      vi.mocked(prisma.exercise.create).mockResolvedValue(mockExercise);

      const result = await createExercise({
        userId: "user123",
        exerciseData: {
          name: "ベンチプレス",
          bodyPart: 1,
          laterality: null,
        },
      });

      expect(prisma.exercise.create).toHaveBeenCalledWith({
        data: {
          userId: "user123",
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
        {
          code: "P2002",
          clientVersion: "5.0.0",
        }
      );
      vi.mocked(prisma.exercise.create).mockRejectedValue(prismaError);

      await expect(
        createExercise({
          userId: "user123",
          exerciseData: {
            name: "ベンチプレス",
            bodyPart: 1,
            laterality: null,
          },
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "CONFLICT",
        message: "同じ名前のエクササイズが既に存在します",
      });
    });

    it("P2002以外のエラーはそのままスローする", async () => {
      const genericError = new Error("Database connection failed");
      vi.mocked(prisma.exercise.create).mockRejectedValue(genericError);

      await expect(
        createExercise({
          userId: "user123",
          exerciseData: {
            name: "ベンチプレス",
            bodyPart: 1,
            laterality: null,
          },
        })
      ).rejects.toThrow("Database connection failed");
    });
  });
});
