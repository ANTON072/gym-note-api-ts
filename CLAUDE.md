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
- **バリデーション・OpenAPI:** @hono/zod-openapi

## 認証システム

- **プロバイダー:** Firebase Auth

## プロジェクト構造

```text
gym-note-api-ts/
├── docs/                # ドキュメント
├── prisma/              # Prismaスキーマ・マイグレーション
├── scripts/             # ビルド・生成スクリプト
└── src/
    ├── __tests__/       # テスト用フィクスチャ
    ├── config/          # 設定（DB、環境変数、Firebase）
    ├── middlewares/     # ミドルウェア（認証など）
    ├── routes/          # ルート定義（@hono/zod-openapi）
    ├── schemas/         # Zodスキーマ（バリデーション + OpenAPI）
    ├── services/        # ビジネスロジック
    └── types/           # 型定義
```

### サービスのファイル構成

- **小規模なサービス:** 単一ファイル（例: `services/user.ts`）
- **大規模なサービス:** ディレクトリに分割（例: `services/exercise/`）
  - `index.ts` で関数をre-exportし、インポート側は `@/services/exercise` で統一

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
| `npm run openapi:generate`| OpenAPI仕様生成               |

## ローカル開発環境のセットアップ

1. `.env.example`をコピーして`.env`を作成
2. `docker compose up -d`でMariaDBコンテナを起動
3. `npm run prisma:migrate`でマイグレーション実行
4. `npm run dev`で開発サーバー起動

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

### Zod スキーマ

- `@hono/zod-openapi` の `z` を使用する
- datetime は `z.iso.datetime()` を使用する

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

- **バリデーション:** Routes で `@hono/zod-openapi` の `createRoute` を使用
- **ビジネスルールの検証:** Service で実施（重複チェック、権限、整合性など）
- **エラーハンドリング:** Service で `HTTPException` をスロー

### 認証ミドルウェア

- `c.get("decodedToken")`: Firebase の DecodedIdToken（JWT の中身）
- `c.get("user")`: DB の User オブジェクト（認証ミドルウェアで取得済み）
- ルートハンドラーでは `c.get("user")` から直接ユーザー情報を取得する

### テスト

- **テスト対象:** Service 層のみ（Routes 層のテストは不要）
- 各機能に対しては必ずユニットテストを実装（テストは Vitest を使用。describe/it 構文を使用。describe は日本語で記述）
- コードを追加で修正したとき、 `npm run test` がパスすることを常に確認する。
- **コードスタイル:** ESLint + Prettier
- **ドキュメント:** 関数には JSDoc コメントを必ず追加
- 規約: ハードコード禁止。環境変数や設定ファイルを利用し、柔軟に対応できるようにします。

## ドキュメント

- [DB テーブル設計](docs/db-table-structure.md)
- [OpenAPI 仕様](docs/openapi.yaml)

## 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Hono Node.js Adapter](https://hono.dev/docs/getting-started/nodejs)
- [@hono/zod-openapi](https://hono.dev/examples/zod-openapi)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth?hl=ja)
