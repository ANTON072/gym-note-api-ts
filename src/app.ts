/**
 * Honoアプリケーションの設定
 * ミドルウェアとルートの設定を行う
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

import health from "./routes/health";
import exercise from "./routes/exercise";
import workout from "./routes/workout";

const app = new Hono();

// ミドルウェア
app.use("*", secureHeaders());
app.use("*", cors());

// ルート
app.route("/health", health);
app.route("/api/v1/exercises", exercise);
app.route("/api/v1/workouts", workout);

export default app;
