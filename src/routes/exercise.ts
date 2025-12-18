/**
 * Exercise routes
 * /api/v1/exercises
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetchExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/services/exercise";
import { exerciseRequestSchema } from "@/validators/exercise";

const exercise = new Hono<AuthEnv>();

// 全ルートに認証を適用
exercise.use("*", authMiddleware);

/**
 * GET /api/v1/exercises
 * Exercise一覧を取得
 */
exercise.get("/", async (c) => {
  const user = c.get("user");
  const name = c.req.query("name");
  const bodyPartParam = c.req.query("bodyPart");
  let bodyPart: number | undefined;
  if (bodyPartParam !== undefined) {
    const parsed = parseInt(bodyPartParam, 10);
    bodyPart = Number.isNaN(parsed) ? undefined : parsed;
  }

  const exercises = await fetchExercises(user.id, { name, bodyPart });
  return c.json({ exercises });
});

/**
 * GET /api/v1/exercises/:exerciseId
 * 指定IDのExerciseを取得
 */
exercise.get("/:exerciseId", async (c) => {
  const user = c.get("user");
  const exerciseId = c.req.param("exerciseId");

  const result = await fetchExerciseById({ exerciseId, userId: user.id });
  return c.json({ exercise: result });
});

/**
 * POST /api/v1/exercises
 * Exerciseを作成
 */
exercise.post("/", zValidator("json", exerciseRequestSchema), async (c) => {
  const user = c.get("user");
  const exerciseData = c.req.valid("json");

  const result = await createExercise({ userId: user.id, exerciseData });
  return c.json({ exercise: result }, 201);
});

/**
 * PUT /api/v1/exercises/:exerciseId
 * Exerciseを更新
 */
exercise.put(
  "/:exerciseId",
  zValidator("json", exerciseRequestSchema),
  async (c) => {
    const user = c.get("user");
    const exerciseId = c.req.param("exerciseId");
    const exerciseData = c.req.valid("json");

    const result = await updateExercise({
      exerciseId,
      userId: user.id,
      exerciseData,
    });
    return c.json({ exercise: result });
  }
);

/**
 * DELETE /api/v1/exercises/:exerciseId
 * Exerciseを削除
 */
exercise.delete("/:exerciseId", async (c) => {
  const user = c.get("user");
  const exerciseId = c.req.param("exerciseId");

  await deleteExercise({ exerciseId, userId: user.id });
  return c.json({ message: "削除しました" });
});

export default exercise;
