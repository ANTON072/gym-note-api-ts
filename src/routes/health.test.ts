/**
 * ヘルスチェックルートのテスト
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("ヘルスチェック", () => {
  describe("GET /health", () => {
    it("ステータス200とokを返す", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
