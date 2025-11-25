/**
 * 環境変数の設定
 * アプリケーション全体で使用する設定値を管理する
 */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error("Invalid environment variables:", envParsed.error.format());
  process.exit(1);
}

export const config = {
  nodeEnv: envParsed.data.NODE_ENV,
  port: parseInt(envParsed.data.PORT, 10),
  databaseUrl: envParsed.data.DATABASE_URL,
  firebase: {
    projectId: envParsed.data.FIREBASE_PROJECT_ID,
    privateKey: envParsed.data.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: envParsed.data.FIREBASE_CLIENT_EMAIL,
  },
};
