/**
 * Honoアプリケーションの設定
 * ミドルウェアとルートの設定を行う
 */
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import health from "./routes/health";
import exercise from "./routes/exercise";
import { trainingSessionRoutes } from "./routes/training-session";
import { workoutRoutes } from "./routes/workout";

const app = new OpenAPIHono();

// セキュリティスキームを登録
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Firebase Auth のIDトークン",
});

// ミドルウェア
app.use("*", secureHeaders());
app.use("*", cors());

// ルート
app.route("/health", health);
app.route("/api/v1/exercises", exercise);
app.route("/api/v1/training-sessions", trainingSessionRoutes);
app.route("/api/v1/workouts", workoutRoutes);

export default app;
