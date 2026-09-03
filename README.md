# このリポジトリについて

このリポジトリは WordPress 開発環境です。

## できること

- Docker環境への WordPress 本体やプラグインのインストール
- CSS、JavaScript、カスタムブロックのビルド
- 画像の最適化（Sharp）
- 本番環境からのデータベースのインポート、uploadsディレクトリの取得
- 本番環境へのテーマのデプロイ
- ローカル環境で送信したメールのキャッチ

## はじめに

- 本文内のポート番号は `.env` で指定したもの

### 必要なもの

- Node.js
- Docker
- 本番環境のSSH鍵
  （ `~/.ssh` に配置し、 `~/.ssh/config` にホストを設定すること）
- Advanced Custom Fields PRO のライセンス
  - Composerでのプラグインインストールに必要なため、 `auth.json` を取得しておくこと
    参考： [ACF | Installing ACF PRO With Composer](https://www.advancedcustomfields.com/resources/installing-acf-pro-with-composer/)
  - `.env` にライセンスキー（ `PLUGIN_ACF_KEY` ）を記入すること

### セットアップ

1.  `npm ci` （依存パッケージのインストール）
2.  `cp .env.example .env` -> .env を編集する
3.  `docker/wordpress/auth.json` を配置する
4.  `docker compose build && docker compose up -d` でDockerコンテナをビルド・起動する
5.  `docker compose exec -w /var/www/html wordpress bash -c "sh setup.sh"` でWordPressコンテナをセットアップする
6.  `npm run build` でフロントエンドをビルドする
7.  http://localhost:8080 にアクセスしてWordPressが表示されたら完了

また、http://localhost:8025 でMailpitのメールボックスにアクセスできます。

## コマンド

### 開発モード `npm run dev`

ソースコードを監視しながら変更を検知してブラウザのオートリロードを行います。ソースマップを出力します。

### ビルド `npm run build`

本番モードでビルドします。ソースマップは出力されません。

### 本番のデータ取得 `npm run pull:production`

本番環境のデータベースと `wp-content/uploads` を取得します。データベース内の本番環境ホストを、 `localhost:8080` に置換します。

### 本番へのデプロイ `npm run deploy:production`

本番モードでビルドし、本番環境へテーマをデプロイします。rsyncを使うため、ローカルで削除したファイルを同期して本番環境からも削除します。

## ディレクトリ構造

以下、主要なものの抜粋。

```
.
├── docker # 各Dockerコンテナで使う設定ファイルなど
│    └── wordpress
├── mu-plugins
├── scripts # ビルド時に使うスクリプト
├── public # PDFなどのビルドせずにコピーする静的ファイル（省略可）
├── src # ビルドする静的ファイル
│    ├── blocks
│    ├── editor
│    ├── images
│    ├── scripts
│    └── styles
├── theme
│    ├── assets # ビルドされた静的ファイル
│    ├── blocks # ビルドされたカスタムブロック
│    ├── libs # PHPライブラリ
│    ├── views # テンプレートファイル
│    ├── functions.php
│    ├── index.php
│    ├── style.css
│    └── theme.json
└── .env.example # -> .env
```

## テーマについて

テンプレートエンジンに[Twig](https://twig.symfony.com/)を使用しています。詳しくはリンク先のドキュメントを参照してください。また、Twig を WordPress で利用するためのライブラリ[Timber](https://timber.github.io/docs/)を合わせて使用しています。Timber 独自の関数についてはこちらのドキュメントを参照してください。

テーマ（親テーマJunにあるものも含む）独自の関数については下記の通りです。

### 画像の呼び出し `get_image_path()`

`{{ get_image_path('common/logo.png') }}`のように、関数に`assets/images/`からの相対パスを渡します。絶対パスにキャッシュパラメータをつけて返します。

### 静的ファイルの呼び出し `get_static_file_path()`

`{{ get_static_file_path('assets/doc/map.pdf') }}`のように、関数にテーマディレクトリからの相対パスを渡します。絶対パスと、テスト環境ならパラメータをつけて返します。
