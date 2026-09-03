<?php
/**
 * The base configuration for WordPress
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// phpcs:disable WordPress.Security.ValidatedSanitizedInput -- $_ENVはサニタイズ不要なため無視

$dir = dirname( __DIR__ );
$public_html = file_exists( $dir . '/vendor/autoload.php' ) ? $dir : $dir . '/public_html';

require_once $public_html . '/vendor/autoload.php';

if ( file_exists( $public_html . '/.env' ) ) {
	$dotenv = Dotenv\Dotenv::createImmutable( $public_html );
	$dotenv->load();
}

define( 'DB_NAME', $_ENV['DB_NAME'] );
define( 'DB_USER', $_ENV['DB_USER'] );
define( 'DB_PASSWORD', $_ENV['DB_PASSWORD'] );
define( 'DB_HOST', $_ENV['DB_HOST'] );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/**
 * Secret key
 *
 * @link https://api.wordpress.org/secret-key/1.1/salt/
 */
define( 'AUTH_KEY', '' );
define( 'SECURE_AUTH_KEY', '' );
define( 'LOGGED_IN_KEY', '' );
define( 'NONCE_KEY', '' );
define( 'AUTH_SALT', '' );
define( 'SECURE_AUTH_SALT', '' );
define( 'LOGGED_IN_SALT', '' );
define( 'NONCE_SALT', '' );

/**
 * Database Table prefix
 */
// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
$table_prefix = 'wp_';

/**
 * debugging mode
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_ENVIRONMENT_TYPE', $_ENV['WP_ENVIRONMENT_TYPE'] ?? 'production' );
define(
	'WP_DEBUG',
	in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'development' ) )
);
define( 'DISALLOW_FILE_MODS', true );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
define( 'WP_POST_REVISIONS', 3 );
define( 'ACF_PRO_LICENSE', $_ENV['PLUGIN_ACF_KEY'] );

/**
 * Absolute path to the WordPress directory.
*/
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', $public_html . '/' );
}

/**
 * Sets up WordPress vars and included files.
*/
require_once ABSPATH . 'wp-settings.php';
