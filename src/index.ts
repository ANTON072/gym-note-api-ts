/**
 * アプリケーションのエントリーポイント
 * Expressサーバーを起動し、ミドルウェアとルートを設定する
 */
import "dotenv/config";
import app from "./app";
import { config } from "./config/env";

const port = config.port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
