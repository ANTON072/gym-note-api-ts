/**
 * Firebase認証ミドルウェア
 * JWTトークンを検証し、ユーザー情報をコンテキストに追加する
 */
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { admin, initializeFirebase } from "@/config/firebase";
import { findOrCreateUser } from "@/services/user";
import type { AuthEnv } from "@/types/hono";

// Firebase初期化
initializeFirebase();

/**
 * 認証ミドルウェア
 * Authorizationヘッダーからトークンを抽出し、検証する
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "認証トークンが必要です" });
  }

  const token = authHeader.split("Bearer ")[1];
  let decodedToken: admin.auth.DecodedIdToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch {
    throw new HTTPException(401, { message: "無効な認証トークンです" });
  }

  c.set("decodedToken", decodedToken);

  const user = await findOrCreateUser(decodedToken.uid);
  c.set("user", user);

  await next();
});
