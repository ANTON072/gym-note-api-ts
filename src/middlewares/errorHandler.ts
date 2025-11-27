/**
 * グローバルエラーハンドラー
 * アプリケーション全体のエラーを一元的に処理する
 */
import { Request, Response, NextFunction } from "express";

/**
 * 内部エラーコード
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/**
 * エラー詳細の型定義
 */
export type ErrorDetails = Record<string, unknown>;

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    public override message: string,
    public details?: ErrorDetails
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
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
    },
  });
}
