/**
 * ヘルスチェックルート
 */
import { Hono } from "hono";

const health = new Hono();

/**
 * GET /health
 * ヘルスチェック
 */
health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default health;
