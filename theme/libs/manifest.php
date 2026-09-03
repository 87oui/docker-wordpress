<?php
/**
 * マニフェストファイルに関するクラス
 */

/**
 * マニフェストファイルに関するクラス
 */
class Manifest {
	/**
	 * マニフェストファイルの内容
	 *
	 * @var array
	 */
	public $manifest;

	/**
	 * コンストラクタ
	 *
	 * @param   string $manifest_json_path  マニフェストファイルへの絶対パス
	 *
	 * @return  void
	 */
	public function __construct( $manifest_json_path ) {
		if ( file_exists( $manifest_json_path ) ) {
			$this->manifest = json_decode( file_get_contents( $manifest_json_path ), true );
		} else {
			$this->manifest = array();
		}
	}

	/**
	 * アセットのパスを取得する
	 *
	 * @param   string $name  マニフェストファイルのキー
	 *
	 * @return  string         アセットへの絶対パス
	 */
	public function get_asset_path( $name ) {
		$path = path_join( get_stylesheet_directory_uri(), 'assets/' . $name );

		if ( ! empty( $this->manifest ) ) {
			if ( isset( $this->manifest['url'] ) ) {
				if ( isset( $this->manifest['inputs'][ $name ] ) ) {
					$path = $this->manifest['url'] . $this->manifest['inputs'][ $name ];
				} else {
					$path = $this->manifest['url'] . $name;
				}
			} else if ( isset( $this->manifest[ $name ]['file'] ) ) {
				$path = path_join(
					get_stylesheet_directory_uri(),
					'assets/' . $this->manifest[ $name ]['file']
				);
			}
		}

		return $path;
	}
}
