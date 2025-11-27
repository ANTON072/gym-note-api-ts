/**
 * バリデーションユーティリティ
 * Zodスキーマによるバリデーション処理を共通化
 */
import type { z } from "zod";

import { AppError } from "@/middlewares/errorHandler";

/**
 * リクエストデータをバリデーションし、成功時はデータを返す
 * 失敗時は VALIDATION_ERROR をスローする
 * @param schema - Zodスキーマ
 * @param data - バリデーション対象データ
 * @returns バリデーション済みデータ
 * @throws AppError - バリデーション失敗時
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "入力内容に誤りがあります", {
      fields: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  return result.data;
}
