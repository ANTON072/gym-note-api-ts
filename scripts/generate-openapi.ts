/**
 * OpenAPI仕様をYAMLファイルとして出力するスクリプト
 * 使用方法: npx tsx scripts/generate-openapi.ts
 */
import { writeFileSync } from "fs";
import { stringify } from "yaml";
import app from "../src/app";

const spec = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: {
    title: "Gym Note API",
    version: "1.0.0",
    description: "筋トレのログを記録するノートアプリの API",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "開発環境",
    },
  ],
  tags: [
    { name: "Health", description: "ヘルスチェック" },
    { name: "Exercise", description: "種目の管理" },
    { name: "TrainingSession", description: "トレーニングセッションの管理" },
    { name: "Workout", description: "ワークアウトの管理" },
  ],
});

const yamlContent = stringify(spec);
const outputPath = "./docs/openapi.yaml";

writeFileSync(outputPath, yamlContent, "utf-8");

console.log(`OpenAPI spec generated: ${outputPath}`);
