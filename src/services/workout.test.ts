/**
 * ワークアウトサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";

import { createWorkout } from "./workout";

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

describe("ワークアウトサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWorkout", () => {
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

    const mockCreatedWorkout = {
      id: "workout1",
      userId: "user123",
      performedStartAt: new Date("2024-01-15T10:00:00Z"),
      performedEndAt: new Date("2024-01-15T11:30:00Z"),
      place: "ジム",
      note: "調子良かった",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      workoutExercises: [
        {
          id: "we1",
          orderIndex: 1,
          exercise: {
            id: "exercise1",
            name: "ベンチプレス",
            bodyPart: 1,
            laterality: null,
          },
          workoutSets: [
            { id: "ws1", weight: 60, reps: 10 },
            { id: "ws2", weight: 70, reps: 8 },
          ],
        },
      ],
    };

    it("既存エクササイズを使ってワークアウトを作成できる", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([mockExercise]);
      vi.mocked(prisma.workout.create).mockResolvedValue(mockCreatedWorkout);

      const result = await createWorkout({
        userId: "user123",
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
          userId: "user123",
          deletedAt: null,
        },
      });

      expect(prisma.workout.create).toHaveBeenCalledWith({
        data: {
          userId: "user123",
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
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              workoutSets: true,
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      expect(result).toEqual(mockCreatedWorkout);
    });

    it("新規エクササイズを作成してワークアウトを作成できる", async () => {
      const newExercise = {
        id: "new-exercise1",
        userId: "user123",
        name: "新種目",
        bodyPart: 2,
        laterality: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.exercise.create).mockResolvedValue(newExercise);

      const mockWorkoutWithNewExercise = {
        ...mockCreatedWorkout,
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
        userId: "user123",
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
          userId: "user123",
          name: "新種目",
          bodyPart: 2,
          laterality: null,
        },
      });

      expect(prisma.workout.create).toHaveBeenCalledWith({
        data: {
          userId: "user123",
          performedStartAt: new Date("2024-01-15T10:00:00Z"),
          performedEndAt: null,
          place: null,
          note: null,
          workoutExercises: {
            create: [
              {
                exerciseId: "new-exercise1",
                orderIndex: 1,
                workoutSets: {
                  create: [],
                },
              },
            ],
          },
        },
        include: {
          workoutExercises: {
            include: {
              exercise: true,
              workoutSets: true,
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      expect(result).toEqual(mockWorkoutWithNewExercise);
    });

    it("workoutExercisesが空でもワークアウトを作成できる", async () => {
      const mockWorkoutWithoutExercises = {
        ...mockCreatedWorkout,
        workoutExercises: [],
      };
      vi.mocked(prisma.workout.create).mockResolvedValue(
        mockWorkoutWithoutExercises
      );

      const result = await createWorkout({
        userId: "user123",
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
          userId: "user123",
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

    it("他のユーザーのエクササイズIDを指定した場合、エラーをスローする", async () => {
      vi.mocked(prisma.exercise.findMany).mockResolvedValue([]);

      await expect(
        createWorkout({
          userId: "user123",
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
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });
  });
});
