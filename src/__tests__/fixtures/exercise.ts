/**
 * エクササイズテスト用のモックデータ
 */

/** テスト用ユーザーID */
export const TEST_USER_ID = "user123";

/** モックエクササイズ（単体） */
export const mockExercise = {
  id: "exercise1",
  userId: TEST_USER_ID,
  name: "ベンチプレス",
  bodyPart: 1,
  laterality: null,
  deletedAt: null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

/** モックエクササイズ一覧 */
export const mockExerciseList = [
  mockExercise,
  {
    id: "exercise2",
    userId: TEST_USER_ID,
    name: "スクワット",
    bodyPart: 3,
    laterality: null,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
];
