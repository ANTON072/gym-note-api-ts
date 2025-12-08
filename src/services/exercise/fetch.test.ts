/**
 * エクササイズ取得サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockExerciseList,
} from "@/__tests__/fixtures/exercise";

import { fetchExercises, fetchExerciseById } from "./fetch";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("fetchExercises", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
