/**
 * ワークアウトテスト用のモックデータ
 */

/** テスト用ユーザーID */
export const TEST_USER_ID = "user123";

/** モックエクササイズ */
export const mockExercise = {
  id: "exercise1",
  userId: TEST_USER_ID,
  name: "ベンチプレス",
  bodyPart: 1,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

/** モックワークアウト（関連データ含む） */
export const mockWorkoutWithRelations = {
  id: "workout1",
  userId: TEST_USER_ID,
  performedStartAt: new Date("2024-01-15T10:00:00Z"),
  performedEndAt: new Date("2024-01-15T11:30:00Z"),
  place: "ジム",
  note: "調子良かった",
  createdAt: new Date("2024-01-15T12:00:00Z"),
  updatedAt: new Date("2024-01-15T12:00:00Z"),
  workoutExercises: [
    {
      id: "we1",
      orderIndex: 1,
      exercise: {
        id: "exercise1",
        name: "ベンチプレス",
        bodyPart: 1,
      },
      workoutSets: [
        { id: "ws1", weight: 60, reps: 10 },
        { id: "ws2", weight: 70, reps: 8 },
      ],
    },
  ],
};

/** モックワークアウト一覧 */
export const mockWorkoutList = [
  mockWorkoutWithRelations,
  {
    id: "workout2",
    userId: TEST_USER_ID,
    performedStartAt: new Date("2024-01-14T09:00:00Z"),
    performedEndAt: null,
    place: "自宅",
    note: null,
    createdAt: new Date("2024-01-14T10:00:00Z"),
    updatedAt: new Date("2024-01-14T10:00:00Z"),
    workoutExercises: [],
  },
];

/** Prisma の include 設定（テストの期待値用） */
export const expectedWorkoutInclude = {
  workoutExercises: {
    include: {
      exercise: true,
      workoutSets: true,
    },
    orderBy: { orderIndex: "asc" },
  },
};
