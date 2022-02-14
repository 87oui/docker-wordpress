<?php
/**
 * テーマ用関数、定数
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package jun
 */

// CSSやJavascriptを読み込む
add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_style(
			'theme',
			get_stylesheet_directory_uri() . '/assets/styles/style.css',
			array(),
			get_version( '/assets/styles/style.css' )
		);
		if ( ! is_single() ) {
			wp_deregister_style( 'wp-block-library' );
		}
		if ( ! is_page( 'contact' ) ) {
			wp_deregister_style( 'snow-monkey-forms' );
		}
		wp_deregister_style( 'snow-monkey-forms/text' );
		wp_deregister_style( 'snow-monkey-forms/checkboxes' );
		wp_deregister_style( 'snow-monkey-forms/file' );
		wp_deregister_style( 'snow-monkey-forms/item' );
		wp_deregister_style( 'snow-monkey-forms/radio-buttons' );
		wp_deregister_style( 'snow-monkey-forms/select' );
		wp_deregister_style( 'snow-monkey-forms/textarea' );

		if ( ! is_admin() ) {
			wp_deregister_script( 'jquery' );
		}
		wp_enqueue_script(
			'theme',
			get_stylesheet_directory_uri() . '/assets/scripts/script.js',
			array(),
			get_version( '/assets/scripts/script.js' ),
			true
		);
	}
);

// ブロックエディタにCSSを適用
add_action(
	'enqueue_block_editor_assets',
	function() {
		wp_enqueue_style(
			'theme-editor',
			get_stylesheet_directory_uri() . '/assets/styles/editor-style.css',
			array(),
			get_version( '/assets/styles/editor-style.css' )
		);
	}
);

// p/br要素の自動挿入を停止
remove_filter( 'the_content', 'wpautop' );
remove_filter( 'the_excerpt', 'wpautop' );

// postのスラッグ、ラベルを設定
define( 'POST_TYPE_DEFAULT_SLUG', 'information' );
define( 'POST_TYPE_DEFAULT_LABEL', 'お知らせ' );

// 管理画面メニュー
add_action(
	'admin_menu',
	function() {
		// 管理者以外に不要なメニューを非表示
		if ( ! current_user_can( 'administrator' ) ) {
			remove_menu_page( 'index.php' );
			remove_menu_page( 'edit-comments.php' );
			remove_menu_page( 'edit.php?post_type=page' );
			remove_menu_page( 'edit.php?post_type=snow-monkey-forms' );
			remove_menu_page( 'tools.php' );
		}
	},
	999
);

// Timberへ値を渡す
add_filter(
	'timber/context',
	function( $context ) {
		// グローバルメニュー
		$context['menu'] = new \Timber\Menu();

		// 下層タイトル
		$lower_title = '';
		if ( is_post_type_archive( 'post' ) || is_singular( 'post' ) ) {
			$lower_title = POST_TYPE_DEFAULT_LABEL;
		} elseif ( is_page() ) {
			global $post;
			$lower_title = $post->post_title;
		} elseif ( is_404() ) {
			$lower_title = 'ページが見つかりませんでした';
		}
		$context['lower_title'] = $lower_title;

		$lower_title_en = '';
		if ( is_post_type_archive( 'post' ) || is_singular( 'post' ) ) {
			$lower_title_en = POST_TYPE_DEFAULT_SLUG;
		} elseif ( is_page() ) {
			global $post;
			$lower_title_en = $post->post_name;
		} elseif ( is_404() ) {
			$lower_title_en = 'not found';
		}
		$context['lower_title_en'] = $lower_title_en;

		return $context;
	}
);

// パンくずリスト設定
add_filter(
	'inc2734_wp_breadcrumbs',
	function( $items ) {
		if ( empty( $items ) ) {
			return $items;
		}

		if ( is_post_type_archive( 'post' ) || is_singular( 'post' ) ) {
			// 投稿のカテゴリパンくずを除去
			unset( $items[1] );
			$items = array_values( $items );
		}

		return $items;
	}
);

// 画像アップロード時の不要なリサイズ処理をやめる
add_filter(
	'intermediate_image_sizes_advanced',
	function( $sizes ) {
		unset( $sizes['medium_large'] );
		unset( $sizes['1536x1536'] );
		unset( $sizes['2048x2048'] );

		return $sizes;
	}
);
add_filter( 'big_image_size_threshold', '__return_false' );
