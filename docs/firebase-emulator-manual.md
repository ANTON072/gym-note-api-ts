# Firebase Emulator 使用方法

VS Code の REST Client を使ってローカル環境で API をテストする手順。

## 前提条件

- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) 拡張機能をインストール済み

## 1. API を起動する

```sh
# データベース起動
docker compose up -d
# API起動
npm run dev
```

- 3000 ポート以外で起動する場合は `api.http` の `@apiHost` を変更する

## 2. Firebase Emulator を起動する

```sh
npm run firebase:start
```

- テストユーザーがすでに登録されている
- エミュレーターのホストが `http://127.0.0.1:9099` 以外の場合は `api.http` の `@emulatorHost` を変更する

## 3. idToken の取得

1. `api.http` の「Firebase Auth Sign In with Email and Password」を実行する
2. レスポンスから `idToken` をコピーする
3. `api.http` の `@idToken` に貼り付ける（ダブルクォーテーション不要）

## 4. API のテストを実行する

`api.http` 内の各リクエストを実行してテストする。

---

## 参考リンク

- [REST Client - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Firebase Local Emulator Suite の概要](https://firebase.google.com/docs/emulator-suite?hl=ja)
