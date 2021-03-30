'use strict';

/* eslint no-console: 0 */

/**
 * CONSTANTS
 */

// Common
const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const fibers = require('fibers');
const browserSync = require('browser-sync');
const config = require('./config');
require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV.trim().toLowerCase() === 'development';

// Styles
const sass = require('gulp-sass');
sass.compiler = require('sass');
const postcss = require('gulp-postcss');
const postCSSImport = require('postcss-import');
const postCSSReporter = require('postcss-reporter');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const stylelint = require('stylelint');
const scssParser = require('postcss-scss');

// Scripts
const esbuild = require('gulp-esbuild');

// Images
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');

/**
 * PATH
 */

// Views
const VIEWS_SRC = config.paths.THEME_ROOT + '/**/*.{php,twig}';

// Images
const IMAGES_DIR_SRC = config.paths.ASSETS_DIR_SRC + '/images';
const IMAGES_DIR_DEST = config.paths.ASSETS_DIR_DEST + '/images';
const IMAGES_SRC = IMAGES_DIR_SRC + '/**/*.{png,jpg,gif,svg}';
const ICONS_SRC = config.paths.ASSETS_DIR_SRC + '/icons/**/*.svg';

// Styles
const STYLES_DIR_SRC = config.paths.ASSETS_DIR_SRC + '/styles';
const STYLES_DIR_DEST = config.paths.ASSETS_DIR_DEST + '/styles';
const STYLES_SRC = STYLES_DIR_SRC + '/**/*.scss';

// Scripts
const SCRIPTS_DIR_SRC = config.paths.ASSETS_DIR_SRC + '/scripts';
const SCRIPTS_DIR_DEST = config.paths.ASSETS_DIR_DEST + '/scripts';
const SCRIPTS_SRC = SCRIPTS_DIR_SRC + '/**/*.js';

/**
 * TASKS
 */

// Styles
function styles() {
  const postcssConfig = [
    postCSSImport({
      path: ['node_modules'],
    }),
    autoprefixer(),
  ];
  if (!IS_DEV) {
    postcssConfig.push(
      cssnano({
        autoprefixer: false,
      }),
    );
  }

  return gulp
    .src(STYLES_SRC, { sourcemaps: IS_DEV })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: 'style - build error',
          message: '<%= error.message %>',
        }),
      }),
    )
    .pipe(
      postcss(
        [
          stylelint(),
          postCSSReporter({
            clearReportedMessages: true,
          }),
        ],
        { syntax: scssParser },
      ),
    )
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: ['node_modules/'],
        fiber: fibers,
      }),
    )
    .pipe(postcss(postcssConfig))
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
      }),
    )
    .pipe(gulp.dest(SCRIPTS_DIR_DEST))
    .pipe(browserSync.stream());
}
exports.scripts = scripts;

// Images
function optimizeImages() {
  return gulp
    .src(IMAGES_SRC, { since: gulp.lastRun(images) })
    .pipe(
      imagemin([
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
          plugins: [{ removeViewBox: false }],
        }),
      ]),
    )
    .pipe(gulp.dest(IMAGES_DIR_DEST))
    .pipe(browserSync.stream());
}
exports.optimizeImages = optimizeImages;
function bundleIcons() {
  return gulp
    .src(ICONS_SRC)
    .pipe(
      plumber({
        errorHandler: notify.onError({
          title: 'icon - bundle error',
          message: '<%= error.message %>',
        }),
      }),
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
                  { removeAttrs: { attrs: 'fill' } },
                ],
              },
            },
          ],
        },
      }),
    )
    .pipe(gulp.dest(IMAGES_DIR_DEST + '/common/'))
    .pipe(browserSync.stream());
}
exports.bundleIcons = bundleIcons;
const images = gulp.parallel(optimizeImages, bundleIcons);
exports.images = images;

// Local Server
const browserSyncOptions = {
  proxy: {
    target: 'localhost:' + process.env.LOCAL_SERVER_PORT,
  },
  reloadOnRestart: true,
  open: false,
  notify: false,
  scrollProportionally: false,
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
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
  gulp.watch(VIEWS_SRC, reload);
  gulp.watch(STYLES_SRC, styles);
  gulp.watch(SCRIPTS_SRC, scripts);
  gulp.watch(IMAGES_SRC, optimizeImages);
  gulp.watch(ICONS_SRC, bundleIcons);

  done();
}
exports.watch = watch;

// Build
exports.build = gulp.parallel(styles, scripts, images);

// Default
exports.default = gulp.parallel(server, watch);
