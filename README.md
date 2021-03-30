# このリポジトリについて

このリポジトリは Wordpress 開発環境です。

## できること

- Wordpress 本体やプラグインのインストール
- ローカルサーバ起動
- ソースコードの監視
- ソースコードのビルド
  - SCSS->CSS（dart-sass）
  - Javascript（esbuild）
- 画像の最適化
- SVG 形式のアイコンを SVG スプライトにまとめる

## はじめに

### 必要なもの

- NodeJS
- Docker

### セットアップ

1.  `npm ci` （依存パッケージのインストール）
2.  `cp .env.example .env` -> .env を編集する
3.  `docker-compose up -d` （Docker を起動）
4.  `docker-compose exec -w /var/www/html/project wordpress bash -c 'bash setup.sh'` （Docker で開発環境作成）
5.  `npm run start`

## コマンド

### 開発モード

`npm run start`

ローカルサーバを起動し、ソースコードを監視しながら変更を検知してビルドします。ソースマップを出力します。

### ビルド

`npm run build`

本番モードでビルドします。ソースマップは出力されません。

## ディレクトリ構造

```
config/ 各コンテナで使う設定ファイル
  wordmove/
    movefile.yml
  wordpress/
    000-default.conf
    Dockerfile
    php.ini
project/ Wordpressコンテナでマウントするディレクトリ
  mu-plugins/
  plugins/
  public/ ドキュメントルート
    wp/ Wordpress本体
    wp-config.php
  themes/
  composer.json Wordpress本体やプラグインの依存設定
  setup.sh Wordpressのインストールなどを行うシェルスクリプト
sources/
  icons/ SVGスプライトにまとめるアイコン
  images/
  scripts/
  styles/
config.js テーマまでのパスなどの設定ファイル
docker-compose.yml
gulpfile.js
package.json
```

## テーマについて

テンプレートエンジンに[Twig](https://twig.symfony.com/)を使用しています。詳しくはリンク先のドキュメントを参照してください。また、Twig を Wordpress で利用するためのライブラリ[Timber](https://timber.github.io/docs/)を合わせて使用しています。Timber 独自の関数についてはこちらのドキュメントを参照してください。

テーマ独自の関数については下記の通りです。

### 画像の呼び出し

`{{ get_image_path('common/logo.png') }}`のように、関数に`assets/images/`からの相対パスを渡します。絶対パスと、テスト環境ならパラメータをつけて返します。

### 静的ファイルの呼び出し

`{{ get_static_file_path('assets/doc/map.pdf') }}`のように、関数にテーマディレクトリからの相対パスを渡します。絶対パスと、テスト環境ならパラメータをつけて返します。
