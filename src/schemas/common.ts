/**
 * 共通バリデーションスキーマ
 * エラーレスポンス、ページングなど
 */
import { z } from "@hono/zod-openapi";

/**
 * エラーレスポンススキーマ
 */
export const errorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse");

/**
 * メッセージレスポンススキーマ
 */
export const messageResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("MessageResponse");

/**
 * ページングスキーマ
 */
export const pagingSchema = z
  .object({
    total: z.number().int(),
    offset: z.number().int(),
    limit: z.number().int(),
  })
  .openapi("Paging");

// 型エクスポート
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type Paging = z.infer<typeof pagingSchema>;
