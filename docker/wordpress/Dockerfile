FROM wordpress:latest

# 依存パッケージ追加
RUN apt-get update --allow-releaseinfo-change \
    && apt-get install -y locales unzip zlib1g-dev libzip-dev \
    && docker-php-ext-install zip mysqli \
    && docker-php-ext-configure zip mysqli \
    ; \
    apt-get autoremove; \
    apt-get clean; \
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp \
    && wp --info \
    ;
COPY --from=composer /usr/bin/composer /usr/bin/composer

# 日本語化
RUN locale-gen ja_JP.UTF-8;
ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP.UTF-8 \
    && echo "export LANG=ja_JP.UTF-8" >> ~/.bashrc \
    ;
