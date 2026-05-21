<?php
/**
 * Plugin Name: FRIENDLY HP
 * Description: FRIENDLY 公式サイト (LP) を WordPress 固定ページとして動かすための統合プラグイン。
 *              CSS/JS の読み込み、画像 URL の置換、お問い合わせフォーム送信処理を担当します。
 * Version:     1.0.0
 * Author:      FRIENDLY
 *
 * このファイルは mu-plugins (Must-Use Plugins) として動作することを想定しています。
 * 配置先: wp-content/mu-plugins/friendly-hp.php
 * アセット: wp-content/mu-plugins/friendly-hp-assets/ (CSS/JS/images)
 *
 * @package FriendlyHP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ============================================================
 * 設定値 — ここを編集すれば運用変更できます
 * ============================================================ */

if ( ! defined( 'FRIENDLY_HP_PAGE_SLUG' ) ) {
	// このスラッグの固定ページでのみアセットを読み込みます。
	// 例: 固定ページの URL が https://example.com/ なら 'home'、
	//     https://example.com/lp/ なら 'lp' を指定。
	define( 'FRIENDLY_HP_PAGE_SLUG', 'home' );
}

if ( ! defined( 'FRIENDLY_HP_MAIL_TO' ) ) {
	// お問い合わせメールの送信先 (複数指定可: 'a@x.com,b@x.com')
	define( 'FRIENDLY_HP_MAIL_TO', 'info@friendly.co.jp' );
}

if ( ! defined( 'FRIENDLY_HP_MAIL_SUBJECT' ) ) {
	define( 'FRIENDLY_HP_MAIL_SUBJECT', '【FRIENDLY HP】お問い合わせを受信しました' );
}

/* ============================================================
 * ヘルパー
 * ============================================================ */

/**
 * アセット (CSS/JS/images) の URL ベースを返す。
 *
 * @return string
 */
function friendly_hp_assets_url() {
	// mu-plugins 内のサブディレクトリ URL を生成。
	return plugins_url( 'friendly-hp-assets', __FILE__ );
}

/**
 * 現在のリクエストが「FRIENDLY HP の固定ページ」かを判定。
 *
 * @return bool
 */
function friendly_hp_is_target_page() {
	if ( ! is_page() ) {
		return false;
	}

	$slug = FRIENDLY_HP_PAGE_SLUG;

	// フロントページに設定されている場合の特例: スラッグが 'home' で
	// かつフロントページが固定ページならそれを対象とみなす。
	if ( 'home' === $slug && is_front_page() && 'page' === get_option( 'show_on_front' ) ) {
		return true;
	}

	return is_page( $slug );
}

/* ============================================================
 * アセット読み込み
 * ============================================================ */

add_action( 'wp_enqueue_scripts', 'friendly_hp_enqueue_assets' );
function friendly_hp_enqueue_assets() {
	if ( ! friendly_hp_is_target_page() ) {
		return;
	}

	$base = friendly_hp_assets_url();
	$ver  = '1.0.0';

	// Google Fonts (元 HTML の <head> から移植)
	wp_enqueue_style(
		'friendly-hp-fonts',
		'https://fonts.googleapis.com/css2?family=Keania+One&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:wght@100..900&family=Kdam+Thmor+Pro&display=swap',
		array(),
		null
	);

	// 本体 CSS
	wp_enqueue_style(
		'friendly-hp-styles',
		$base . '/styles.css',
		array( 'friendly-hp-fonts' ),
		$ver
	);

	// GSAP (CDN) — defer で読込み
	wp_enqueue_script( 'friendly-hp-gsap',           'https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/gsap.min.js',               array(), '3.14.1', true );
	wp_enqueue_script( 'friendly-hp-gsap-split',     'https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/SplitText.min.js',          array( 'friendly-hp-gsap' ), '3.14.1', true );
	wp_enqueue_script( 'friendly-hp-gsap-st',        'https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js',      array( 'friendly-hp-gsap' ), '3.14.1', true );
	wp_enqueue_script( 'friendly-hp-gsap-scramble',  'https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrambleTextPlugin.min.js', array( 'friendly-hp-gsap' ), '3.14.1', true );

	// 自前 JS
	wp_enqueue_script(
		'friendly-hp-debounced',
		$base . '/js/debounced.js',
		array(),
		$ver,
		true
	);
	wp_enqueue_script(
		'friendly-hp-script',
		$base . '/script.js',
		array(),
		$ver,
		true
	);
	wp_enqueue_script(
		'friendly-hp-animations',
		$base . '/js/animations.js',
		array( 'friendly-hp-gsap', 'friendly-hp-gsap-split', 'friendly-hp-gsap-st', 'friendly-hp-gsap-scramble', 'friendly-hp-debounced' ),
		$ver,
		true
	);
	wp_enqueue_script(
		'friendly-hp-contact',
		$base . '/js/contact.js',
		array(),
		$ver,
		true
	);
}

/* ============================================================
 * the_content フィルタ: プレースホルダ置換
 *   {{FR_ASSETS}}          → アセットの URL ベース
 *   {{FR_ADMIN_POST_URL}}  → /wp-admin/admin-post.php
 *   {{FR_NONCE}}           → nonce 値 (CSRF 対策)
 * ============================================================ */

add_filter( 'the_content', 'friendly_hp_replace_placeholders', 20 );
function friendly_hp_replace_placeholders( $content ) {
	if ( ! friendly_hp_is_target_page() ) {
		return $content;
	}

	$replacements = array(
		'{{FR_ASSETS}}'         => esc_url( friendly_hp_assets_url() ),
		'{{FR_ADMIN_POST_URL}}' => esc_url( admin_url( 'admin-post.php' ) ),
		'{{FR_NONCE}}'          => esc_attr( wp_create_nonce( 'friendly_hp_contact' ) ),
	);

	return strtr( $content, $replacements );
}

/**
 * WordPress のオートフォーマッタ (wpautop / wptexturize) が
 * 我々のセクション構造に余分な <p> や &#8220; を挿入するのを防ぐ。
 * 対象ページのみ無効化。
 */
add_filter( 'the_content', 'friendly_hp_disable_autop', 1 );
function friendly_hp_disable_autop( $content ) {
	if ( friendly_hp_is_target_page() ) {
		remove_filter( 'the_content', 'wpautop' );
		remove_filter( 'the_content', 'wptexturize' );
	}
	return $content;
}

/* ============================================================
 * お問い合わせフォーム送信処理
 *   - admin-post.php?action=friendly_hp_contact で受ける
 *   - nonce 検証 / honeypot / 必須項目チェック
 *   - 成功時: ?contact=success で元ページにリダイレクト
 *   - 失敗時: ?contact=error で元ページにリダイレクト
 * ============================================================ */

add_action( 'admin_post_nopriv_friendly_hp_contact', 'friendly_hp_handle_contact' );
add_action( 'admin_post_friendly_hp_contact',         'friendly_hp_handle_contact' );

function friendly_hp_handle_contact() {
	$redirect_base = wp_get_referer() ? wp_get_referer() : home_url( '/' );

	// CSRF nonce 検証
	if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( wp_unslash( $_POST['_wpnonce'] ), 'friendly_hp_contact' ) ) {
		wp_safe_redirect( add_query_arg( 'contact', 'error', $redirect_base ) . '#contact' );
		exit;
	}

	// Honeypot: bot は隠しフィールドを埋めるので、値が入っていたら破棄
	if ( ! empty( $_POST['fr_hp_website'] ) ) {
		// bot 判定。素直に成功っぽくリダイレクトしてもよいが、ここでは error 扱い。
		wp_safe_redirect( add_query_arg( 'contact', 'error', $redirect_base ) . '#contact' );
		exit;
	}

	// 入力値取得 (サニタイズ)
	$name    = isset( $_POST['name'] )    ? sanitize_text_field( wp_unslash( $_POST['name'] ) )    : '';
	$phone   = isset( $_POST['phone'] )   ? sanitize_text_field( wp_unslash( $_POST['phone'] ) )   : '';
	$email   = isset( $_POST['email'] )   ? sanitize_email( wp_unslash( $_POST['email'] ) )        : '';
	$company = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	$privacy = ! empty( $_POST['privacy'] );

	// 必須チェック
	if ( '' === $name || ! is_email( $email ) || '' === $message || ! $privacy ) {
		wp_safe_redirect( add_query_arg( 'contact', 'error', $redirect_base ) . '#contact' );
		exit;
	}

	// メール本文組み立て
	$body  = "FRIENDLY HP のお問い合わせフォームから送信されました。\n";
	$body .= "==============================\n";
	$body .= "お名前: {$name}\n";
	$body .= "会社名: {$company}\n";
	$body .= "電話番号: {$phone}\n";
	$body .= "メールアドレス: {$email}\n";
	$body .= "------------------------------\n";
	$body .= "お問い合わせ内容:\n{$message}\n";
	$body .= "==============================\n";
	$body .= "送信日時: " . date_i18n( 'Y-m-d H:i:s' ) . "\n";
	$body .= "送信元 IP: " . ( isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '-' ) . "\n";

	$to      = FRIENDLY_HP_MAIL_TO;
	$subject = FRIENDLY_HP_MAIL_SUBJECT;
	$headers = array(
		'Content-Type: text/plain; charset=UTF-8',
		'Reply-To: ' . sanitize_text_field( $name ) . ' <' . $email . '>',
	);

	$sent = wp_mail( $to, $subject, $body, $headers );

	// (任意) 送信者へ自動返信
	if ( $sent ) {
		$autoreply_body  = "{$name} 様\n\n";
		$autoreply_body .= "この度はFRIENDLYへお問い合わせいただき、誠にありがとうございます。\n";
		$autoreply_body .= "以下の内容で承りました。担当者より2営業日以内に折り返しご連絡いたします。\n\n";
		$autoreply_body .= "==============================\n";
		$autoreply_body .= "お名前: {$name}\n";
		$autoreply_body .= "会社名: {$company}\n";
		$autoreply_body .= "電話番号: {$phone}\n";
		$autoreply_body .= "メールアドレス: {$email}\n";
		$autoreply_body .= "------------------------------\n";
		$autoreply_body .= "お問い合わせ内容:\n{$message}\n";
		$autoreply_body .= "==============================\n\n";
		$autoreply_body .= "──────────────────────────────\n";
		$autoreply_body .= "FRIENDLY株式会社\n";
		$autoreply_body .= "〒169-0075 東京都新宿区高田馬場2丁目17-3 東京三協信用金庫本店ビル\n";
		$autoreply_body .= "TEL: 03-6822-5403\n";
		$autoreply_body .= "──────────────────────────────\n";

		wp_mail(
			$email,
			'【FRIENDLY】お問い合わせを受け付けました',
			$autoreply_body,
			array( 'Content-Type: text/plain; charset=UTF-8' )
		);
	}

	wp_safe_redirect( add_query_arg( 'contact', $sent ? 'success' : 'error', $redirect_base ) . '#contact' );
	exit;
}
