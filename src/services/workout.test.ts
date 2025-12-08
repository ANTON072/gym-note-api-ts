/**
 * ワークアウトサービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "@/config/database";
import {
  TEST_USER_ID,
  mockExercise,
  mockWorkoutWithRelations,
  mockWorkoutList,
  expectedWorkoutInclude,
} from "@/__tests__/fixtures/workout";

import { createWorkout, fetchWorkouts, fetchWorkoutById } from "./workout";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    workout: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
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
        statusCode: 400,
        code: "VALIDATION_ERROR",
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
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("fetchWorkouts", () => {
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
      vi.mocked(prisma.workout.findMany).mockResolvedValue([
        mockWorkoutList[1],
      ]);
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
        statusCode: 404,
        code: "NOT_FOUND",
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
        statusCode: 404,
        code: "NOT_FOUND",
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
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });
});
