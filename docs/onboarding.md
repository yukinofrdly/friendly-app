# Claude Code 引き継ぎ手順書

このドキュメントは、ここまで作成した 4 つのドキュメントを Claude Code に持ち込んで実装フェーズを開始するための手順書です。

---

## 0. 事前準備

### 必要なアカウント

- [ ] **GitHub** アカウント (リポジトリ作成用)
- [ ] **Supabase** アカウント (DB / Auth / Storage)
- [ ] **Vercel** アカウント (デプロイ用)
- [ ] **Anthropic API** アカウント (Claude API キー)
- [ ] **ドメイン** (オプション、本番運用時)

### ローカル環境

- [ ] Node.js 20+ インストール
- [ ] pnpm インストール: `npm install -g pnpm`
- [ ] Claude Code インストール: 公式手順に従う

---

## 1. リポジトリ初期化

### 1.1 GitHub リポジトリ作成

GitHub で新規リポジトリを作成 (例: `friendly-app`)、ローカルにクローン。

```bash
git clone git@github.com:your-org/friendly-app.git
cd friendly-app
```

### 1.2 ドキュメント配置

このチャットで作成した4ファイルを `docs/` 配下に配置します:

```bash
mkdir -p docs/decisions
mkdir -p docs/demo
mkdir -p docs/proposals

# ファイル名を Claude Code から参照しやすい英語に
cp 01_要件定義書.md         docs/requirements.md
cp 02_データモデル設計書.md docs/data-model.md
cp 03_CLAUDE.md            CLAUDE.md
cp 04_design-tokens.md     docs/design-tokens.md

# デモ・提案書も保存
cp FRIENDLY_デモアプリ.html              docs/demo/demo-app.html
cp FRIENDLY_脱エクセル_提案書_v3.pptx    docs/proposals/proposal-v3.pptx
```

### 1.3 初期ファイル作成

```bash
# .gitignore
cat > .gitignore <<'EOF'
node_modules/
.next/
.env*.local
.env
*.log
.DS_Store
dist/
build/
coverage/
.vercel
EOF

# README.md (簡易版)
cat > README.md <<'EOF'
# FRIENDLY

中小企業向け AI 活用業務基幹システム。

## ドキュメント

- [要件定義書](./docs/requirements.md)
- [データモデル](./docs/data-model.md)
- [デザイントークン](./docs/design-tokens.md)
- [開発者向け指示書](./CLAUDE.md)

## セットアップ

(Claude Code でのセットアップ後に追記)
EOF

git add -A
git commit -m "chore: 初期ドキュメント設置"
git push
```

---

## 2. Claude Code 起動と最初のプロンプト

### 2.1 起動

```bash
cd friendly-app
claude
```

### 2.2 最初のプロンプト (これをコピペで実行)

````
このリポジトリで FRIENDLY という業務基幹システムを開発します。

まず以下を順に読んで、プロジェクトの全体像を把握してください:

1. CLAUDE.md (開発規約・コーディング原則)
2. docs/requirements.md (要件定義書)
3. docs/data-model.md (データモデル)
4. docs/design-tokens.md (UI トークン)

読み終わったら、以下を教えてください:

- このプロジェクトのコアバリュー (一言で)
- MVP で実装すべき機能の優先順位 (上位5つ)
- 採用予定の技術スタック
- 最初に着手すべきタスク (Phase 0 のセットアップ)

その後、Phase 0 のセットアップ計画を提示してください。承認したら着手します。
````

### 2.3 Claude Code から想定される応答

Claude Code は以下のような Phase 0 計画を出してきます:

```
Phase 0: プロジェクトセットアップ (推奨タスク順)

1. Next.js 15 プロジェクト初期化 (TypeScript + Tailwind + App Router)
2. shadcn/ui セットアップ
3. Supabase プロジェクト作成と接続
4. Drizzle ORM セットアップ
5. デザイントークンを tailwind.config.ts に反映
6. 認証フロー (Supabase Auth) の最小実装
7. 基本レイアウト (App Shell) の実装
8. GitHub Actions CI 設定
9. Vercel デプロイ設定

着手していいですか?
```

「OK、着手して」と返せば、Claude Code が順次実装していきます。

---

## 3. 推奨される進め方

### Step 1: Phase 0 のセットアップ (1週間想定)

Claude Code に丸投げで OK。完了したら以下を確認:

- [ ] `pnpm dev` で開発サーバーが起動する
- [ ] Supabase に接続できる
- [ ] ログイン画面が表示される (まだ機能しなくても OK)
- [ ] Vercel にデプロイされ、URL が生成されている

### Step 2: 認証・組織機能 (1-2週間)

```
次のタスクをお願いします:

requirements.md の機能一覧から、以下の P0 機能を実装してください:
- サインアップ / ログイン
- 組織 (テナント) 作成
- メンバー招待・ロール管理

実装前に画面・API・DB マイグレーションの計画を提示してください。
```

### Step 3: マスター系 + 案件 CRUD (2-3週間)

```
次は以下を実装してください:
- 顧客マスター CRUD
- 商品マスター CRUD
- 原価項目マスター CRUD
- 案件 CRUD (一覧・詳細・作成・編集)

案件は data-model.md の cases テーブルを参照。
カンバン UI と原価明細はまだ後回しで OK。まずはリスト + フォームで。
```

### Step 4: 案件カンバン + 粗利機能 (2-3週間)

```
次は本プロダクトのコア機能です:
- 案件カンバン UI (ドラッグ&ドロップ)
- 原価明細入力 (人件費・外注費・材料費)
- 粗利率自動計算と色分け表示
- 粗利推移ビュー (見積→受注→進行中→完了)

デモアプリ (docs/demo/demo-app.html) の UI パターンを参照してください。
```

### Step 5: 請求・入金 (2-3週間)

### Step 6: AI 機能組み込み (2週間)

```
AI 機能を実装します:
- 粗利アラート (ルールベース + Claude API での改善提案生成)
- AI 受注確率スコアリング
- AI 督促文面生成

Claude API のラッパーを src/lib/ai/ に作成、プロンプトは src/lib/ai/prompts/ に。
```

### Step 7: 外部連携 (1ヶ月)

freee / マネーフォワード OAuth + 仕訳同期。

---

## 4. Claude Code 活用のコツ

### 4.1 大きなタスクは分解させる

```
次は◯◯機能を実装したいです。
まず実装計画 (タスク分解 + ファイル一覧 + DB変更) を提示してください。
承認したら着手します。
```

### 4.2 不安なら段階確認

```
このマイグレーションを実行する前に、SQL を見せてください。
```

### 4.3 ドキュメント同期を忘れない

```
今回の機能追加で data-model.md に変更が必要な部分があれば更新してください。
```

### 4.4 リファクタリングも遠慮なく

```
src/server/services/case.ts が長くなってきたので、責務で分割してください。
```

### 4.5 テストも書かせる

```
この機能のテストを書いてください。Unit と Integration の両方で。
特に「他テナントのデータが見えない」テストは必須。
```

---

## 5. 想定 ROI・期間

| Phase | 期間 (個人開発) | 期間 (Claude Code 活用) |
|---|---|---|
| Phase 0: セットアップ | 1週間 | 1-2日 |
| Phase 1: MVP (認証〜請求) | 2-3ヶ月 | 1ヶ月 |
| Phase 2: AI機能 | 1ヶ月 | 2週間 |
| Phase 3: 外部連携 | 1ヶ月 | 2-3週間 |
| **合計** | **5-6ヶ月** | **2-3ヶ月** |

Claude Code の活用で **実装期間は通常の 1/2 程度** に圧縮できる想定です (技術選定済み・要件定義済みのため)。

---

## 6. このチャットで今後できる補助

実装はメインで Claude Code が担いますが、こちらのチャット (claude.ai) は以下で活用できます:

- **追加の UI モックアップ作成** (HTML プロトタイプを素早く)
- **クライアント向け追加資料作成** (PPT, PDF)
- **業種特化版のデモ作成** (建設業向け、士業向け 等)
- **AI プロンプトのチューニング** (粗利分析・督促文面など)
- **要件定義書の更新支援**
- **デザイン仕様の追加策定**
- **マーケティング資料 / LP 作成**

実装で行き詰まった時の壁打ち相手としても使えます。

---

## 7. 困った時のフォールバック

- **Claude Code が要件を誤解している場合** → `docs/requirements.md` の該当箇所を指摘
- **データモデルで悩んだ場合** → このチャットに戻って相談
- **デザインに迷った場合** → `docs/demo/demo-app.html` を Claude Code に見せる

---

## 8. 次の一歩

このドキュメント一式を Claude Code に持ち込み、まず **Phase 0** から始めましょう。

うまくいったら、また戻ってきて経過を共有してください。次の打ち手 (LP 制作、追加機能の要件詰め、ピッチ資料作成 等) を一緒に考えます。

**Happy Building! 🚀**
