/**
 * エクササイズ取得サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockExerciseList,
  mockPresetExercise,
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

  it("プリセット種目とユーザーのカスタム種目の両方を返す", async () => {
    vi.mocked(prisma.exercise.findMany).mockResolvedValue(mockExerciseList);

    const result = await fetchExercises(TEST_USER_ID);

    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ isPreset: true }, { userId: TEST_USER_ID }],
        deletedAt: null,
      },
      orderBy: [{ isPreset: "desc" }, { name: "asc" }],
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
});

describe("fetchExerciseById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定したIDのカスタム種目を返す", async () => {
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

  it("プリセット種目は全ユーザーがアクセスできる", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(mockPresetExercise);

    const result = await fetchExerciseById({
      exerciseId: "preset-exercise1",
      userId: TEST_USER_ID,
    });

    expect(result).toEqual(mockPresetExercise);
    expect(result.isPreset).toBe(true);
  });

  it("存在しないエクササイズの場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);

    await expect(
      fetchExerciseById({
        exerciseId: "nonexistent",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("他のユーザーのカスタム種目は取得できない", async () => {
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
      status: 404,
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
      status: 404,
    });
  });
});
