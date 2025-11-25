/**
 * グローバルエラーハンドラー
 * アプリケーション全体のエラーを一元的に処理する
 */
import { Request, Response, NextFunction } from "express";

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * エラーハンドリングミドルウェア
 * @param err - エラーオブジェクト
 * @param _req - リクエストオブジェクト
 * @param res - レスポンスオブジェクト
 * @param _next - 次のミドルウェア関数
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: "Internal Server Error",
    },
  });
}
