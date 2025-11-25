/**
 * Vitest設定ファイル
 * テストフレームワークの設定を定義
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "dist", "src/generated"],
    },
  },
});
