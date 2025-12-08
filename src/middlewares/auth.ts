/**
 * Firebase認証ミドルウェア
 * JWTトークンを検証し、ユーザー情報をリクエストに追加する
 */
import { Request, Response, NextFunction } from "express";
import { admin, initializeFirebase } from "@/config/firebase";
import { AppError } from "./errorHandler";
import { findOrCreateUser } from "@/services/user";
import { User } from "@/validators/user";

// Firebase初期化
initializeFirebase();

/**
 * 認証済みリクエストの型定義
 */
export interface AuthenticatedRequest extends Request {
  decodedToken?: admin.auth.DecodedIdToken;
  user?: User;
}

/**
 * 認証ミドルウェア
 * Authorizationヘッダーからトークンを抽出し、検証する
 * @param req - リクエストオブジェクト
 * @param _res - レスポンスオブジェクト
 * @param next - 次のミドルウェア関数
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // 1. Authorizationヘッダーの検証
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "認証トークンが必要です"));
    return;
  }

  // 2. Firebaseトークンの検証
  const token = authHeader.split("Bearer ")[1];
  let decodedToken: admin.auth.DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "無効な認証トークンです"));
    return;
  }
  req.decodedToken = decodedToken;

  // 3. ユーザー情報の取得
  try {
    const user = await findOrCreateUser(decodedToken.uid);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    // DB接続エラーなどは内部エラーとして処理
    next(
      new AppError(500, "INTERNAL_ERROR", "サーバー内部エラーが発生しました")
    );
  }
}
