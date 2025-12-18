/**
 * ワークアウト取得サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockWorkoutWithRelations,
  mockWorkoutList,
  expectedWorkoutInclude,
} from "@/__tests__/fixtures/workout";

import { fetchWorkouts, fetchWorkoutById } from "./fetch";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    workout: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("fetchWorkouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ワークアウト一覧とページング情報を返す", async () => {
    vi.mocked(prisma.workout.findMany).mockResolvedValue(mockWorkoutList);
    vi.mocked(prisma.workout.count).mockResolvedValue(2);

    const result = await fetchWorkouts({ userId: TEST_USER_ID });

    expect(prisma.workout.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID, deletedAt: null },
      include: expectedWorkoutInclude,
      orderBy: { performedStartAt: "desc" },
      skip: 0,
      take: 20,
    });

    expect(prisma.workout.count).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID, deletedAt: null },
    });

    expect(result).toEqual({
      workouts: mockWorkoutList,
      paging: {
        total: 2,
        offset: 0,
        limit: 20,
      },
    });
  });

  it("offsetを指定した場合、スキップして取得する", async () => {
    vi.mocked(prisma.workout.findMany).mockResolvedValue([mockWorkoutList[1]]);
    vi.mocked(prisma.workout.count).mockResolvedValue(2);

    const result = await fetchWorkouts({ userId: TEST_USER_ID, offset: 1 });

    expect(prisma.workout.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID, deletedAt: null },
      include: expectedWorkoutInclude,
      orderBy: { performedStartAt: "desc" },
      skip: 1,
      take: 20,
    });

    expect(result.paging).toEqual({
      total: 2,
      offset: 1,
      limit: 20,
    });
  });

  it("ワークアウトが存在しない場合、空配列を返す", async () => {
    vi.mocked(prisma.workout.findMany).mockResolvedValue([]);
    vi.mocked(prisma.workout.count).mockResolvedValue(0);

    const result = await fetchWorkouts({ userId: TEST_USER_ID });

    expect(result).toEqual({
      workouts: [],
      paging: {
        total: 0,
        offset: 0,
        limit: 20,
      },
    });
  });
});

describe("fetchWorkoutById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("指定したIDのワークアウトを返す", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue(
      mockWorkoutWithRelations
    );

    const result = await fetchWorkoutById({
      workoutId: "workout1",
      userId: TEST_USER_ID,
    });

    expect(prisma.workout.findUnique).toHaveBeenCalledWith({
      where: { id: "workout1" },
      include: expectedWorkoutInclude,
    });
    expect(result).toEqual(mockWorkoutWithRelations);
  });

  it("存在しないワークアウトの場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue(null);

    await expect(
      fetchWorkoutById({
        workoutId: "nonexistent",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("他のユーザーのワークアウトは取得できない", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      userId: "other-user",
    });

    await expect(
      fetchWorkoutById({
        workoutId: "workout1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });

  it("削除済みのワークアウトは取得できない", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      deletedAt: new Date(),
    });

    await expect(
      fetchWorkoutById({
        workoutId: "workout1",
        userId: TEST_USER_ID,
      })
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});
