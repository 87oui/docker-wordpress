#!/bin/bash

# Wordpress本体やプラグインのインストール
composer install

# Wordpressをサブディレクトリに設置するのでファイルを移動
if [ -e public/wp/index.php ] && [ ! -e public/index.php ]; then
  sed -i -e 's/\/wp-blog-header\.php/\/wp\/wp-blog-header.php/g' public/wp/index.php
  mv public/wp/index.php public/index.php
fi
if [ -e public/wp/.htaccess ] && [ ! -e public/.htaccess ]; then
  mv public/wp/.htaccess public/.htaccess
fi

# 日本語翻訳ファイルをインストール
wp language core install ja --activate --allow-root
wp language plugin install ja --all --allow-root
