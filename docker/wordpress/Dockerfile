FROM wordpress:php8.5

# 依存パッケージ追加
RUN apt-get update \
    && apt-get install -y locales unzip \
        # 本番との DB・uploads 同期に使う
        rsync openssh-client mariadb-client \
        # mysqlコマンドを提供する
        mariadb-client-compat \
        # PHP の mail() を Mailpit へ中継する
        msmtp \
    && apt-get autoremove \
    && apt-get clean \
    ; \
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp \
    && wp --info \
    ;
COPY --from=composer /usr/bin/composer /usr/bin/composer

# .htaccessに記述したmod_headersの有効化
RUN a2enmod headers

# 設定ファイルをコピー
COPY ./000-default.conf /etc/apache2/sites-enabled/000-default.conf
COPY ./php.ini /usr/local/etc/php/php.ini
COPY ./setup.sh /var/www/html/setup.sh
COPY ./wp-cli.yml /var/www/html/wp-cli.yml
COPY ./sync-wp.sh /usr/local/bin/sync-wp
RUN chmod +x /usr/local/bin/sync-wp /var/www/html/setup.sh

# マウントしたファイルへのシンボリックリンクを作成する
RUN mkdir -p /var/www/html/public_html \
    && ln -s /var/www/html/mount/composer.json /var/www/html/composer.json \
    && ln -s /var/www/html/mount/composer.lock /var/www/html/composer.lock \
    && ln -s /var/www/html/mount/.htaccess /var/www/html/public_html/.htaccess \
    && ln -s /var/www/html/mount/wp-config.php /var/www/html/public_html/wp-config.php

# 日本語化
RUN sed -i 's/# ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && locale-gen
ENV LANG ja_JP.UTF-8
