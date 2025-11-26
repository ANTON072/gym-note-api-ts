# サーバーセットアップスクリプト

さくらVPS（Rocky Linux）用の初期セットアップスクリプトです。

## 前提条件

- さくらVPSでRocky Linuxを選択
- スタートアップスクリプト「Setup and update」を適用済み
- SSH公開鍵認証でログイン可能

## 使い方

### 1. サーバーにSSH接続

```bash
ssh rocky@<サーバーIP>
```

### 2. Gitのインストールとリポジトリのクローン

```bash
sudo dnf install -y git
git clone https://github.com/ANTON072/gym-note-api-ts.git
cd gym-note-api-ts
```

### 3. 初期セットアップスクリプトを実行

```bash
./scripts/init.sh
```

## スクリプト実行後の手動作業

### 1. MySQLのセキュリティ設定

```bash
sudo mysql_secure_installation
```

### 2. データベースとユーザーの作成

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

### 3. さくらVPSパケットフィルタ設定

コントロールパネルから以下を許可：

- TCP 22（SSH）
- TCP 80（HTTP）
- TCP 443（HTTPS）

### 4. DNS設定

`api.gym-note.net` をサーバーIPに向ける

### 5. SSL証明書の取得

```bash
sudo certbot --nginx -d api.gym-note.net
```
