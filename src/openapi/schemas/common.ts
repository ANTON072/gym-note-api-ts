/**
 * OpenAPI 共通スキーマ定義
 * エラーレスポンス、ページングなど共通で使用するスキーマ
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
 * バリデーションエラーレスポンススキーマ
 */
export const validationErrorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      issues: z.array(
        z.object({
          code: z.string(),
          expected: z.string().optional(),
          received: z.string().optional(),
          path: z.array(z.union([z.string(), z.number()])),
          message: z.string(),
        })
      ),
      name: z.literal("ZodError"),
    }),
  })
  .openapi("ValidationErrorResponse");

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

/**
 * メッセージレスポンススキーマ
 */
export const messageResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("MessageResponse");
