# Gym Note Api - Claude Code ガイド

## プロジェクト概要

**Gym Note Api**は、筋トレのログを記録するノートアプリの API です。Node.js / Hono / TypeScript で構築されています。

- **アプリ名:** Gym Note Api
- **主要機能:** 筋トレのログを登録・一覧・編集・削除

## 技術スタック

- **フレームワーク:** Hono / TypeScript
- **サーバー:** @hono/node-server（Node.js環境）
- **データベース:** MariaDB
- **ORM:** Prisma
- **バリデーション:** Zod + @hono/zod-validator

## 認証システム

- **プロバイダー:** Firebase Auth

## プロジェクト構造

```text
gym-note-api-ts/
├── prisma/
│   └── schema.prisma        # DBスキーマ定義
├── src/
│   ├── __tests__/
│   │   └── fixtures/        # テスト用モックデータ
│   ├── config/
│   │   ├── database.ts      # Prismaクライアント
│   │   ├── env.ts           # 環境変数（Zodバリデーション）
│   │   └── firebase.ts      # Firebase Admin SDK初期化
│   ├── middlewares/
│   │   └── auth.ts          # Firebase認証ミドルウェア
│   ├── routes/              # ルート定義（ハンドラー統合）
│   │   ├── health.ts
│   │   ├── exercise.ts
│   │   ├── training-session.ts  # トレーニングセッション + ワークアウト追加/削除/並び替え
│   │   └── workout.ts           # ワークアウト更新（メモ + セット差分更新）
│   ├── services/            # ビジネスロジック
│   │   ├── user.ts          # 単一ファイル形式
│   │   ├── exercise/        # ディレクトリ形式
│   │   │   ├── index.ts     # re-export
│   │   │   ├── types.ts     # 共通の型・定数
│   │   │   ├── create.ts    # 作成処理
│   │   │   ├── fetch.ts     # 取得処理
│   │   │   ├── update.ts    # 更新処理
│   │   │   └── delete.ts    # 削除処理
│   │   ├── training-session/ # ディレクトリ形式
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── create.ts
│   │   │   ├── fetch.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   └── workout/         # ディレクトリ形式
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── add.ts       # ワークアウト追加
│   │       ├── update.ts    # メモ + セット差分更新
│   │       ├── delete.ts    # ワークアウト削除
│   │       └── reorder.ts   # 並び替え
│   ├── types/               # 型定義
│   │   ├── exercise.ts
│   │   └── hono.ts          # Hono用型定義（AuthEnv）
│   ├── validators/          # Zodスキーマ
│   ├── app.ts               # Honoアプリ設定
│   └── index.ts             # エントリーポイント
├── .env.example             # 環境変数テンプレート
├── eslint.config.mjs        # ESLint設定
├── tsconfig.json            # TypeScript設定
└── vitest.config.ts         # Vitest設定
```

### サービスのファイル構成

- **小規模なサービス:** 単一ファイル（例: `services/user.ts`）
- **大規模なサービス:** ディレクトリに分割（例: `services/workout/`）
  - `index.ts` で関数をre-exportし、インポート側は `@/services/workout` で統一

## 利用可能なコマンド

| コマンド                  | 説明                          |
| ------------------------- | ----------------------------- |
| `npm run dev`             | 開発サーバー起動（tsx watch） |
| `npm run build`           | TypeScriptビルド              |
| `npm run test`            | テスト実行                    |
| `npm run test:watch`      | テスト監視モード              |
| `npm run lint`            | ESLint実行                    |
| `npm run format`          | Prettier実行                  |
| `npm run prisma:generate` | Prismaクライアント生成        |
| `npm run prisma:migrate`  | マイグレーション実行          |

## ローカル開発環境のセットアップ

1. `.env.example`をコピーして`.env`を作成
2. `docker compose up -d`でMariaDBコンテナを起動
3. `npm run prisma:migrate`でマイグレーション実行
4. `npm run dev`で開発サーバー起動

## テストガイドライン

- **テスト対象:** API エンドポイント、データベース操作、ビジネスロジック
- **環境:** Node.js + Vitest

## コード生成規約

- **言語:** TypeScript

### Prisma 命名規則

- **モデル名:** PascalCase 単数形（例: `User`, `Workout`）
- **フィールド名:** camelCase（例: `firebaseUid`, `createdAt`）
- **DBテーブル名:** snake_case 複数形（例: `users`, `workouts`）→ `@@map("テーブル名")` で指定
- **DBカラム名:** snake_case（例: `firebase_uid`, `created_at`）→ `@map("カラム名")` で指定

```prisma
model User {
  id          String   @id @default(cuid())
  firebaseUid String   @unique @map("firebase_uid")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Enum の扱い

- Prisma enum は使わず、`Int` 型で数値として保存する
- TypeScript 側で enum を定義して変換・管理する

### Zod スキーマ（v4）

- トップレベルのフォーマット関数を使用する（`z.string().email()` ではなく `z.email()`）

```typescript
// 推奨
z.email();
z.url();

// 非推奨
z.string().email();
z.string().url();
```

### コメント

- 各ファイルの冒頭には日本語のコメントで仕様を記述する

### Routes / Service の命名規則

- **Service 関数:** シンプルな名前を使用（例: `fetchExercises`, `createExercise`）
- **Routes:** ルートとハンドラーを統合（Hono推奨スタイル）

### レイヤーの責務

| レイヤー | 責務                                        |
| -------- | ------------------------------------------- |
| Routes   | ルート定義、ハンドラー、バリデーション      |
| Service  | ビジネスロジック、DB 操作、外部サービス連携 |

- **バリデーション:** Routes で `zValidator()` を使用
- **ビジネスルールの検証:** Service で実施（重複チェック、権限、整合性など）
- **エラーハンドリング:** Service で `HTTPException` をスロー

### 認証ミドルウェア

- `c.get("decodedToken")`: Firebase の DecodedIdToken（JWT の中身）
- `c.get("user")`: DB の User オブジェクト（認証ミドルウェアで取得済み）
- ルートハンドラーでは `c.get("user")` から直接ユーザー情報を取得する

### API レスポンス規約

#### エラーレスポンス

エラー発生時は HTTP ステータスコードとともに、以下の形式でレスポンスを返す。

**HTTPException エラー（認証・ビジネスロジックエラー）:**

```json
{
  "message": "エラーメッセージ"
}
```

**バリデーションエラー（zValidator）:**

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

**HTTPステータスコード:**

| HTTP ステータス | 説明                       |
| --------------- | -------------------------- |
| 400             | リクエストの形式が不正     |
| 401             | 認証エラー                 |
| 403             | アクセス権限なし           |
| 404             | リソースが見つからない     |
| 409             | リソースの競合（重複など） |
| 500             | サーバー内部エラー         |

#### ページングレスポンス

一覧取得 API でページングが必要な場合、レスポンスに `paging` オブジェクトを含める。

```typescript
{
  "items": [...],        // データ配列（キー名はリソースに応じて変更）
  "paging": {
    "total": number,     // 総件数
    "offset": number,    // 現在の開始位置
    "limit": number      // 1ページあたりの取得件数（固定値）
  }
}
```

**リクエストパラメータ:**

| パラメータ | 型     | 説明                                |
| ---------- | ------ | ----------------------------------- |
| offset     | number | 取得を開始する位置（デフォルト: 0） |

※ `limit` はサーバー側の固定値（20）とし、クライアントからは指定しない。

**例: ページングレスポンス**

```json
{
  "workouts": [
    { "id": "cuid1", "place": "ジム" },
    { "id": "cuid2", "place": "自宅" }
  ],
  "paging": {
    "total": 100,
    "offset": 0,
    "limit": 20
  }
}
```

### テスト

- 各機能に対しては必ずユニットテストを実装（テストは Vitest を使用。describe/it 構文を使用。describe は日本語で記述）
- コードを追加で修正したとき、 `npm run test` がパスすることを常に確認する。
- **コードスタイル:** ESLint + Prettier
- **ドキュメント:** 関数には JSDoc コメントを必ず追加
- 規約: ハードコード禁止。環境変数や設定ファイルを利用し、柔軟に対応できるようにします。

## ドキュメント

- [DB テーブル設計](docs/db-table-structure.md)
- [API エンドポイント一覧](docs/api-endpoints.md)

## 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Hono Node.js Adapter](https://hono.dev/docs/getting-started/nodejs)
- [@hono/zod-validator](https://hono.dev/docs/guides/validation#with-zod)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth?hl=ja)
