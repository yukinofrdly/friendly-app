# MAINTENANCE.md — 運用・修正ガイド

このドキュメントは「**今後コンテンツが変わっていく**」前提で、**誰が・どこを・どう触ればよいか**をまとめたものです。

---

## 編集対象の早見表

| やりたいこと | 編集するファイル | 編集方法 |
|---|---|---|
| 文言の修正 (見出し・本文) | 固定ページ本文 | 管理画面 → 固定ページ → 編集 |
| FAQ の追加・削除 | 固定ページ本文 | 同上 |
| 事例の追加・差し替え | 固定ページ本文 + 画像 | 同上 + FTP 等で画像配置 |
| 会社概要の修正 | 固定ページ本文 | 同上 |
| デザイン (色・余白) の調整 | `mu-plugins/friendly-hp-assets/styles.css` | FTP 等でアップロード |
| ロゴ・写真の差し替え | `mu-plugins/friendly-hp-assets/images/` | 同上 |
| フォーム送信先メアド | `mu-plugins/friendly-hp.php` の `FRIENDLY_HP_MAIL_TO` | 同上 |
| 固定ページのスラッグ | 管理画面 + `mu-plugins/friendly-hp.php` の `FRIENDLY_HP_PAGE_SLUG` | 両方を同じ値に |

---

## 1. 文言を直したい (一番よくある作業)

1. 管理画面 → **固定ページ** → 該当ページの **編集**
2. ブロックエディタの場合: 右上「︙」→ **コードエディター** に切替
3. 該当箇所のテキストを修正
4. **更新**

### 修正してよい・いけないものの目安

- ✅ 修正してよい: `<p>` `<span>` `<h2>` `<h3>` `<a>` `<li>` の中身 (テキスト)
- ⚠️ 注意: `class="..."` の値 (デザインに直結するので変えない)
- ❌ 触らない:
  - `{{FR_ASSETS}}`, `{{FR_ADMIN_POST_URL}}`, `{{FR_NONCE}}` のプレースホルダ
  - `<form>` 内の `<input type="hidden" ...>` 3 つ
  - honeypot の `<div class="fr-hp-hp-field">` 部分

---

## 2. 画像の差し替え

### 既存画像をそのまま差し替える場合

1. 新しい画像を **同じファイル名** で用意
2. FTP / SFTP で `wp-content/mu-plugins/friendly-hp-assets/images/` 配下に上書きアップロード
3. ブラウザのキャッシュをクリアして確認 (Ctrl+F5)

### 新しいファイル名で差し替える場合

1. 新しい画像を `wp-content/mu-plugins/friendly-hp-assets/images/` にアップロード
2. 管理画面で固定ページのコードエディターを開く
3. 該当する `<img src="{{FR_ASSETS}}/images/古いファイル名.png">` を **新しいファイル名** に書き換える
4. **更新**

> 💡 画像は `images/` 直下、または用意済みの `images/case-studies/`・`images/contact/`・`images/project-progress/` 等のサブフォルダに置けます。

### 推奨画像サイズ

| 用途 | 推奨幅 | 形式 |
|---|---|---|
| ロゴ系 (LogoSm, LogoXl, Logo-footer) | 元と同じ | PNG (透過) |
| 事例 (case_studies_*) | 800px 以上 | PNG / JPG |
| 背景・装飾 (Layer_1, Layer_2, Solution-Bg 等) | 元と同じ | PNG / SVG |

---

## 3. 事例 (CASE STUDIES) を追加・削除する

固定ページ本文の `<section id="case-studies">` 内、`<div class="cases-grid">` の中に **`<div class="case-card">` のブロックをコピペ**します。

### 追加するテンプレート

```html
<div class="case-card">
    <span class="card-bg"></span>
    <h3 class="case-title">ここに事例タイトル</h3>
    <div class="case-tags">
        <span class="case-tag">タグ名 (例: COO代行・経営BPO)</span>
    </div>
    <div class="case-image">
        <img src="{{FR_ASSETS}}/images/case-studies/case_studies_7.png" alt="case-study-7">
    </div>
    <span class="case-description">
        ここに事例の説明文を入れます。
    </span>
</div>
```

→ `<div class="case-bg-props bg-img-animation"></div>` の **直前** に挿入してください。

---

## 4. FAQ を追加・削除する

`<div id="faq" class="faq">` 内の `<div class="faq-list">` の中で、`<div class="faq-item lists-animation">` をコピペ。

### 追加するテンプレート

```html
<div class="faq-item lists-animation">
    <span class="faq-bg"></span>
    <div class="faq-question scrambletext-animation">
        <span>Q.　ここに質問文</span>
        <span class="faq-toggle">+</span>
    </div>
    <div class="faq-answer">
        <p>A.　ここに回答文</p>
    </div>
</div>
```

---

## 5. お問い合わせフォームの送信先・件名を変更する

`wp-content/mu-plugins/friendly-hp.php` の冒頭を編集:

```php
if ( ! defined( 'FRIENDLY_HP_MAIL_TO' ) ) {
    define( 'FRIENDLY_HP_MAIL_TO', 'info@friendly.co.jp' );  // ← ここを変更
}

if ( ! defined( 'FRIENDLY_HP_MAIL_SUBJECT' ) ) {
    define( 'FRIENDLY_HP_MAIL_SUBJECT', '【FRIENDLY HP】お問い合わせを受信しました' );  // ← 件名
}
```

**複数アドレスへ送信する場合**: `'a@friendly.co.jp,b@friendly.co.jp'` のようにカンマ区切り。

---

## 6. プライバシーポリシーページへリンクする

1. WordPress 管理画面 → **設定** → **プライバシー** で公式のプライバシーポリシー固定ページを作成 (推奨)
2. 固定ページ本文を開いて以下 2 箇所を修正:
   - **チェックボックス横のリンク** (`<div class="contact-form-group-privacy">` 内):
     ```html
     <a href="/privacy-policy/" target="_blank" rel="noopener">個人情報の取扱い</a>
     ```
   - **フッターの「プライバシーポリシー」**:
     ```html
     <a href="/privacy-policy/">プライバシーポリシー</a>
     ```

`/privacy-policy/` の部分は実際の URL に合わせて変更してください。

---

## 7. デザイン (色・サイズ) を調整する

`mu-plugins/friendly-hp-assets/styles.css` を編集。

### よく変更したい値

| 何 | 検索する文字列 | 現在値 |
|---|---|---|
| ナビバーの背景色 | `.navbar` の `background` | `#fae22b` (黄色) |
| 全体の文字色 | `body` の `color` | `#111f30` (濃紺) |
| 最大幅 | `.container { max-width:` | `1440px` |

> 💡 SCSS で書きたい場合は元ファイル `Friendly_HP-Updated/styles.scss` を改修して、`sass` でコンパイル後 `styles.css` を上書き。

---

## 8. フォームを別プラグインに変更する (将来の選択肢)

### 案 A: Contact Form 7 に乗り換える

1. **Contact Form 7** プラグインをインストール・有効化
2. 管理画面 → **お問い合わせ** で新規フォーム作成 (元のフォームと同じフィールド名にする)
3. 発行されたショートコード (`[contact-form-7 id="123" title="..."]`) をコピー
4. 固定ページ本文の `<form class="contact-form" ...>...</form>` 全体を**ショートコード 1 行に置換**
5. デザインを保ちたい場合: CF7 が出力する HTML に対して `styles.css` のクラスを当てる調整が必要

> ⚠️ Contact Form 7 に切替えた場合、`mu-plugin` のフォーム送信処理 (`friendly_hp_handle_contact`) は使われなくなりますが、残しておいて問題ありません。

### 案 B: 外部 SaaS (Formspree 等) に切替え

1. Formspree でアカウント作成 → 専用エンドポイント URL を取得
2. 固定ページ本文の `<form class="contact-form" method="post" action="{{FR_ADMIN_POST_URL}}">` を `action="https://formspree.io/f/xxxxxxx"` に変更
3. `<input type="hidden" name="action" ...>` と `<input type="hidden" name="_wpnonce" ...>` の 2 行は削除
4. これだけで送信先が Formspree 経由に切替わる

---

## 9. トラブルシューティング

### 画像が表示されない (404)

- ブラウザ DevTools (F12) → Network タブ → 404 になっている URL を確認
- URL が `wp-content/mu-plugins/friendly-hp-assets/images/...` を指しているか?
- そのパスに実ファイルがあるか?

### アニメーションが動かない

- ブラウザ DevTools → Console タブ → 赤いエラー
- 「`gsap is not defined`」→ CDN 読み込み失敗。社内 NW が CDN をブロックしていないか確認、または GSAP をローカルに保存してパス変更
- 「`SplitText is not a constructor`」→ GSAP のプラグイン読み込み順がズレている可能性。`mu-plugin` の `friendly_hp_enqueue_assets()` 内の wp_enqueue_script の順番が変わっていないか確認

### お問い合わせ送信後にエラーバナーが出る

- スパム判定 (honeypot) を疑う前に、ブラウザ DevTools → Network タブで `admin-post.php` のレスポンスを確認
- 送信先メアドが間違っていないか
- サーバが SMTP 経由で送信できる設定か (`WP Mail SMTP` 推奨)
- 必須項目 (お名前・メール・お問い合わせ内容・同意) がすべて埋まっているか

### 「クラシックエディタに貼ったらタグが消えた」

- ビジュアル/テキスト切替え時に WordPress が独自整形をかけることがあります
- 対策: **本文を貼る時は必ず「テキスト」タブ (HTML)** に貼り、貼った後はビジュアルタブに切替えない
- ブロックエディタ (Gutenberg) の「コードエディター」モードは整形されにくいため、こちらを推奨

### 「テーマのヘッダー/フッターが二重で表示される」

- お使いのテーマに「**フルワイドテンプレート**」「**コンテンツのみ**」「**Blank**」などのページテンプレートがあれば選択
- 無い場合: テーマフォルダ直下に `page-blank.php` を作成:

```php
<?php
/* Template Name: Blank (FRIENDLY HP 用) */
get_header();  // ヘッダーは残す場合
?>
<div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">
        <?php while ( have_posts() ) : the_post(); the_content(); endwhile; ?>
    </main>
</div>
<?php get_footer(); // 不要なら削除 ?>
```

→ 固定ページ編集画面で「テンプレート」として選択可能になる

---

## 10. 編集者向けチートシート (印刷推奨)

```
■ 文言修正の流れ
  1. WP管理画面 → 固定ページ → FRIENDLY → 編集
  2. ブロックエディタ右上「︙」→ コードエディター
  3. 編集 → 更新
  4. プレビューで確認

■ 触ってはいけないもの
  □ {{FR_ASSETS}}
  □ {{FR_ADMIN_POST_URL}}
  □ {{FR_NONCE}}
  □ <form> の hidden input 3つ
  □ class="..." の値
  □ <span class="fr-hp-hp-field"> (スパム対策)

■ 画像差し替えの流れ
  1. 同じファイル名で新画像を用意
  2. FTPで /wp-content/mu-plugins/friendly-hp-assets/images/ に上書き
  3. ブラウザを Ctrl+F5 でリロード
```
