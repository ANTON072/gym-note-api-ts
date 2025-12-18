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
- **認証:** Firebase Auth
- **テスト:** Vitest

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

## 基本規約

- **言語:** TypeScript
- **コメント:** 各ファイルの冒頭に日本語で仕様を記述
- **ドキュメント:** 関数には JSDoc コメントを必ず追加
- **ハードコード禁止:** 環境変数や設定ファイルを利用
- **テスト必須:** 各サービス関数に対してユニットテストを実装
- **コード変更後:** `npm run test` がパスすることを常に確認

## 認証ミドルウェア

- `c.get("decodedToken")`: Firebase の DecodedIdToken（JWT の中身）
- `c.get("user")`: DB の User オブジェクト（認証ミドルウェアで取得済み）

## ドキュメント

- [DB テーブル設計](docs/db-table-structure.md)
- [OpenAPI 仕様](docs/openapi.yaml)

## スキル（Claude Code用）

- [機能追加スキル](.claude/skills/add-feature.md) - 新しいAPIエンドポイントを追加する際の手順・テンプレート・命名規則

## 参考リンク

- [Hono Documentation](https://hono.dev/)
- [Hono Node.js Adapter](https://hono.dev/docs/getting-started/nodejs)
- [@hono/zod-openapi](https://hono.dev/examples/zod-openapi)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth?hl=ja)
