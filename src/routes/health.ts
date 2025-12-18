/**
 * ヘルスチェックルート
 */
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const healthResponseSchema = z
  .object({
    status: z.string().openapi({ example: "ok" }),
    timestamp: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("HealthResponse");

const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "ヘルスチェック",
  description: "APIサーバーの稼働状況を確認する",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
      description: "サーバー稼働中",
    },
  },
});

const health = new OpenAPIHono();

health.openapi(healthRoute, (c) => {
  return c.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    200
  );
});

export default health;
