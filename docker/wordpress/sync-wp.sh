#!/usr/bin/env bash
set -euo pipefail

WP_PATH=/var/www/html/public_html/wp
LOCAL_UPLOADS="${WP_PATH}/wp-content/uploads"
LOCAL_THEMES="${WP_PATH}/wp-content/themes"
LOCAL_PLUGINS="${WP_PATH}/wp-content/plugins"
LOCAL_MU_PLUGINS="${WP_PATH}/wp-content/mu-plugins"
LOCAL_VHOST="http://localhost:${LOCAL_SERVER_PORT:-8080}"

# production | staging（デフォルト: production）
REMOTE_ENV="${SYNC_WP_ENV:-production}"

usage() {
  cat <<'EOF'
Usage: sync-wp [--env production|staging] <command>

  --env            対象環境を指定する（デフォルト: production）
                   production → PRODUCTION_* 環境変数を使用
                   staging    → STAGING_* 環境変数を使用

  pull             対象環境のデータベースと uploads を取得する
  pull-db          対象環境のデータベースをインポートし、URL を置換する
  pull-uploads     対象環境の uploads を rsync する
  push-db          ローカルのデータベースを対象環境へインポートする（production 不可）
  push-theme       ローカルの themes を対象環境へ rsync する
  push-plugins     ローカルの plugins を対象環境へ rsync する
  push-mu-plugins  ローカルの mu-plugins を対象環境へ rsync する
  replace-urls     対象環境 URL をローカル URL に置換する

Examples:
  sync-wp pull
  sync-wp --env staging pull
  sync-wp --env staging push-db
  sync-wp --env production push-theme
EOF
}

require_env() {
  local missing=0
  local name
  for name in "$@"; do
    if [[ -z "${!name:-}" ]]; then
      echo "環境変数 ${name} が未設定です" >&2
      missing=1
    fi
  done
  if [[ "$missing" -ne 0 ]]; then
    exit 1
  fi
}

# REMOTE_ENV に応じて REMOTE_* 変数を設定する
resolve_remote_env() {
  local prefix
  case "$REMOTE_ENV" in
    production)
      prefix=PRODUCTION
      ;;
    staging)
      prefix=STAGING
      ;;
    *)
      echo "不明な環境です: ${REMOTE_ENV}（production または staging を指定してください）" >&2
      exit 1
      ;;
  esac

  REMOTE_HOST_VAR="${prefix}_HOST"
  REMOTE_DIR_PATH_VAR="${prefix}_DIR_PATH"
  REMOTE_SSH_HOST_VAR="${prefix}_SSH_HOST"
  REMOTE_DB_NAME_VAR="${prefix}_DB_NAME"
  REMOTE_DB_USER_VAR="${prefix}_DB_USER"
  REMOTE_DB_PASSWORD_VAR="${prefix}_DB_PASSWORD"
  REMOTE_DB_HOST_VAR="${prefix}_DB_HOST"

  REMOTE_HOST="${!REMOTE_HOST_VAR:-}"
  REMOTE_DIR_PATH="${!REMOTE_DIR_PATH_VAR:-}"
  REMOTE_SSH_HOST="${!REMOTE_SSH_HOST_VAR:-}"
  REMOTE_DB_NAME="${!REMOTE_DB_NAME_VAR:-}"
  REMOTE_DB_USER="${!REMOTE_DB_USER_VAR:-}"
  REMOTE_DB_PASSWORD="${!REMOTE_DB_PASSWORD_VAR:-}"
  REMOTE_DB_HOST="${!REMOTE_DB_HOST_VAR:-}"
}

wp_cmd() {
  wp --path="$WP_PATH" --allow-root "$@"
}

wp_is_installed() {
  wp_cmd core is-installed >/dev/null 2>&1
}

replace_urls() {
  require_env "$REMOTE_HOST_VAR" LOCAL_SERVER_PORT
  if ! wp_is_installed; then
    echo "WordPress が未セットアップのため URL 置換をスキップします。"
    return 0
  fi
  echo "URL を置換します: ${REMOTE_HOST} -> ${LOCAL_VHOST}"
  wp_cmd search-replace "$REMOTE_HOST" "$LOCAL_VHOST" --all-tables --report-changed-only
}

local_db_host() {
  local db_host="${DB_HOST%%:*}"
  local db_port="${DB_HOST##*:}"
  if [[ "$db_host" == "$db_port" ]]; then
    db_port=3306
  fi
  printf '%s %s' "$db_host" "$db_port"
}

local_mysql() {
  local db_host db_port
  read -r db_host db_port <<<"$(local_db_host)"
  MYSQL_PWD="$DB_PASSWORD" mysql --host="$db_host" --port="$db_port" --user="$DB_USER" --database="$DB_NAME" "$@"
}

local_mysqldump() {
  local db_host db_port
  read -r db_host db_port <<<"$(local_db_host)"
  MYSQL_PWD="$DB_PASSWORD" mysqldump \
    --host="$db_host" --port="$db_port" --user="$DB_USER" \
    --no-tablespaces --single-transaction --quick --default-character-set=utf8 \
    "$DB_NAME" "$@"
}

pull_db() {
  require_env \
    "$REMOTE_SSH_HOST_VAR" "$REMOTE_DB_HOST_VAR" "$REMOTE_DB_USER_VAR" \
    "$REMOTE_DB_PASSWORD_VAR" "$REMOTE_DB_NAME_VAR" \
    DB_HOST DB_USER DB_PASSWORD DB_NAME

  local host_q user_q pass_q db_q
  printf -v host_q '%q' "$REMOTE_DB_HOST"
  printf -v user_q '%q' "$REMOTE_DB_USER"
  printf -v pass_q '%q' "$REMOTE_DB_PASSWORD"
  printf -v db_q '%q' "$REMOTE_DB_NAME"

  echo "[${REMOTE_ENV}] データベースをダンプしてインポートします"
  ssh "$REMOTE_SSH_HOST" \
    "MYSQL_PWD=${pass_q} mysqldump --host=${host_q} --user=${user_q} --no-tablespaces --single-transaction --quick --default-character-set=utf8 ${db_q}" \
    | sed '/sandbox mode/d' \
    | local_mysql

  replace_urls
}

push_db() {
  if [[ "$REMOTE_ENV" == "production" ]]; then
    echo "本番環境へのデータベース push は許可されていません" >&2
    exit 1
  fi

  require_env \
    "$REMOTE_SSH_HOST_VAR" "$REMOTE_DB_HOST_VAR" "$REMOTE_DB_USER_VAR" \
    "$REMOTE_DB_PASSWORD_VAR" "$REMOTE_DB_NAME_VAR" \
    "$REMOTE_HOST_VAR" LOCAL_SERVER_PORT \
    DB_HOST DB_USER DB_PASSWORD DB_NAME

  if ! wp_is_installed; then
    echo "WordPress が未セットアップのため push-db を中止します。" >&2
    exit 1
  fi

  local host_q user_q pass_q db_q
  printf -v host_q '%q' "$REMOTE_DB_HOST"
  printf -v user_q '%q' "$REMOTE_DB_USER"
  printf -v pass_q '%q' "$REMOTE_DB_PASSWORD"
  printf -v db_q '%q' "$REMOTE_DB_NAME"

  restore_local_urls() {
    echo "ローカル URL を復元します: ${REMOTE_HOST} -> ${LOCAL_VHOST}"
    wp_cmd search-replace "$REMOTE_HOST" "$LOCAL_VHOST" --all-tables --report-changed-only
  }

  echo "[${REMOTE_ENV}] ローカル URL を一時的に置換します: ${LOCAL_VHOST} -> ${REMOTE_HOST}"
  wp_cmd search-replace "$LOCAL_VHOST" "$REMOTE_HOST" --all-tables --report-changed-only
  trap restore_local_urls EXIT

  echo "[${REMOTE_ENV}] ローカルデータベースをダンプしてリモートへインポートします"
  local_mysqldump \
    | sed '/sandbox mode/d' \
    | ssh "$REMOTE_SSH_HOST" \
      "MYSQL_PWD=${pass_q} mysql --host=${host_q} --user=${user_q} --default-character-set=utf8 ${db_q}"

  trap - EXIT
  restore_local_urls
}

pull_uploads() {
  require_env "$REMOTE_SSH_HOST_VAR" "$REMOTE_DIR_PATH_VAR"
  mkdir -p "$LOCAL_UPLOADS"
  echo "[${REMOTE_ENV}] uploads を rsync します"
  rsync -avz --copy-links --delete \
    "${REMOTE_SSH_HOST}:${REMOTE_DIR_PATH}/wp/wp-content/uploads/" \
    "${LOCAL_UPLOADS}/"
  chown -R www-data:www-data "$LOCAL_UPLOADS"
}

push_theme() {
  require_env "$REMOTE_SSH_HOST_VAR" "$REMOTE_DIR_PATH_VAR"
  echo "[${REMOTE_ENV}] themes を rsync します"
  rsync -avz --copy-links --delete \
    --exclude 'node_modules/' \
    --exclude 'manifest.dev.json' \
    "${LOCAL_THEMES}/" \
    "${REMOTE_SSH_HOST}:${REMOTE_DIR_PATH}/wp/wp-content/themes/"
}

push_plugins() {
  require_env "$REMOTE_SSH_HOST_VAR" "$REMOTE_DIR_PATH_VAR"
  echo "[${REMOTE_ENV}] plugins を rsync します"
  rsync -avz --copy-links --delete \
    --exclude '/all-in-one-wp-migration-unlimited-extension/' \
    "${LOCAL_PLUGINS}/" \
    "${REMOTE_SSH_HOST}:${REMOTE_DIR_PATH}/wp/wp-content/plugins/"
}

push_mu_plugins() {
  require_env "$REMOTE_SSH_HOST_VAR" "$REMOTE_DIR_PATH_VAR"
  echo "[${REMOTE_ENV}] mu-plugins を rsync します"
  rsync -avz --copy-links --delete \
    --exclude 'node_modules/' \
    "${LOCAL_MU_PLUGINS}/" \
    "${REMOTE_SSH_HOST}:${REMOTE_DIR_PATH}/wp/wp-content/mu-plugins/"
}

COMMAND=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      if [[ $# -lt 2 ]]; then
        echo "--env には production または staging を指定してください" >&2
        exit 1
      fi
      REMOTE_ENV="$2"
      shift 2
      ;;
    --env=*)
      REMOTE_ENV="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "不明なオプションです: $1" >&2
      usage
      exit 1
      ;;
    *)
      if [[ -n "$COMMAND" ]]; then
        echo "コマンドは1つだけ指定してください" >&2
        usage
        exit 1
      fi
      COMMAND="$1"
      shift
      ;;
  esac
done

resolve_remote_env

case "$COMMAND" in
  pull)
    pull_db
    pull_uploads
    ;;
  pull-db)
    pull_db
    ;;
  pull-uploads)
    pull_uploads
    ;;
  push-db)
    push_db
    ;;
  push-theme)
    push_theme
    ;;
  push-plugins)
    push_plugins
    ;;
  push-mu-plugins)
    push_mu_plugins
    ;;
  replace-urls)
    replace_urls
    ;;
  *)
    usage
    exit 1
    ;;
esac
