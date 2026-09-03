<?php
/**
 * テーマ用関数、定数
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package jun
 */

use Timber\Timber;

require_once __DIR__ . '/libs/manifest.php';

/**
 * ウェブフォントを読み込む
 */
function enqueue_webfonts() {
	// Google Fonts
	wp_enqueue_style(
		'google-fonts',
		'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap',
		array(),
		null
	);
}

// Googleフォントのpreconnectを追加
add_filter(
	'wp_resource_hints',
	function ( $urls, $relation_type ) {
		if ( $relation_type !== 'preconnect' ) {
			return $urls;
		}

		$urls[] = 'https://fonts.googleapis.com';
		$urls[] = array(
			'href' => 'https://fonts.gstatic.com',
			'crossorigin' => 'anonymous',
		);

		return $urls;
	},
	10,
	2
);


// フロントエンド向けスタイルを読み込み
add_action(
	'wp_enqueue_scripts',
	function () {
		enqueue_webfonts();

		$dev_manifest_json_path = path_join(
			get_stylesheet_directory(),
			'assets/manifest.dev.json'
		);

		$style_path = '';
		$script_path = '';
		if ( file_exists( $dev_manifest_json_path ) ) {
			$manifest = new Manifest( $dev_manifest_json_path );
			wp_enqueue_script(
				'vite',
				$manifest->get_asset_path( '@vite/client' ),
				array(),
				null,
				array( 'in_footer' => true )
			);
			$script_path = $manifest->get_asset_path( 'main' );
			$style_path = $manifest->get_asset_path( 'main.css' );
		} else {
			$manifest = new Manifest(
				path_join( get_stylesheet_directory(), 'assets/.vite/manifest.json' )
			);
			$script_path = $manifest->get_asset_path( 'src/scripts/main.js' );
			$style_path = $manifest->get_asset_path( 'src/styles/main.css' );
		}
		if ( ! empty( $script_path ) ) {
			wp_enqueue_script(
				'main',
				$script_path,
				array(),
				null,
				array( 'in_footer' => true )
			);
		}
		if ( ! empty( $style_path ) ) {
			wp_enqueue_style(
				'main',
				$style_path,
				array(),
				null
			);
		}
	},
	999
);

// ブロックエディタ向けスタイルを読み込み
add_action(
	'enqueue_block_assets',
	function () {
		if ( ! is_admin() ) {
			return;
		}

		enqueue_webfonts();

		$dev_manifest_json_path = path_join(
			get_stylesheet_directory(),
			'assets/manifest.dev.json'
		);
		$style_path = '';
		if ( file_exists( $dev_manifest_json_path ) ) {
			$manifest = new Manifest( $dev_manifest_json_path );
			$style_path = $manifest->get_asset_path( 'editor.css' );
		} else {
			$manifest = new Manifest(
				path_join( get_stylesheet_directory(), 'assets/.vite/manifest.json' )
			);
			$style_path = $manifest->get_asset_path( 'src/styles/editor.css' );
		}
		if ( ! empty( $style_path ) ) {
			wp_enqueue_style(
				'editor-content',
				$style_path,
				array(),
				null
			);
		}
	}
);

// Viteのスクリプトタグを変更
add_filter(
	'script_loader_tag',
	function ( $tag, $handle, $src ) {
		$target_handler = array( 'vite', 'main' );
		if ( in_array( $handle, $target_handler, true ) ) {
			if ( strpos( $tag, 'type=' ) !== false ) {
				$tag = str_replace( 'text/javascript', 'module', $tag );
			} else {
				$tag = preg_replace( '/<script\s/', '<script type="module" ', $tag );
			}
		}

		return $tag;
	},
	10,
	3
);

// テーマ設定
add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'block-template-parts' );

		// SNSリンクメニューの登録
		register_nav_menu(
			'social',
			'SNSリンク'
		);
	}
);

// カスタムブロックの登録
add_action(
	'init',
	function () {
		$blocks_dir = get_stylesheet_directory() . '/blocks';
		$manifest   = $blocks_dir . '/blocks-manifest.php';

		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) && file_exists( $manifest ) ) {
			wp_register_block_types_from_metadata_collection( $blocks_dir, $manifest );
		} elseif ( is_dir( $blocks_dir ) ) {
			$block_json_files = glob( $blocks_dir . '/*/block.json' );
			if ( $block_json_files ) {
				foreach ( $block_json_files as $block_json ) {
					register_block_type( dirname( $block_json ) );
				}
			}
		}
	}
);

// エディタ拡張（ブロックスタイル・リッチテキストフォーマット）
add_action(
	'enqueue_block_editor_assets',
	function () {
		$asset_path = get_stylesheet_directory() . '/blocks/editor.asset.php';
		if ( ! file_exists( $asset_path ) ) {
			return;
		}

		$asset = require $asset_path;
		wp_enqueue_script(
			'jun-editor',
			get_stylesheet_directory_uri() . '/blocks/editor.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
);

// 許可するブロック
add_filter(
	'allowed_block_types_all',
	function ( $allowed_blocks ) {
		// ページ編集権限のあるユーザーは全て使用可
		if ( current_user_can( 'edit_pages' ) ) {
			return $allowed_blocks;
		}

		return array(
			'core/paragraph',
			'core/heading',
			'core/list',
			'core/list-item',
			'core/quote',
			'core/table',
			'core/image',
			'core/gallery',
			'core/media-text',
			'core/buttons',
			'core/button',
			'core/columns',
			'core/group',
			'core/spacer',
			'core/embed',
			// 'jun/hgroup',
			// 'jun/def-list',
			// 'jun/def-list-item',
		);
	}
);

$theme_colors = array(
	'primary' => 'プライマリ',
	'secondary' => 'セカンダリ',
	'tertiary' => 'ターシャリ',
	'accent' => 'アクセント',
	'background' => '背景色',
	'background-secondary' => '背景色2',
	'foreground' => '文字色',
);

// カスタマイザに設定項目を追加
add_action(
	'customize_register',
	function ( $wp_customize ) use ( $theme_colors ) {
		// テーマカラー
		foreach ( $theme_colors as $key => $label ) {
			$wp_customize->add_setting( "theme_color_{$key}" );
			$wp_customize->add_control(
				new WP_Customize_Color_Control(
					$wp_customize,
					"theme_color_{$key}",
					array(
						'label' => $label . 'カラー',
						'section' => 'colors',
						'settings' => "theme_color_{$key}",
					)
				)
			);
		}

		// ロゴ画像
		$wp_customize->add_setting( 'logo' );
		$wp_customize->add_control(
			new WP_Customize_Media_Control(
				$wp_customize,
				'logo',
				array(
					'label' => 'ロゴ画像',
					'section' => 'title_tagline',
					'settings' => 'logo',
				)
			)
		);

		// apple-touch-icon画像
		$wp_customize->add_setting( 'touch_icon' );
		$wp_customize->add_control(
			new WP_Customize_Image_Control(
				$wp_customize,
				'touch_icon',
				array(
					'label' => 'apple-touch-icon画像',
					'section' => 'title_tagline',
					'settings' => 'touch_icon',
				)
			)
		);

		// OGP画像
		$wp_customize->add_setting( 'ogp_image' );
		$wp_customize->add_control(
			new WP_Customize_Image_Control(
				$wp_customize,
				'ogp_image',
				array(
					'label' => 'OGP画像',
					'description' => 'デフォルトのOGP画像を設定してください。',
					'section' => 'title_tagline',
					'settings' => 'ogp_image',
				)
			)
		);
	}
);

add_filter(
	'wp_theme_json_data_theme',
	function ( $theme_json ) use ( $theme_colors ) {
		// カスタマイザーで設定したカラーをtheme.jsonへマージ
		$custom_colors = array();
		foreach ( $theme_colors as $key => $label ) {
			$color = get_theme_mod( "theme_color_{$key}" );
			if ( empty( $color ) ) {
				continue;
			}

			$custom_colors[] = array(
				'name'  => $label . 'カラー',
				'slug'  => "theme-color-{$key}",
				'color' => $color,
			);
		}

		// カスタムカラーが空なら何もしない
		if ( empty( $custom_colors ) ) {
			return $theme_json;
		}

		$data = $theme_json->get_data();
		$palette = array_merge(
			$custom_colors,
			$data['settings']['color']['palette']['theme']
		);
		$data['settings']['color']['palette']['theme'] = $palette;

		return $theme_json->update_with( $data );
	}
);

// OGP画像パスを変更
add_filter(
	'inc2734_wp_seo_defult_ogp_image_url',
	function ( $image ) {
		if ( empty( $image ) ) {
			$theme_ogp = get_theme_mod( 'ogp_image' );
			if ( ! empty( $theme_ogp ) ) {
				return esc_url( $theme_ogp );
			}
		}

		return $image;
	}
);

// サイトアイコンメタタグの編集
add_filter(
	'site_icon_meta_tags',
	function ( $meta_tags ) {
		// Faviconのみにフィルタリング
		$meta_tags = array_filter(
			$meta_tags,
			function ( $meta_tag ) {
				return str_contains( $meta_tag, 'rel="icon"' );
			}
		);

		// カスタマイザーで追加されたapple-touch-iconを追加
		$theme_touch_icon = get_theme_mod( 'touch_icon' );
		if ( ! empty( $theme_touch_icon ) ) {
			$meta_tags[] =
				'<link rel="apple-touch-icon" href="' . esc_url( $theme_touch_icon ) . '" sizes="180x180" />';
		}

		return $meta_tags;
	}
);

// テンプレートへ渡す変数
add_filter(
	'timber/context',
	function ( $context ) {
		// ロゴ画像
		$theme_logo_media_id = get_theme_mod( 'logo' );
		if ( ! empty( $theme_logo_media_id ) ) {
			$context['logo'] = Timber::get_image( $theme_logo_media_id );
		}

		// エントリー
		$theme_entry_link = get_theme_mod( 'entry_link' );
		if ( ! empty( $theme_entry_link ) ) {
			$context['entry_link'] = $theme_entry_link;
		}
		$theme_entry_deadline = get_theme_mod( 'entry_deadline' );
		if ( ! empty( $theme_entry_deadline ) ) {
			$context['entry_deadline'] = new DateTime( $theme_entry_deadline, wp_timezone() );
		}

		// メニュー
		$menu = array();
		if ( isset( $context['menu'] ) ) {
			foreach ( $context['menu']->items as $key => $item ) {
				$menu[ $key ] = $item;
				$post = Timber::get_post( $item->object_id );

				$menu[ $key ]->title_en = $item->description ?: str_replace(
					array( '-', 'and' ),
					array( ' ', '&' ),
					$post->post_name ?: ''
				);
				if ( $item->object === 'page' ) {
					$menu[ $key ]->disabled = $post->post_status !== 'publish';
				} else {
					$menu[ $key ]->disabled = false;
				}
			}
		}
		$context['social_menu']  = Timber::get_menu( 'social' );

		// 英字タイトル
		$title_en = '';
		if ( is_404() ) {
			$title_en = 'Page not found';
		} else if ( is_singular( 'post' ) || is_home() || is_category() ) {
			$title_en = 'News';
		} else if ( is_page() ) {
			global $post;
			$title_en = str_replace(
				array( '-', 'and' ),
				array( ' ', '&' ),
				$post->post_name
			);
		} else if ( is_singular() || is_post_type_archive() ) {
			global $post_type;
			$cpt = get_post_type_object( $post_type );
			$cpt_name = $cpt->name;
			$title_en = str_replace( '-', ' ', $cpt_name );
		}

		$context['title_en'] = $title_en;

		return $context;
	},
	11,
	2
);

// ブロックの設定を変更
add_filter(
	'register_block_type_args',
	function ( $args, $block_type ) {
		if ( $block_type === 'core/heading' ) {
			$args['attributes']['levelOptions']['default'] = array( 2, 3, 4, 5 );
		}

		// コアブロックのスタイルを除去
		$unregister_styles = array(
			'core/quote' => array( 'plain' ),
			'core/image' => array( 'rounded' ),
			'core/table' => array( 'stripes' ),
			'core/button' => array( 'outline', 'fill' ),
		);
		if ( ! empty( $args['styles'] ) && isset( $unregister_styles[ $block_type ] ) ) {
			$args['styles'] = array_values(
				array_filter(
					$args['styles'],
					function ( $style ) use ( $unregister_styles, $block_type ) {
						return ! in_array( $style['name'], $unregister_styles[ $block_type ], true );
					}
				)
			);
		}

		return $args;
	},
	10,
	2
);

// ブロックスタイルの登録
add_action(
	'init',
	function () {
		register_block_style(
			'core/paragraph',
			array(
				'name' => 'lead',
				'label' => 'リード文',
			)
		);
		register_block_style(
			'core/paragraph',
			array(
				'name' => 'annotation',
				'label' => '注釈',
			)
		);
	}
);

// 投稿のラベル
add_filter(
	'register_post_type_args',
	function ( $args, $post_type ) {
		if ( $post_type === 'post' ) {
			$args['labels']['name'] = '新着情報';
		}

		return $args;
	},
	10,
	2
);

// タイトル
add_filter(
	'jun_page_title',
	function ( $title ) {
		if ( is_home() ) {
			$cpt = get_post_type_object( 'post' );

			return $cpt->label;
		}

		return $title;
	}
);

// 本文をminify
add_filter(
	'the_content',
	function ( $content ) {
		return preg_replace( '/\s+/', ' ', $content );
	}
);

// 抜粋
add_filter(
	'timber/post/excerpt/defaults',
	function ( $defaults ) {
		$defaults['read_more'] = '';

		return $defaults;
	}
);

/**
 * 画像パスを取得する
 *
 * @param   string $path  `images/` からの相対パス
 *
 * @return  string         絶対パス
 */
function get_image_path( $path ) {
	static $manifest = null;

	if ( $manifest === null ) {
		$manifest = new Manifest(
			path_join( get_stylesheet_directory(), 'assets/images/manifest.json' )
		);
	}

	if ( $manifest instanceof Manifest ) {
		return $manifest->get_asset_path( 'images/' . $path );
	}

	return path_join( get_stylesheet_directory_uri(), 'assets/images/' . $path );
}

// 画像サイズ
add_image_size( 'thumbnail', 600, 600, true );
add_image_size( 'medium', 960 );
add_image_size( 'large', 1920 );
add_filter(
	'intermediate_image_sizes_advanced',
	function ( $sizes ) {
		unset( $sizes['medium_large'] );
		unset( $sizes['1536x1536'] );
		unset( $sizes['2048x2048'] );

		return $sizes;
	}
);
