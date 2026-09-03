#!/bin/bash

cd /var/www/html

# 公式イメージが作る未使用の wp-content を削除
rm -rf /var/www/html/wp-content

# WordPress本体やプラグインのインストール
composer install

# index.phpをコピー
if [ -e public_html/wp/index.php ] && [ ! -e public_html/index.php ]; then
  cp public_html/wp/index.php public_html/index.php
  sed -i -e 's/\/wp-blog-header\.php/\/wp\/wp-blog-header.php/g' public_html/index.php
fi

# Apache (www-data) が .htaccess と uploads に書き込めるよう所有者を合わせる
mkdir -p public_html/wp/wp-content/uploads
chown www-data:www-data public_html public_html/wp public_html/wp/wp-content
chown -R www-data:www-data public_html/wp/wp-content/uploads
if [ -e public_html/.htaccess ]; then
  chown www-data:www-data public_html/.htaccess
fi
if [ -e public_html/wp/.htaccess ]; then
  chown www-data:www-data public_html/wp/.htaccess
fi

# 本番環境との同期
sync-wp pull

# プラグインを日本語化
wp language plugin install ja --all --allow-root
