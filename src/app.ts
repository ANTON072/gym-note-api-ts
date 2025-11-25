/**
 * Expressアプリケーションの設定
 * ミドルウェアとルートの設定を行う
 */
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import healthRouter from "./routes/health";

const app: Application = express();

// ミドルウェアの設定
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートの設定
app.use("/health", healthRouter);

// エラーハンドリング
app.use(errorHandler);

export default app;
