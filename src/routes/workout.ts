/**
 * Workout routes
 * /api/v1/workouts
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetchWorkouts,
  fetchWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "@/services/workout";
import { workoutRequestSchema } from "@/validators/workout";

const workout = new Hono<AuthEnv>();

// 全ルートに認証を適用
workout.use("*", authMiddleware);

/**
 * GET /api/v1/workouts
 * ワークアウト一覧を取得（ページング対応）
 */
workout.get("/", async (c) => {
  const user = c.get("user");
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  const result = await fetchWorkouts({ userId: user.id, offset });
  return c.json(result);
});

/**
 * GET /api/v1/workouts/:workoutId
 * ワークアウト詳細を取得
 */
workout.get("/:workoutId", async (c) => {
  const user = c.get("user");
  const workoutId = c.req.param("workoutId");

  const result = await fetchWorkoutById({ workoutId, userId: user.id });
  return c.json({ workout: result });
});

/**
 * POST /api/v1/workouts
 * ワークアウトを作成
 */
workout.post("/", zValidator("json", workoutRequestSchema), async (c) => {
  const user = c.get("user");
  const workoutData = c.req.valid("json");

  const result = await createWorkout({ userId: user.id, workoutData });
  return c.json({ workout: result }, 201);
});

/**
 * PUT /api/v1/workouts/:workoutId
 * ワークアウトを更新
 */
workout.put(
  "/:workoutId",
  zValidator("json", workoutRequestSchema),
  async (c) => {
    const user = c.get("user");
    const workoutId = c.req.param("workoutId");
    const workoutData = c.req.valid("json");

    const result = await updateWorkout({
      workoutId,
      userId: user.id,
      workoutData,
    });
    return c.json({ workout: result });
  }
);

/**
 * DELETE /api/v1/workouts/:workoutId
 * ワークアウトを削除
 */
workout.delete("/:workoutId", async (c) => {
  const user = c.get("user");
  const workoutId = c.req.param("workoutId");

  await deleteWorkout({ workoutId, userId: user.id });
  return c.json({ message: "削除しました" });
});

export default workout;
