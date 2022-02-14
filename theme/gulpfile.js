'use strict';

/* eslint no-console: 0 */

/**
 * CONSTANTS
 */

// Common
const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync');
require('dotenv').config({ path: '../.env' });
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV.trim().toLowerCase() === 'development';

// Styles
const postcss = require('gulp-postcss');
const stylelint = require('stylelint');

// Scripts
const esbuild = require('gulp-esbuild');

// Images
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgSprite = require('gulp-svg-sprite');

/**
 * PATH
 */

// Views
const VIEWS_SRC = '**/*.{php,twig}';

// Directories
const ASSETS_DIR_SRC = 'src';
const ASSETS_DIR_DEST = 'assets';

// Images
const IMAGES_DIR_SRC = `${ASSETS_DIR_SRC}/images`;
const IMAGES_DIR_DEST = `${ASSETS_DIR_DEST}/images`;
const IMAGES_SRC = IMAGES_DIR_SRC + '/**/*.{png,jpg,gif,svg}';
const IMAGES_SRC_WEBP = IMAGES_DIR_SRC + '/**/*.{png,jpg}';
const ICONS_SRC = `${ASSETS_DIR_SRC}/icons/**/*.svg`;

// Styles
const STYLES_DIR_SRC = `${ASSETS_DIR_SRC}/styles`;
const STYLES_DIR_DEST = `${ASSETS_DIR_DEST}/styles`;
const STYLES_SRC = STYLES_DIR_SRC + '/**/*.css';

// Scripts
const SCRIPTS_DIR_SRC = `${ASSETS_DIR_SRC}/scripts`;
const SCRIPTS_DIR_DEST = `${ASSETS_DIR_DEST}/scripts`;
const SCRIPTS_SRC = SCRIPTS_DIR_SRC + '/**/*.js';

/**
 * TASKS
 */

// Styles
function styles() {
  return gulp
    .src([STYLES_SRC, '!' + STYLES_DIR_SRC + '/**/_*.css'], {
      sourcemaps: IS_DEV,
    })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: 'style - build error',
          message: '<%= error.message %>',
        }),
      })
    )
    .pipe(
      postcss([
        stylelint(),
        require('postcss-reporter')({
          clearReportedMessages: true,
        }),
      ])
    )
    .pipe(
      postcss(
        [
          require('postcss-import')({
            path: ['node_modules'],
          }),
          require('tailwindcss/nesting'),
          require('tailwindcss')(),
          require('autoprefixer')(),
          !IS_DEV && require('cssnano')({ autoprefixer: false }),
        ].filter((v) => v)
      )
    )
    .pipe(plumber.stop())
    .pipe(gulp.dest(STYLES_DIR_DEST, { sourcemaps: IS_DEV ? '.' : false }))
    .pipe(browserSync.stream());
}
exports.styles = styles;

// Scripts
function scripts() {
  return gulp
    .src(SCRIPTS_DIR_SRC + '/script.js')
    .pipe(
      esbuild({
        outfile: 'script.js',
        bundle: true,
        minify: !IS_DEV,
      })
    )
    .pipe(gulp.dest(SCRIPTS_DIR_DEST))
    .pipe(browserSync.stream());
}
exports.scripts = scripts;

// Images
function optimizeImages() {
  return gulp
    .src(IMAGES_SRC, { since: gulp.lastRun(optimizeImages) })
    .pipe(
      imagemin(
        [
          imagemin.mozjpeg({
            quality: 80,
            progressive: true,
          }),
          imagemin.optipng({
            optimizationLevel: 7,
          }),
          imagemin.gifsicle({
            optimizationLevel: 3,
          }),
          imagemin.svgo({
            plugins: [
              { removeAttrs: { attrs: ['data-name'] } },
              { removeViewBox: false },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(gulp.dest(IMAGES_DIR_DEST))
    .pipe(browserSync.stream());
}
exports.optimizeImages = optimizeImages;
function convertToWebP() {
  return gulp
    .src(IMAGES_SRC_WEBP, { since: gulp.lastRun(convertToWebP) })
    .pipe(webp())
    .pipe(gulp.dest(IMAGES_DIR_DEST))
    .pipe(browserSync.stream());
}
exports.convertToWebP = convertToWebP;
function bundleIcons() {
  return gulp
    .src(ICONS_SRC)
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: 'icon - bundle error',
          message: '<%= error.message %>',
        }),
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            dest: '.',
            sprite: 'icons.svg',
          },
        },
        shape: {
          transform: [
            {
              svgo: {
                plugins: [
                  { removeStyleElement: true },
                  { removeAttrs: { attrs: ['fill', 'data-name'] } },
                ],
              },
            },
          ],
        },
      })
    )
    .pipe(gulp.dest(IMAGES_DIR_DEST + '/common/'))
    .pipe(browserSync.stream());
}
exports.bundleIcons = bundleIcons;
const images = gulp.parallel(optimizeImages, convertToWebP, bundleIcons);
exports.images = images;

// Local Server
const browserSyncOptions = {
  proxy: 'localhost:' + process.env.LOCAL_SERVER_PORT,
  reloadOnRestart: true,
  open: false,
  notify: false,
  ghostMode: false,
  scrollProportionally: false,
};
function server(done) {
  browserSync.init(browserSyncOptions);

  done();
}
exports.server = server;
function reload(done) {
  browserSync.reload();

  done();
}

// Watch
function watch(done) {
  gulp.watch(VIEWS_SRC, gulp.series(styles, reload));
  gulp.watch([STYLES_SRC, './tailwind.config.js'], styles);
  gulp.watch(SCRIPTS_SRC, scripts);
  gulp.watch(IMAGES_SRC, optimizeImages);
  gulp.watch(IMAGES_SRC_WEBP, convertToWebP);
  gulp.watch(ICONS_SRC, bundleIcons);

  done();
}
exports.watch = watch;

// Build
exports.build = gulp.parallel(styles, scripts, images);

// Default
exports.default = gulp.parallel(server, watch);
