# gym-note-api-ts 機能追加スキル

## 概要

このスキルは、gym-note-api-ts プロジェクトに新しいAPIエンドポイントを追加する際の手順とテンプレートを提供します。

## 機能追加時の生成物チェックリスト

新機能「{Feature}」を追加する場合、以下のファイルを作成・更新します：

```
src/
├── schemas/{feature}.ts           # ✅ Zodスキーマ（必須）
├── routes/{feature}.ts            # ✅ ルート定義（必須）
├── services/{feature}/            # ✅ サービス層（必須）
│   ├── index.ts                   #    re-export
│   ├── types.ts                   #    共通型・ヘルパー
│   ├── fetch.ts                   #    取得ロジック
│   ├── fetch.test.ts              #    テスト（必須）
│   ├── create.ts                  #    作成ロジック
│   ├── create.test.ts             #    テスト（必須）
│   ├── update.ts                  #    更新ロジック
│   ├── update.test.ts             #    テスト（必須）
│   ├── delete.ts                  #    削除ロジック
│   └── delete.test.ts             #    テスト（必須）
├── __tests__/fixtures/{feature}.ts # ✅ テスト用モックデータ
├── types/{feature}.ts             # 必要に応じてEnum等
└── app.ts                         # ✅ ルート登録（更新）

docs/
└── openapi.yaml                   # npm run openapi:generate で自動更新
```

---

## Step 1: スキーマ定義（src/schemas/{feature}.ts）

### テンプレート

```typescript
/**
 * {Feature}のバリデーションスキーマ
 */
import { z } from "@hono/zod-openapi";

/**
 * {Feature}スキーマ（レスポンス用）
 */
export const {feature}Schema = z
  .object({
    id: z.string().openapi({ example: "clxyz123456789" }),
    // フィールド定義
    createdAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.iso.datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("{Feature}");

/**
 * {Feature}一覧レスポンススキーマ
 */
export const {feature}ListResponseSchema = z
  .object({
    {features}: z.array({feature}Schema),
  })
  .openapi("{Feature}ListResponse");

/**
 * {Feature}詳細レスポンススキーマ
 */
export const {feature}DetailResponseSchema = z
  .object({
    {feature}: {feature}Schema,
  })
  .openapi("{Feature}DetailResponse");

/**
 * {Feature}作成/更新リクエストスキーマ
 */
export const {feature}RequestSchema = z
  .object({
    // リクエストフィールド
  })
  .openapi("{Feature}Request");

/**
 * {Feature}IDパスパラメータスキーマ
 */
export const {feature}IdParamSchema = z.object({
  {feature}Id: z.string().openapi({ param: { name: "{feature}Id", in: "path" } }),
});

// 型エクスポート
export type {Feature} = z.infer<typeof {feature}Schema>;
export type {Feature}Request = z.infer<typeof {feature}RequestSchema>;

/** サービス層で使用する内部型（日付は Date オブジェクト） */
export type {Feature}Internal = Omit<{Feature}, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};
```

### 重要ルール

- `@hono/zod-openapi` の `z` を使用
- datetime は `z.iso.datetime()` を使用
- レスポンス用とリクエスト用を分ける
- Internal型を定義（サービス層はDateオブジェクト、API層はISO文字列）

---

## Step 2: サービス層（src/services/{feature}/）

### index.ts

```typescript
/**
 * {Feature}サービス
 * {説明}
 */

export { fetch{Features}, fetch{Feature}ById } from "./fetch";
export { create{Feature} } from "./create";
export { update{Feature} } from "./update";
export { delete{Feature} } from "./delete";
```

### types.ts（共通ヘルパー）

```typescript
/**
 * {Feature}サービス共通の型・ヘルパー関数
 */
import { Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

import { prisma } from "@/config/database";
import type { {Feature}Internal } from "@/schemas/{feature}";

/**
 * {Feature}が存在し、指定ユーザーのものかを確認する
 */
export async function find{Feature}ForUser(
  {feature}Id: string,
  userId: string
): Promise<{Feature}Internal> {
  const {feature} = await prisma.{feature}.findUnique({
    where: { id: {feature}Id },
  });

  if (!{feature}) {
    throw new HTTPException(404, { message: "{Feature}が見つかりません" });
  }

  if ({feature}.userId !== userId) {
    throw new HTTPException(404, { message: "{Feature}が見つかりません" });
  }

  return {feature};
}
```

### create.ts

```typescript
/**
 * {Feature}作成サービス
 */
import { prisma } from "@/config/database";
import type { {Feature}Internal, {Feature}Request } from "@/schemas/{feature}";

/**
 * {Feature}を作成する
 */
export async function create{Feature}({
  userId,
  {feature}Data,
}: {
  userId: string;
  {feature}Data: {Feature}Request;
}): Promise<{Feature}Internal> {
  const {feature} = await prisma.{feature}.create({
    data: {
      userId,
      // フィールドマッピング
    },
  });

  return {
    id: {feature}.id,
    // フィールドマッピング
    createdAt: {feature}.createdAt,
    updatedAt: {feature}.updatedAt,
  };
}
```

### 重要ルール

- エラーは `HTTPException` をスロー
- ビジネスルールの検証はサービス層で実施
- 戻り値は `{Feature}Internal` 型（Date オブジェクト）

---

## Step 3: テスト（src/services/{feature}/\*.test.ts）

### テンプレート

```typescript
/**
 * {Feature}作成サービスのテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

import { prisma } from "@/config/database";
import { TEST_USER_ID, mock{Feature} } from "@/__tests__/fixtures/{feature}";

import { create{Feature} } from "./create";

// Prismaのモック
vi.mock("@/config/database", () => ({
  prisma: {
    {feature}: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("create{Feature}", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("{Feature}を作成して返す", async () => {
    vi.mocked(prisma.{feature}.create).mockResolvedValue(mock{Feature});

    const result = await create{Feature}({
      userId: TEST_USER_ID,
      {feature}Data: {
        // テストデータ
      },
    });

    expect(prisma.{feature}.create).toHaveBeenCalledWith({
      data: {
        userId: TEST_USER_ID,
        // 期待するデータ
      },
    });
    expect(result).toEqual({
      id: mock{Feature}.id,
      // 期待するフィールド
    });
  });

  it("存在しない場合、404エラーをスローする", async () => {
    vi.mocked(prisma.{feature}.findUnique).mockResolvedValue(null);

    await expect(
      // 関数呼び出し
    ).rejects.toMatchObject({
      status: 404,
      message: "{Feature}が見つかりません",
    });
  });
});
```

### テスト用フィクスチャ（src/**tests**/fixtures/{feature}.ts）

```typescript
/**
 * {Feature}テスト用のモックデータ
 */

/** テスト用ユーザーID */
export const TEST_USER_ID = "user123";

/** モック{Feature} */
export const mock{Feature} = {
  id: "{feature}1",
  userId: TEST_USER_ID,
  // フィールド
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

/** モック{Feature}一覧 */
export const mock{Feature}List = [
  mock{Feature},
  {
    id: "{feature}2",
    userId: TEST_USER_ID,
    // フィールド
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
];
```

### 重要ルール

- describe は日本語で記述
- 各サービス関数に対して必ずテストを作成
- Prismaはモックして外部依存を排除
- エラーケースも必ずテスト

---

## Step 4: ルート定義（src/routes/{feature}.ts）

### テンプレート

```typescript
/**
 * {Feature} routes
 * /api/v1/{features}
 */
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetch{Features},
  fetch{Feature}ById,
  create{Feature},
  update{Feature},
  delete{Feature},
} from "@/services/{feature}";
import {
  {feature}ListResponseSchema,
  {feature}DetailResponseSchema,
  {feature}RequestSchema,
  {feature}IdParamSchema,
} from "@/schemas/{feature}";
import { errorResponseSchema, messageResponseSchema } from "@/schemas/common";

/**
 * {Feature} を API レスポンス形式に変換
 */
const serialize{Feature} = ({feature}: {
  id: string;
  // フィールド
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: {feature}.id,
  // フィールド
  createdAt: {feature}.createdAt.toISOString(),
  updatedAt: {feature}.updatedAt.toISOString(),
});

const {feature}Routes = new OpenAPIHono<AuthEnv>();

// 全ルートに認証を適用
{feature}Routes.use("*", authMiddleware);

/**
 * GET /api/v1/{features}
 * {Feature}一覧を取得
 */
const list{Features}Route = createRoute({
  method: "get",
  path: "/",
  tags: ["{Feature}"],
  summary: "{Feature}一覧を取得",
  description: "{Feature}一覧を取得する",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: {feature}ListResponseSchema,
        },
      },
      description: "{Feature}一覧",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "認証エラー",
    },
  },
});

{feature}Routes.openapi(list{Features}Route, async (c) => {
  const user = c.get("user");
  const {features} = await fetch{Features}(user.id);
  return c.json({ {features}: {features}.map(serialize{Feature}) }, 200);
});

// POST, GET/:id, PUT/:id, DELETE/:id も同様に定義...

export { {feature}Routes };
```

### 重要ルール

- `createRoute` でルート定義
- `security: [{ Bearer: [] }]` で認証必須を明示
- レスポンスには成功・エラーの両方を定義
- serialize関数でDate→ISO文字列変換

---

## Step 5: ルート登録（src/app.ts）

```typescript
// 追加
import { {feature}Routes } from "./routes/{feature}";

// ルート追加
app.route("/api/v1/{features}", {feature}Routes);
```

---

## Step 6: 最終チェック

```bash
# 1. テストが通ることを確認
npm run test

# 2. Lintエラーがないことを確認
npm run lint

# 3. ビルドが通ることを確認
npm run build

# 4. OpenAPI仕様を更新
npm run openapi:generate
```

---

## 命名規則まとめ

| 対象         | 命名規則         | 例                      |
| ------------ | ---------------- | ----------------------- |
| ファイル名   | kebab-case       | `training-session.ts`   |
| 変数名       | camelCase        | `trainingSession`       |
| 型名         | PascalCase       | `TrainingSession`       |
| サービス関数 | camelCase動詞    | `fetchTrainingSessions` |
| DBテーブル   | snake_case複数形 | `training_sessions`     |
| DBカラム     | snake_case       | `performed_start_at`    |

---

## よくあるパターン

### 親リソースに紐づくサブリソース

例: TrainingSession → Workout

```typescript
// URLパターン
/api/v1/training-sessions/:sessionId/workouts

// パラメータスキーマ
export const workoutParamsSchema = z.object({
  sessionId: z.string().openapi({ param: { name: "sessionId", in: "path" } }),
  workoutId: z.string().openapi({ param: { name: "workoutId", in: "path" } }).optional(),
});
```

### Enumの扱い

```typescript
// src/types/{feature}.ts
export const ExerciseType = {
  STRENGTH: 0,
  CARDIO: 1,
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];
```

### 並び順の管理

```typescript
// orderIndex を持つ場合は reorder サービスも作成
export { reorder{Features} } from "./reorder";
```
