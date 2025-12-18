/**
 * アプリケーションのエントリーポイント
 * Honoサーバーを起動する
 */
import "dotenv/config";
import { serve } from "@hono/node-server";

import app from "./app";
import { config } from "./config/env";

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`Server is running on port ${info.port}`);
  }
);
