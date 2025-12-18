# Express → Hono 移行計画

> **ステータス: 完了** (2024年12月)
>
> この移行計画は完了しました。以下は移行時の参考資料として残しています。

## 概要

Express 5.1.0 から Hono への移行計画。Node.js 環境（さくらVPS）でのホスティングは継続。

## 移行のメリット

- **パフォーマンス向上**: Hono は Express より軽量・高速
- **TypeScript 親和性**: 型サポートが優れている
- **Zod 統合**: `@hono/zod-validator` でバリデーションをより統合的に扱える
- **モダンな API**: async/await がネイティブにサポートされ、try-catch が不要に
- **シンプルな構成**: Controller 層を廃止し、ルートとハンドラーを統合
- **組み込みエラーハンドリング**: `HTTPException` による統一的なエラー処理

## 変更不要なファイル（そのまま使える）

| ディレクトリ/ファイル     | 理由                                           |
| ------------------------- | ---------------------------------------------- |
| `validators/**/*`         | Zod スキーマはそのまま使える                   |
| `config/database.ts`      | Prisma クライアントは変更なし                  |
| `config/env.ts`           | 環境変数設定は変更なし                         |
| `config/firebase.ts`      | firebase-admin は Node.js 環境でそのまま使える |
| `prisma/**/*`             | スキーマ・マイグレーションは変更なし           |
| `__tests__/fixtures/**/*` | テスト用モックデータは変更なし                 |

## 削除するファイル

| ファイル                          | 理由                                 |
| --------------------------------- | ------------------------------------ |
| `src/controllers/user.ts`         | routes に統合                        |
| `src/controllers/exercise.ts`     | routes に統合                        |
| `src/controllers/workout.ts`      | routes に統合                        |
| `src/utils/validation.ts`         | `@hono/zod-validator` に置き換え     |
| `src/middlewares/errorHandler.ts` | `HTTPException` の自動処理に置き換え |
| `src/routes/health.test.ts`       | テストは services のみに限定         |
| `src/middlewares/auth.test.ts`    | テストは services のみに限定         |

## 移行が必要なファイル

### Phase 1: 基盤セットアップ

#### 1.1 パッケージの更新

**削除するパッケージ:**

```bash
npm uninstall express cors helmet @types/express @types/cors supertest @types/supertest
```

**追加するパッケージ:**

```bash
npm install hono @hono/node-server @hono/zod-validator
```

#### 1.2 型定義の作成

**`src/types/hono.ts`（新規作成）**

```typescript
import type { User } from "@/validators/user";
import type { admin } from "@/config/firebase";

/**
 * 認証済みルート用の環境型定義
 * c.get("user") で User オブジェクトを取得可能
 */
export type AuthEnv = {
  Variables: {
    user: User;
    decodedToken: admin.auth.DecodedIdToken;
  };
};
```

### Phase 2: 認証ミドルウェアの移行

**`src/middlewares/auth.ts`**

```typescript
/**
 * Firebase認証ミドルウェア
 * JWTトークンを検証し、ユーザー情報をコンテキストに追加する
 */
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { admin, initializeFirebase } from "@/config/firebase";
import { findOrCreateUser } from "@/services/user";
import type { AuthEnv } from "@/types/hono";

// Firebase初期化
initializeFirebase();

/**
 * 認証ミドルウェア
 */
export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "認証トークンが必要です" });
  }

  const token = authHeader.split("Bearer ")[1];
  let decodedToken: admin.auth.DecodedIdToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch {
    throw new HTTPException(401, { message: "無効な認証トークンです" });
  }

  c.set("decodedToken", decodedToken);

  const user = await findOrCreateUser(decodedToken.uid);
  c.set("user", user);

  await next();
});
```

### Phase 3: Services層の移行

`AppError` → `HTTPException` に置き換え。

**変更対象ファイル:**

- `src/services/exercise/types.ts`
- `src/services/workout/create.ts`
- `src/services/workout/fetch.ts`
- `src/services/workout/update.ts`
- `src/services/workout/delete.ts`

**変更例:**

```typescript
// Before
import { AppError } from "@/middlewares/errorHandler";
throw new AppError(404, "NOT_FOUND", "ワークアウトが見つかりません");
throw new AppError(409, "CONFLICT", "このエクササイズ名は既に登録されています");

// After
import { HTTPException } from "hono/http-exception";
throw new HTTPException(404, { message: "ワークアウトが見つかりません" });
throw new HTTPException(409, {
  message: "このエクササイズ名は既に登録されています",
});
```

### Phase 4: アプリケーション設定の移行

#### 4.1 メインアプリケーション

**`src/app.ts`**

```typescript
/**
 * Honoアプリケーションの設定
 * ミドルウェアとルートの設定を行う
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import health from "./routes/health";
import user from "./routes/user";
import exercise from "./routes/exercise";
import workout from "./routes/workout";

const app = new Hono();

// ミドルウェア
app.use("*", secureHeaders());
app.use("*", cors());

// ルート
app.route("/health", health);
app.route("/api/v1/user", user);
app.route("/api/v1/exercises", exercise);
app.route("/api/v1/workouts", workout);

export default app;
```

**注意:** `app.onError()` は不要。`HTTPException` は自動的に処理される。

#### 4.2 エントリーポイント

**`src/index.ts`**

```typescript
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
```

### Phase 5: ルートとハンドラーの統合

#### 5.1 Health ルート

**`src/routes/health.ts`**

```typescript
/**
 * ヘルスチェックルート
 */
import { Hono } from "hono";

const health = new Hono();

/**
 * GET /health
 * ヘルスチェック
 */
health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default health;
```

#### 5.2 User ルート

**`src/routes/user.ts`**

```typescript
/**
 * User routes
 * /api/v1/user
 */
import { Hono } from "hono";
import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";

const user = new Hono<AuthEnv>();

// 全ルートに認証を適用
user.use("*", authMiddleware);

/**
 * GET /api/v1/user
 * 現在のユーザー情報を取得
 */
user.get("/", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default user;
```

#### 5.3 Exercise ルート

**`src/routes/exercise.ts`**

```typescript
/**
 * Exercise routes
 * /api/v1/exercises
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetchExercises,
  fetchExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/services/exercise";
import { exerciseRequestSchema } from "@/validators/exercise";

const exercise = new Hono<AuthEnv>();

// 全ルートに認証を適用
exercise.use("*", authMiddleware);

/**
 * GET /api/v1/exercises
 * Exercise一覧を取得
 */
exercise.get("/", async (c) => {
  const user = c.get("user");
  const name = c.req.query("name");
  const bodyPartParam = c.req.query("bodyPart");
  const bodyPart =
    bodyPartParam !== undefined ? parseInt(bodyPartParam, 10) : undefined;

  const exercises = await fetchExercises(user.id, { name, bodyPart });
  return c.json({ exercises });
});

/**
 * GET /api/v1/exercises/:exerciseId
 * 指定IDのExerciseを取得
 */
exercise.get("/:exerciseId", async (c) => {
  const user = c.get("user");
  const exerciseId = c.req.param("exerciseId");

  const result = await fetchExerciseById({ exerciseId, userId: user.id });
  return c.json({ exercise: result });
});

/**
 * POST /api/v1/exercises
 * Exerciseを作成
 */
exercise.post("/", zValidator("json", exerciseRequestSchema), async (c) => {
  const user = c.get("user");
  const exerciseData = c.req.valid("json");

  const result = await createExercise({ userId: user.id, exerciseData });
  return c.json({ exercise: result }, 201);
});

/**
 * PUT /api/v1/exercises/:exerciseId
 * Exerciseを更新
 */
exercise.put(
  "/:exerciseId",
  zValidator("json", exerciseRequestSchema),
  async (c) => {
    const user = c.get("user");
    const exerciseId = c.req.param("exerciseId");
    const exerciseData = c.req.valid("json");

    const result = await updateExercise({
      exerciseId,
      userId: user.id,
      exerciseData,
    });
    return c.json({ exercise: result });
  }
);

/**
 * DELETE /api/v1/exercises/:exerciseId
 * Exerciseを削除
 */
exercise.delete("/:exerciseId", async (c) => {
  const user = c.get("user");
  const exerciseId = c.req.param("exerciseId");

  await deleteExercise({ exerciseId, userId: user.id });
  return c.json({ message: "削除しました" });
});

export default exercise;
```

#### 5.4 Workout ルート

**`src/routes/workout.ts`**

```typescript
/**
 * Workout routes
 * /api/v1/workouts
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AuthEnv } from "@/types/hono";
import { authMiddleware } from "@/middlewares/auth";
import {
  fetchWorkouts,
  fetchWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "@/services/workout";
import { workoutRequestSchema } from "@/validators/workout";

const workout = new Hono<AuthEnv>();

// 全ルートに認証を適用
workout.use("*", authMiddleware);

/**
 * GET /api/v1/workouts
 * ワークアウト一覧を取得（ページング対応）
 */
workout.get("/", async (c) => {
  const user = c.get("user");
  const offsetParam = c.req.query("offset");
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  const result = await fetchWorkouts({ userId: user.id, offset });
  return c.json(result);
});

/**
 * GET /api/v1/workouts/:workoutId
 * ワークアウト詳細を取得
 */
workout.get("/:workoutId", async (c) => {
  const user = c.get("user");
  const workoutId = c.req.param("workoutId");

  const result = await fetchWorkoutById({ workoutId, userId: user.id });
  return c.json({ workout: result });
});

/**
 * POST /api/v1/workouts
 * ワークアウトを作成
 */
workout.post("/", zValidator("json", workoutRequestSchema), async (c) => {
  const user = c.get("user");
  const workoutData = c.req.valid("json");

  const result = await createWorkout({ userId: user.id, workoutData });
  return c.json({ workout: result }, 201);
});

/**
 * PUT /api/v1/workouts/:workoutId
 * ワークアウトを更新
 */
workout.put(
  "/:workoutId",
  zValidator("json", workoutRequestSchema),
  async (c) => {
    const user = c.get("user");
    const workoutId = c.req.param("workoutId");
    const workoutData = c.req.valid("json");

    const result = await updateWorkout({
      workoutId,
      userId: user.id,
      workoutData,
    });
    return c.json({ workout: result });
  }
);

/**
 * DELETE /api/v1/workouts/:workoutId
 * ワークアウトを削除
 */
workout.delete("/:workoutId", async (c) => {
  const user = c.get("user");
  const workoutId = c.req.param("workoutId");

  await deleteWorkout({ workoutId, userId: user.id });
  return c.json({ message: "削除しました" });
});

export default workout;
```

### Phase 6: テストファイルの整理

**方針:** テストは services 層のみに限定する。

**削除するテスト:**

- `src/routes/health.test.ts`
- `src/middlewares/auth.test.ts`

**残すテスト（変更なし）:**

- `src/services/user.test.ts`
- `src/services/exercise/*.test.ts`
- `src/services/workout/*.test.ts`

services 層のテストは HTTP 層に依存しないため、移行による変更は不要。

## 移行作業の順序

1. **パッケージのインストール・削除**
2. **`src/types/hono.ts`** - 型定義の作成
3. **`src/middlewares/auth.ts`** - Hono ミドルウェア形式 + HTTPException
4. **`src/services/**`\*\* - AppError → HTTPException に置き換え
5. **`src/routes/health.ts`** - 最もシンプルなルートから
6. **`src/routes/user.ts`**
7. **`src/routes/exercise.ts`** - ハンドラーを統合
8. **`src/routes/workout.ts`** - ハンドラーを統合
9. **`src/app.ts`** - メインアプリケーション
10. **`src/index.ts`** - エントリーポイント
11. **不要ファイル削除** - controllers/, utils/validation.ts, errorHandler.ts
12. **テストファイル削除** - health.test.ts, auth.test.ts
13. **動作確認・デバッグ**

## プロジェクト構造（移行後）

```text
gym-note-api-ts/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── __tests__/
│   │   └── fixtures/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── firebase.ts
│   ├── middlewares/
│   │   └── auth.ts
│   ├── routes/                  # ハンドラーを統合
│   │   ├── health.ts
│   │   ├── user.ts
│   │   ├── exercise.ts
│   │   └── workout.ts
│   ├── services/                # HTTPException を使用
│   │   ├── user.ts
│   │   ├── exercise/
│   │   └── workout/
│   ├── types/
│   │   ├── exercise.ts
│   │   └── hono.ts              # 新規追加
│   ├── validators/              # 変更なし
│   ├── app.ts
│   └── index.ts
└── ...
```

## 注意点

- `firebase-admin` は Node.js 環境でのみ動作するため、`@hono/node-server` を使用
- Edge 環境へのデプロイは不可（さくらVPS なので問題なし）
- `HTTPException` は自動的に適切なレスポンスを返す（カスタムエラーハンドラー不要）

## API レスポンスの変更点

### HTTPException エラー

**Before（Express + AppError）:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "ワークアウトが見つかりません"
  }
}
```

**After（Hono + HTTPException）:**

```json
{
  "message": "ワークアウトが見つかりません"
}
```

### バリデーションエラー

**Before（Express + validateRequest）:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "fields": [{ "field": "name", "message": "名前は必須です" }]
    }
  }
}
```

**After（Hono + zValidator）:**

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["name"],
        "message": "Required"
      }
    ],
    "name": "ZodError"
  }
}
```

フロントエンド側でエラーハンドリングの調整が必要。

## 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Hono Node.js Adapter](https://hono.dev/docs/getting-started/nodejs)
- [@hono/zod-validator](https://hono.dev/docs/guides/validation#with-zod)
- [HTTPException](https://hono.dev/docs/api/exception)
