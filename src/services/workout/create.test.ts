/**
 * ワークアウト作成サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockWorkoutWithRelations,
  expectedWorkoutInclude,
} from "@/__tests__/fixtures/workout";

import { createWorkout } from "./create";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    workout: {
      create: vi.fn(),
    },
    exercise: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("createWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("既存エクササイズを使ってワークアウトを作成できる", async () => {
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);
    vi.mocked(prisma.workout.create).mockResolvedValue(
      mockWorkoutWithRelations
    );

    const result = await createWorkout({
      userId: TEST_USER_ID,
      workoutData: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: new Date("2024-01-15T11:30:00Z"),
        place: "ジム",
        note: "調子良かった",
        workoutExercises: [
          {
            exercise: { id: "exercise1" },
            orderIndex: 1,
            workoutSets: [
              { weight: 60, reps: 10 },
              { weight: 70, reps: 8 },
            ],
          },
        ],
      },
    });

    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["exercise1"] },
        userId: TEST_USER_ID,
        deletedAt: null,
      },
    });

    expect(prisma.workout.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: new Date("2024-01-15T11:30:00Z"),
        place: "ジム",
        note: "調子良かった",
        workoutExercises: {
          create: [
            {
              exerciseId: "exercise1",
              orderIndex: 1,
              workoutSets: {
                create: [
                  { weight: 60, reps: 10 },
                  { weight: 70, reps: 8 },
                ],
              },
            },
          ],
        },
      },
      include: expectedWorkoutInclude,
    });

    expect(result).toEqual(mockWorkoutWithRelations);
  });

  it("新規エクササイズを作成してワークアウトを作成できる", async () => {
    const newExercise = {
      ...mockExercise,
      id: "new-exercise1",
      name: "新種目",
      bodyPart: 2,
    };
    vi.mocked(prisma.exercise.create).mockResolvedValue(newExercise);

    const mockWorkoutWithNewExercise = {
      ...mockWorkoutWithRelations,
      workoutExercises: [
        {
          id: "we1",
          orderIndex: 1,
          exercise: {
            id: "new-exercise1",
            name: "新種目",
            bodyPart: 2,
            laterality: null,
          },
          workoutSets: [],
        },
      ],
    };
    vi.mocked(prisma.workout.create).mockResolvedValue(
      mockWorkoutWithNewExercise
    );

    const result = await createWorkout({
      userId: TEST_USER_ID,
      workoutData: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: null,
        place: null,
        note: null,
        workoutExercises: [
          {
            exercise: { name: "新種目", bodyPart: 2, laterality: null },
            orderIndex: 1,
            workoutSets: [],
          },
        ],
      },
    });

    expect(prisma.exercise.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        name: "新種目",
        bodyPart: 2,
        laterality: null,
      },
    });

    expect(result).toEqual(mockWorkoutWithNewExercise);
  });

  it("workoutExercisesが空でもワークアウトを作成できる", async () => {
    const mockWorkoutWithoutExercises = {
      ...mockWorkoutWithRelations,
      workoutExercises: [],
    };
    vi.mocked(prisma.workout.create).mockResolvedValue(
      mockWorkoutWithoutExercises
    );

    const result = await createWorkout({
      userId: TEST_USER_ID,
      workoutData: {
        performedStartAt: new Date("2024-01-15T10:00:00Z"),
        performedEndAt: null,
        place: null,
        note: null,
        workoutExercises: [],
      },
    });

    expect(prisma.exercise.findMany).not.toHaveBeenCalled();
    expect(prisma.workout.create).toHaveBeenCalled();
    expect(result.workoutExercises).toEqual([]);
  });

  it("存在しないエクササイズIDを指定した場合、エラーをスローする", async () => {
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

    await expect(
      createWorkout({
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
      status: 400,
    });
  });

  it("他のユーザーのエクササイズIDを指定した場合、エラーをスローする", async () => {
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

    await expect(
      createWorkout({
        userId: TEST_USER_ID,
        workoutData: {
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: [
            {
              exercise: { id: "other-users-exercise" },
              orderIndex: 1,
              workoutSets: [],
            },
          ],
        },
      })
    ).rejects.toMatchObject({
      status: 400,
    });
  });
});
