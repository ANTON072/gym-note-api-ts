/**
 * ヘルスチェックルート
 * アプリケーションの稼働状態を確認するためのエンドポイント
 */
import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /health
 * アプリケーションのヘルスステータスを返す
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
