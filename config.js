// Root
const DOCUMENT_ROOT = 'project/public/';
const WP_THEME_NAME = 'my-theme';
const THEME_ROOT = `project/themes/${WP_THEME_NAME}`;

// Assets
const ASSETS_DIR_SRC = `sources`;
const ASSETS_DIR_DEST = `${THEME_ROOT}/assets`;

const config = {
  paths: {
    DOCUMENT_ROOT,
    THEME_ROOT,
    ASSETS_DIR_SRC,
    ASSETS_DIR_DEST,
  },
};

module.exports = config;
