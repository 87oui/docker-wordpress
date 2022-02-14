<?php

// 開発環境ならMailhogを利用する
if ( WP_DEBUG ) {
	define( 'WPMS_ON', true );
	define( 'WPMS_SMTP_HOST', 'mailhog' ); // The SMTP mail host.
	define( 'WPMS_SMTP_PORT', 1025 ); // The SMTP server port number.
	define( 'WPMS_SSL', '' ); // Possible values '', 'ssl', 'tls' - note TLS is not STARTTLS.
	define( 'WPMS_SMTP_AUTH', false ); // True turns it on, false turns it off.
	define( 'WPMS_SMTP_AUTOTLS', false ); // True turns it on, false turns it off.
	define( 'WPMS_MAILER', 'smtp' );
}
