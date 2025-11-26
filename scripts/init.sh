#!/bin/bash
# サーバー初期セットアップスクリプト
# 使用方法: ./init.sh

set -e

DOMAIN="api.gym-note.net"

echo "=== サーバー初期セットアップ開始 ==="

# 基本ツールのインストール
echo ">>> 基本ツールをインストール中..."
sudo dnf install -y vim

# EPELリポジトリを有効化（certbot等に必要）
echo ">>> EPELリポジトリを有効化中..."
sudo dnf install -y epel-release

# Node.js 22 のインストール（NodeSourceリポジトリを使用）
echo ">>> Node.js 22 をインストール中..."
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
node -v

# MariaDB のインストール
echo ">>> MariaDB をインストール中..."
sudo dnf install -y mariadb-server
sudo systemctl enable --now mariadb

# PM2 のインストール
echo ">>> PM2 をインストール中..."
sudo npm install -g pm2

# Nginx のインストール
echo ">>> Nginx をインストール中..."
sudo dnf install -y nginx
sudo systemctl enable --now nginx

# Nginx設定ファイルの作成
echo ">>> Nginx設定ファイルを作成中..."
sudo tee /etc/nginx/conf.d/gym-note-api.conf > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Nginx設定テストと再起動
sudo nginx -t
sudo systemctl reload nginx

# Let's Encrypt (certbot) のインストール
echo ">>> Certbot をインストール中..."
sudo dnf install -y certbot python3-certbot-nginx

echo "=== セットアップ完了 ==="
echo ""
echo "次の手順:"
echo "1. mariadb-secure-installation を実行"
echo "2. MariaDBにデータベースとユーザーを作成:"
echo "   sudo mysql -u root -p"
echo "   CREATE DATABASE gym_note;"
echo "   CREATE USER 'gym_user'@'localhost' IDENTIFIED BY 'パスワード';"
echo "   GRANT ALL PRIVILEGES ON gym_note.* TO 'gym_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "3. さくらVPSパケットフィルタでTCP 22, 80, 443を許可"
echo "4. DNSで ${DOMAIN} をサーバーIPに向ける"
echo "5. SSL証明書を取得: sudo certbot --nginx -d ${DOMAIN}"
