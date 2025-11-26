# 本番サーバーセットアップガイド

さくらVPS（Rocky Linux）での本番環境構築手順です。

## 前提条件

- さくらVPSでRocky Linuxを選択
- スタートアップスクリプト「Setup and update」を適用済み
- SSH公開鍵認証でログイン可能

## 1. サーバー初期設定

### 1.1 サーバーにSSH接続

```bash
ssh rocky@<サーバーIP>
```

### 1.2 Gitのインストールとリポジトリのクローン

```bash
sudo dnf install -y git
git clone https://github.com/ANTON072/gym-note-api-ts.git
cd gym-note-api-ts
```

### 1.3 初期セットアップスクリプトを実行

```bash
./scripts/init.sh
```

このスクリプトで以下がインストールされます：

- vim
- Node.js 22
- MariaDB
- PM2
- Nginx
- Certbot

## 2. データベース設定

### 2.1 MariaDBのセキュリティ設定

```bash
sudo mariadb-secure-installation
```

| 質問 | 回答 |
|------|------|
| Enter current password for root | Enter（初期は空） |
| Switch to unix_socket authentication | n |
| Change the root password? | Y → パスワード入力 |
| Remove anonymous users? | Y |
| Disallow root login remotely? | Y |
| Remove test database and access to it? | Y |
| Reload privilege tables now? | Y |

### 2.2 データベースとユーザーの作成

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE gym_note;
CREATE USER 'gym_user'@'localhost' IDENTIFIED BY '強力なパスワード';
GRANT ALL PRIVILEGES ON gym_note.* TO 'gym_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. ネットワーク設定

### 3.1 さくらVPSパケットフィルタ設定

コントロールパネルから以下を許可：

- TCP 22（SSH）
- TCP 80（HTTP）
- TCP 443（HTTPS）

### 3.2 DNS設定

`api.gym-note.net` をサーバーIPに向けるAレコードを登録

### 3.3 SSL証明書の取得

```bash
sudo certbot --nginx -d api.gym-note.net
```

## 4. アプリケーションのデプロイ

### 4.1 環境変数の設定

```bash
cp .env.example .env
vim .env
```

以下を本番用に編集：

```
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://gym_user:パスワード@localhost:3306/gym_note"
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
```

### 4.2 依存関係のインストール

```bash
npm install
```

### 4.3 Prismaのセットアップ

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4.4 ビルド

```bash
npm run build
```

### 4.5 PM2で起動

```bash
pm2 start dist/index.js --name gym-note-api
pm2 save
pm2 startup
```

最後のコマンドで表示される `sudo env PATH=...` を実行すると、サーバー再起動時に自動起動します。

## 5. 運用

### ステータス確認

```bash
pm2 status
```

### ログ確認

```bash
pm2 logs gym-note-api
```

### 再起動

```bash
pm2 restart gym-note-api
```

### 停止

```bash
pm2 stop gym-note-api
```

## 6. アプリケーションの更新

```bash
cd ~/gym-note-api-ts
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart gym-note-api
```

## 7. SSL証明書の自動更新確認

証明書は自動更新されますが、確認する場合：

```bash
sudo systemctl status certbot-renew.timer
```

手動で更新する場合：

```bash
sudo certbot renew
```
