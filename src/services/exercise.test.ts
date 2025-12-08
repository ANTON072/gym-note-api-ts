/**
 * エクササイズサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockExerciseList,
} from "@/__tests__/fixtures/exercise";

import {
  fetchExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "./exercise";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("エクササイズサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchExercises", () => {
    it("指定したユーザーのエクササイズ一覧を返す", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue(mockExerciseList);

      const result = await fetchExercises(TEST_USER_ID);

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID, deletedAt: null },
      });
      expect(result).toEqual(mockExerciseList);
      expect(result).toHaveLength(2);
    });

    it("エクササイズが存在しない場合、空配列を返す", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

      const result = await fetchExercises(TEST_USER_ID);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("nameを指定した場合、前方一致で検索する", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);

      const result = await fetchExercises(TEST_USER_ID, { name: "ベン" });

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
          deletedAt: null,
          name: { startsWith: "ベン" },
        },
      });
      expect(result).toEqual([mockExercise]);
    });

    it("bodyPartを指定した場合、部位でフィルタする", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);

      const result = await fetchExercises(TEST_USER_ID, { bodyPart: 1 });

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
          deletedAt: null,
          bodyPart: 1,
        },
      });
      expect(result).toEqual([mockExercise]);
    });

    it("nameとbodyPartを両方指定した場合、両方の条件でフィルタする", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);

      const result = await fetchExercises(TEST_USER_ID, {
        name: "ベン",
        bodyPart: 1,
      });

      expect(prisma.exercise.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
          deletedAt: null,
          name: { startsWith: "ベン" },
          bodyPart: 1,
        },
      });
      expect(result).toEqual([mockExercise]);
    });
  });

  describe("fetchExerciseById", () => {
    it("指定したIDのエクササイズを返す", async () => {
      vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockExercise);

      const result = await fetchExerciseById({
        exerciseId: "exercise1",
        userId: TEST_USER_ID,
      });

      expect(prisma.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: "exercise1" },
      });
      expect(result).toEqual(mockExercise);
    });

    it("存在しないエクササイズの場合、NOT_FOUNDエラーをスローする", async () => {
      vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);

      await expect(
        fetchExerciseById({
          exerciseId: "nonexistent",
          userId: TEST_USER_ID,
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("他のユーザーのエクササイズは取得できない", async () => {
      vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
        ...mockExercise,
        userId: "other-user",
      });

      await expect(
        fetchExerciseById({
          exerciseId: "exercise1",
          userId: TEST_USER_ID,
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("削除済みのエクササイズは取得できない", async () => {
      vi.mocked(prisma.exercise.findUnique).mockResolvedValue({
        ...mockExercise,
        deletedAt: new Date(),
      });

      await expect(
        fetchExerciseById({
          exerciseId: "exercise1",
          userId: TEST_USER_ID,
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });

  describe("createExercise", () => {
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

  describe("updateExercise", () => {
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

  describe("deleteExercise", () => {
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
        statusCode: 404,
        code: "NOT_FOUND",
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
        statusCode: 404,
        code: "NOT_FOUND",
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
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });
});
