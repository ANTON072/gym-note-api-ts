/**
 * ワークアウトサービス
 * トレーニング記録の作成・取得・更新・削除
 */

// 型のエクスポート
export type { WorkoutWithRelations, FetchWorkoutsResult } from "./types";

// 関数のエクスポート
export { createWorkout } from "./create";
export { fetchWorkouts, fetchWorkoutById } from "./fetch";
export { updateWorkout } from "./update";
export { deleteWorkout } from "./delete";
