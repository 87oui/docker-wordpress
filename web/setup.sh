#!/bin/bash

# Wordpress本体やプラグインのインストール
composer install

# publicディレクトリのパーミッション変更
chmod 777 public

# .htaccessを移動
if [ -e public/wp/.htaccess ] && [ ! -e public/.htaccess ]; then
  mv public/wp/.htaccess public/.htaccess
fi

# Wordpressをサブディレクトリに設置するのでファイルを移動
if [ -e public/wp/index.php ] && [ ! -e public/index.php ]; then
  sed -i -e 's/\/wp-blog-header\.php/\/wp\/wp-blog-header.php/g' public/wp/index.php
  mv public/wp/index.php public/index.php
fi

# 日本語化
wp language core install ja --activate --allow-root
wp language plugin install ja --all --allow-root
