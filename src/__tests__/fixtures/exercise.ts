/**
 * エクササイズテスト用のモックデータ
 */

/** テスト用ユーザーID */
export const TEST_USER_ID = "user123";

/** モックエクササイズ（カスタム種目） */
export const mockExercise = {
  id: "exercise1",
  userId: TEST_USER_ID,
  isPreset: false,
  name: "ベンチプレス",
  bodyPart: 1,
  laterality: null,
  deletedAt: null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

/** モックプリセット種目 */
export const mockPresetExercise = {
  id: "preset-exercise1",
  userId: null,
  isPreset: true,
  name: "プリセットベンチプレス",
  bodyPart: 0,
  laterality: 0,
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
    isPreset: false,
    name: "スクワット",
    bodyPart: 3,
    laterality: null,
    deletedAt: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
];
