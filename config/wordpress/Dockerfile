FROM wordpress:latest

# 日本語化
RUN apt-get update -qq; \
  apt-get install -y --no-install-recommends \
  locales \
  fonts-noto-cjk \
  ; \
  locale-gen ja_JP.UTF-8; \
  apt-get autoremove; \
  apt-get clean
ENV LANG ja_JP.UTF-8
ENV LANGUAGE ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP.utf8

# 依存パッケージ追加
RUN apt-get update \
    && apt-get install -y libonig-dev libzip-dev unzip \
    && docker-php-ext-install mbstring zip bcmath \
    && pecl install xdebug-2.5.5 \
    && docker-php-ext-enable xdebug
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp \
    && wp --info
COPY --from=composer /usr/bin/composer /usr/bin/composer
