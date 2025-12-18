/**
 * User routes
 * /api/v1/user
 */
import { Hono } from "hono";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";

const user = new Hono<AuthEnv>();

// 全ルートに認証を適用
user.use("*", authMiddleware);

/**
 * GET /api/v1/user
 * 現在のユーザー情報を取得
 */
user.get("/", (c) => {
  const currentUser = c.get("user");
  return c.json({ user: currentUser });
});

export default user;
