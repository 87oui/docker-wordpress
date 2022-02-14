# このリポジトリについて

このリポジトリは Wordpress 開発環境です。

## できること

- Wordpress 本体やプラグインのインストール
- ローカルサーバ起動
- ソースコードの監視
- ソースコードのビルド
  - PostCSS による CSS 生成
    - [Tailwind CSS](https://tailwindcss.com/)をベースにしています。
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
3.  `docker compose up -d` （Docker を起動）
4.  `docker compose exec -w /var/www/html/web wordpress bash -c 'bash setup.sh'` （Docker で開発環境作成）
5.  phpMyAdmin（ http://localhost:3307 ）を開き、データベースをインポート
6.  options テーブルの home と site_url のドメインを`http://localhost:8080`に変更

※ ポート番号は.env で設定した値にすること。

完了したら、`npm run start`で開発モードが起動します。

## コマンド

### 開発モード

`npm run start`

ソースコードを監視しながら変更を検知してブラウザのオートリロードを行います。ソースマップを出力します。

### ビルド

`npm run build --prefix theme`

本番モードでビルドします。ソースマップは出力されません。

## ディレクトリ構造

```
.
├── config
│    └── wordpress
│          ├── 000-default.conf
│          └── php.ini
├── docker
│    └── wordpress
│          └── Dockerfile
├── themes
│    ├── assets # ビルドされた静的ファイル
│    ├── src # ビルドする静的ファイル
│    │        ├── icons
│    │        ├── images
│    │        ├── scripts
│    │        └── styles
│    ├── templates # テンプレートファイル
│    ├── functions.php
│    ├── gulpfile.js
│    ├── index.php
│    ├── package.json
│    ├── style.css
│    └── tailwind.config.js
├── web # wordpressコンテナで使うソースコード
│    ├── mu-plugins
│    ├── public
│    │    └── wp-config.php
│    ├── composer.json
│    ├── phpcs.xml
│    ├── setup.sh # wordpressコンテナのセットアップスクリプト
│    └── wp-cli.yml
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md
```

## テーマについて

テンプレートエンジンに[Twig](https://twig.symfony.com/)を使用しています。詳しくはリンク先のドキュメントを参照してください。また、Twig を Wordpress で利用するためのライブラリ[Timber](https://timber.github.io/docs/)を合わせて使用しています。Timber 独自の関数についてはこちらのドキュメントを参照してください。

テーマ独自の関数については下記の通りです。

### 画像の呼び出し

`{{ get_image_path('common/logo.png') }}`のように、関数に`assets/images/`からの相対パスを渡します。絶対パスと、テスト環境ならパラメータをつけて返します。

### 静的ファイルの呼び出し

`{{ get_static_file_path('assets/doc/map.pdf') }}`のように、関数にテーマディレクトリからの相対パスを渡します。絶対パスと、テスト環境ならパラメータをつけて返します。
