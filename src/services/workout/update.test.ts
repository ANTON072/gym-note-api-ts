/**
 * ワークアウト更新サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockWorkoutWithRelations,
  expectedWorkoutInclude,
} from "@/__tests__/fixtures/workout";

import { updateWorkout } from "./update";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    workout: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    exercise: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    workoutExercise: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("updateWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updatedWorkoutWithRelations = {
    ...mockWorkoutWithRelations,
    place: "自宅ジム",
    note: "更新後のメモ",
    updatedAt: new Date("2024-01-16T12:00:00Z"),
  };

  it("既存エクササイズを使ってワークアウトを更新できる", async () => {
    // findUniqueは2回呼ばれる（更新前と更新後）
    vi.mocked(prisma.workout.findUnique)
      .mockResolvedValueOnce(mockWorkoutWithRelations)
      .mockResolvedValueOnce(updatedWorkoutWithRelations);
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);
    vi.mocked(prisma.workoutExercise.deleteMany).mockResolvedValue({
      count: 1,
    });
    vi.mocked(prisma.workout.update).mockResolvedValue(
      updatedWorkoutWithRelations
    );

    const result = await updateWorkout({
      workoutId: "workout1",
      userId: TEST_USER_ID,
      workoutData: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: new Date("2024-01-15T11:30:00Z"),
        place: "自宅ジム",
        note: "更新後のメモ",
        workoutExercises: [
          {
            exercise: { id: "exercise1" },
            orderIndex: 1,
            workoutSets: [
              { weight: 65, reps: 10 },
              { weight: 75, reps: 8 },
            ],
          },
        ],
      },
    });

    // 既存のワークアウトが取得されることを確認
    expect(prisma.workout.findUnique).toHaveBeenCalledWith({
      where: { id: "workout1" },
      include: expectedWorkoutInclude,
    });

    // 既存のworkoutExercisesが削除されることを確認
    expect(prisma.workoutExercise.deleteMany).toHaveBeenCalledWith({
      where: { workoutId: "workout1" },
    });

    // エクササイズの検証が行われることを確認
    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["exercise1"] },
        userId: TEST_USER_ID,
        deletedAt: null,
      },
    });

    // ワークアウトが更新されることを確認
    expect(prisma.workout.update).toHaveBeenCalledWith({
      data: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: new Date("2024-01-15T11:30:00Z"),
        place: "自宅ジム",
        note: "更新後のメモ",
        workoutExercises: {
          create: [
            {
              exerciseId: "exercise1",
              orderIndex: 1,
              workoutSets: {
                create: [
                  { weight: 65, reps: 10 },
                  { weight: 75, reps: 8 },
                ],
              },
            },
          ],
        },
      },
      where: { id: "workout1" },
      include: expectedWorkoutInclude,
    });

    expect(result).toEqual(updatedWorkoutWithRelations);
  });

  it("新規エクササイズを作成してワークアウトを更新できる", async () => {
    const newExercise = {
      ...mockExercise,
      id: "new-exercise1",
      name: "デッドリフト",
      bodyPart: 3,
    };

    vi.mocked(prisma.workout.findUnique).mockResolvedValue(
      mockWorkoutWithRelations
    );
    vi.mocked(prisma.workoutExercise.deleteMany).mockResolvedValue({
      count: 1,
    });
    vi.mocked(prisma.exercise.create).mockResolvedValue(newExercise);
    vi.mocked(prisma.workout.update).mockResolvedValue(
      updatedWorkoutWithRelations
    );

    await updateWorkout({
      workoutId: "workout1",
      userId: TEST_USER_ID,
      workoutData: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: null,
        place: null,
        note: null,
        workoutExercises: [
          {
            exercise: { name: "デッドリフト", bodyPart: 3, laterality: null },
            orderIndex: 1,
            workoutSets: [],
          },
        ],
      },
    });

    expect(prisma.exercise.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        name: "デッドリフト",
        bodyPart: 3,
        laterality: null,
      },
    });
  });

  it("存在しないワークアウトを更新しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue(null);

    await expect(
      updateWorkout({
        workoutId: "nonexistent",
        userId: TEST_USER_ID,
        workoutData: {
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: [],
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("他のユーザーのワークアウトを更新しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      userId: "other-user",
    });

    await expect(
      updateWorkout({
        workoutId: "workout1",
        userId: TEST_USER_ID,
        workoutData: {
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: [],
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("削除済みのワークアウトを更新しようとした場合、NOT_FOUNDエラーをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue({
      ...mockWorkoutWithRelations,
      deletedAt: new Date(),
    });

    await expect(
      updateWorkout({
        workoutId: "workout1",
        userId: TEST_USER_ID,
        workoutData: {
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: [],
        },
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
  });

  it("存在しないエクササイズIDを指定した場合、VALIDATION_ERRORをスローする", async () => {
    vi.mocked(prisma.workout.findUnique).mockResolvedValue(
      mockWorkoutWithRelations
    );
    vi.mocked(prisma.workoutExercise.deleteMany).mockResolvedValue({
      count: 1,
    });
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

    await expect(
      updateWorkout({
        workoutId: "workout1",
        userId: TEST_USER_ID,
        workoutData: {
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: [
            {
              exercise: { id: "nonexistent" },
              orderIndex: 1,
              workoutSets: [],
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });
});
