/**
 * Firebase認証ミドルウェア
 * JWTトークンを検証し、ユーザー情報をリクエストに追加する
 */
import { Request, Response, NextFunction } from "express";
import { admin, initializeFirebase } from "@/config/firebase";
import { AppError } from "./errorHandler";

// Firebase初期化
initializeFirebase();

/**
 * 認証済みリクエストの型定義
 */
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
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
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "認証トークンが必要です");
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "UNAUTHORIZED", "無効な認証トークンです"));
  }
}
