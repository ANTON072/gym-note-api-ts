# Gym Note Api - Claude Code ガイド

## プロジェクト概要

**Gym Note Api**は、筋トレのログを記録するノートアプリの API です。Node.js / Express / TypeScript で構築されています。

- **アプリ名:** Gym Note Api
- **主要機能:** 筋トレのログを登録・一覧・編集・削除

## 技術スタック

- **フレームワーク:** Express / TypeScript
- **データベース:** MariaDB
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

### API レスポンス規約

#### エラーレスポンス

エラー発生時は HTTP ステータスコードとともに、以下の形式でレスポンスを返す。

```typescript
{
  "error": {
    "code": string,      // 内部エラーコード（例: "VALIDATION_ERROR"）
    "message": string,   // エラーメッセージ
    "details"?: object   // サービス毎の詳細エラー情報（任意）
  }
}
```

**内部エラーコード一覧:**

| HTTP ステータス | code             | 説明                   |
| --------------- | ---------------- | ---------------------- |
| 400             | VALIDATION_ERROR | リクエストの形式が不正 |
| 401             | UNAUTHORIZED     | 認証エラー             |
| 403             | FORBIDDEN        | アクセス権限なし       |
| 404             | NOT_FOUND        | リソースが見つからない |
| 500             | INTERNAL_ERROR   | サーバー内部エラー     |

**例: 基本的なエラーレスポンス**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません"
  }
}
```

**例: 詳細情報を含むバリデーションエラー**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "メールアドレスの形式が正しくありません"
        },
        { "field": "name", "message": "名前は必須です" }
      ]
    }
  }
}
```

**例: 外部サービスエラーの詳細**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "外部サービスとの通信に失敗しました",
    "details": {
      "service": "firebase",
      "originalError": "auth/user-not-found"
    }
  }
}
```

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

- [Express \- Node\.js web application framework](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth?hl=ja)
