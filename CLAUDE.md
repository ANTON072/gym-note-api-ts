# Gym Note Api - Claude Code ガイド

## プロジェクト概要

**Gym Note Api**は、筋トレのログを記録するノートアプリの API です。Node.js / Express / TypeScript で構築されています。

- **アプリ名:** Gym Note Api
- **主要機能:** 筋トレのログを登録・一覧・編集・削除

## 技術スタック

- **フレームワーク:** Express / TypeScript
- **データベース:** MySQL
- **ORM:** Prisma
- **バリデーション:** Zod

## 認証システム

- **プロバイダー:** Firebase Auth

## プロジェクト構造

```text
gym-note-api-ts/
├── prisma/
│   └── schema.prisma        # DBスキーマ定義
├── src/
│   ├── config/
│   │   ├── database.ts      # Prismaクライアント
│   │   ├── env.ts           # 環境変数（Zodバリデーション）
│   │   └── firebase.ts      # Firebase Admin SDK初期化
│   ├── controllers/         # コントローラー
│   ├── middlewares/
│   │   ├── auth.ts          # Firebase認証ミドルウェア
│   │   └── errorHandler.ts  # グローバルエラーハンドラー
│   ├── routes/              # ルート定義
│   ├── services/            # ビジネスロジック
│   ├── types/               # 型定義
│   ├── utils/               # ユーティリティ関数
│   ├── validators/          # Zodスキーマ
│   ├── app.ts               # Expressアプリ設定
│   └── index.ts             # エントリーポイント
├── .env.example             # 環境変数テンプレート
├── eslint.config.mjs        # ESLint設定
├── tsconfig.json            # TypeScript設定
└── vitest.config.ts         # Vitest設定
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

## ローカル開発環境のセットアップ

1. `.env.example`をコピーして`.env`を作成
2. `docker compose up -d`でMySQLコンテナを起動
3. `npm run prisma:migrate`でマイグレーション実行
4. `npm run dev`で開発サーバー起動

## テストガイドライン

- **テスト対象:** API エンドポイント、データベース操作、ビジネスロジック
- **環境:** Node.js + Vitest

## コード生成規約

- **言語:** TypeScript

### コメント

- 各ファイルの冒頭には日本語のコメントで仕様を記述する

### テスト

- 各機能に対しては必ずユニットテストを実装（テストは Vitest を使用。describe/it 構文を使用。describe は日本語で記述）
- コードを追加で修正したとき、 `npm run test` がパスすることを常に確認する。
- **コードスタイル:** ESLint + Prettier
- **ドキュメント:** 関数には JSDoc コメントを必ず追加
- 規約: ハードコード禁止。環境変数や設定ファイルを利用し、柔軟に対応できるようにします。

## 参考リンク

- [Express \- Node\.js web application framework](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth?hl=ja)
