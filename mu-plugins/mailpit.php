<?php

if ( wp_get_environment_type() === 'local' ) {
	define( 'WPMS_ON', true );
	define( 'WPMS_SMTP_HOST', 'mailpit' );
	define( 'WPMS_SMTP_PORT', 1025 );
	define( 'WPMS_SSL', '' );
	define( 'WPMS_SMTP_AUTH', false );
	define( 'WPMS_SMTP_AUTOTLS', false );
	define( 'WPMS_MAILER', 'smtp' );
}
