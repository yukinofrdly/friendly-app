# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際の指示書です。
新しいセッションを始めるたびに、まずこのファイルと `docs/` 配下のドキュメントを読み込んでください。

---

## プロジェクト概要

**FRIENDLY** (仮称) は、中小企業向けの AI 活用業務基幹システムです。

エクセル運用に起因する以下の課題を解決します:
- 売上は見えるが、案件別の原価・粗利が見えない
- 受注前に粗利率の判定ができない (「赤字受注」が発生)
- 月末の請求書発行・入金消込・督促が手作業
- 経営判断に必要な数字がリアルタイムに見えない

**最重要バリュー**: 「売上 + 原価 + 粗利を、受注前から一気通貫で見える化」

---

## ドキュメント参照優先順位

作業開始時、または不明点が出た時は以下を順に確認してください:

1. **このファイル (CLAUDE.md)** — プロジェクト規約・コーディング原則
2. **`docs/requirements.md`** — 要件定義書 (機能仕様)
3. **`docs/data-model.md`** — データモデル設計 (スキーマ・RLS)
4. **`docs/design-tokens.md`** — UI デザイントークン
5. **`docs/api.md`** — API 仕様 (実装後に整備)
6. **`docs/decisions/`** — ADR (Architecture Decision Records)

---

## 技術スタック

### 推奨スタック (要件次第で変更可)

```
Frontend:
  - Next.js 15 (App Router)
  - TypeScript (strict)
  - Tailwind CSS v4
  - shadcn/ui (Radix UI ベース)
  - TanStack Query (Server State)
  - Zustand (Client State、必要に応じて)
  - React Hook Form + Zod
  - Recharts / Tremor (チャート)
  - dnd-kit (ドラッグ&ドロップ、カンバン用)

Backend:
  - Next.js Route Handlers (API)
  - Supabase (PostgreSQL + Auth + Storage + Realtime)
  - Drizzle ORM
  - Zod (バリデーション、フロント/バック共有)

AI:
  - Anthropic Claude API (claude-opus-4-7 推奨、コスト要件次第で sonnet-4-6)
  - Vercel AI SDK (streaming UI)

Infra / DevOps:
  - Vercel (Frontend)
  - Supabase Cloud (DB / Auth / Storage)
  - GitHub Actions (CI/CD)
  - Playwright (E2E)
  - Vitest (Unit/Integration)
```

### 採否の判断軸

- **シンプルさ優先**: 新しい技術より、Next.js + Supabase + Drizzle の組み合わせで完結させる
- **モノレポは MVP では避ける**: 単一の Next.js プロジェクトで開始
- **状態管理は最小限**: TanStack Query + URL state を最初に試し、必要なら Zustand 追加

---

## ディレクトリ構成

```
.
├── CLAUDE.md                 # このファイル
├── README.md
├── docs/
│   ├── requirements.md       # 要件定義書
│   ├── data-model.md         # データモデル設計
│   ├── design-tokens.md      # デザイントークン
│   ├── api.md                # API 仕様
│   └── decisions/            # ADR
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # ログイン・サインアップ (未認証)
│   │   ├── (app)/            # 認証必須のメインアプリ
│   │   │   ├── dashboard/
│   │   │   ├── cases/
│   │   │   ├── customers/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── settings/
│   │   └── api/              # Route Handlers
│   ├── components/
│   │   ├── ui/               # shadcn/ui ベース
│   │   ├── features/         # 機能別コンポーネント
│   │   └── layouts/
│   ├── lib/
│   │   ├── db/               # Drizzle スキーマ・クライアント
│   │   ├── auth/             # Supabase Auth ヘルパー
│   │   ├── api/              # API クライアント (フロント側)
│   │   ├── ai/               # Claude API ラッパー
│   │   ├── utils/            # 汎用ユーティリティ
│   │   └── validations/      # Zod スキーマ
│   ├── server/
│   │   ├── services/         # ビジネスロジック
│   │   └── repositories/     # DB アクセス層
│   └── types/                # 共有型定義
├── db/
│   ├── migrations/           # Drizzle マイグレーション
│   ├── seed/                 # シードデータスクリプト
│   └── schema.ts             # Drizzle スキーマ定義
├── tests/
│   ├── e2e/                  # Playwright
│   └── unit/                 # Vitest
└── public/
```

---

## デザイントークン (重要)

UI 実装時はこのトークンを **必ず** 使用してください。提案デモで確立済みです。

### カラーパレット

```css
/* Brand */
--navy:        #0E2A4A;  /* Primary - 信頼・専門性 */
--navy-deep:   #061528;  /* Darker variant */
--navy-soft:   #1B3A5C;
--teal:        #00A6A6;  /* Secondary - AI・革新 */
--teal-light:  #33C3C3;
--teal-50:     #E6F7F7;
--coral:       #FF6B47;  /* Accent - エネルギー・警告 */
--coral-light: #FF9277;
--coral-50:    #FFF0EC;

/* Cost categories (原価項目の色) */
--cost-personnel: #5B6CFF;  /* 人件費 */
--cost-outsource: #FF6B47;  /* 外注費 (coral と同じ) */
--cost-material:  #00A6A6;  /* 材料費 (teal と同じ) */
--cost-expense:   #6B7280;  /* 経費 */

/* Margin status (粗利率の状態) */
--margin-good: #10B981;  /* 20%以上 = 健全 */
--margin-mid:  #F59E0B;  /* 15-20% = 注意 */
--margin-bad:  #EF4444;  /* 15%未満 = 危険 */

/* Neutral */
--bg:          #F7F9FC;
--surface:     #FFFFFF;
--border:      #E5E7EB;
--border-soft: #F0F2F5;
--text:        #1A2B4C;
--text-body:   #374151;
--text-muted:  #6B7280;
--text-faint:  #9CA3AF;
```

### タイポグラフィ

```
Font Family: 'Noto Sans JP', 'Yu Gothic', 'メイリオ', sans-serif
Mono:        'JetBrains Mono', 'Consolas', monospace (金額表示用)

Weight: 400 (regular), 500 (medium), 700 (bold), 900 (black for hero)
```

### コンポーネントスタイル指針

- **Border Radius**: 4px (sm), 6px (default), 8px (lg), 12px (xl)
- **Shadow**:
  - sm: `0 1px 2px rgba(14,42,74,0.06)`
  - default: `0 4px 12px rgba(14,42,74,0.08)`
  - lg: `0 12px 32px rgba(14,42,74,0.14)`
- **Transition**: `180ms cubic-bezier(0.4, 0, 0.2, 1)` をデフォルトに

### 重要な UI パターン

1. **粗利率の色分け表示**: 必ず `margin-good/mid/bad` を使う。閾値はテナント設定の `target_margin_rate` を参照
2. **金額表示**: `JetBrains Mono` で、桁区切りカンマ + ¥ 記号
3. **AI バナー**: navy 背景 + teal アクセント、左に "AI" ロゴ
4. **粗利アラート**: coral 背景で警告
5. **カンバンカード**: 白背景、左に hot 案件は coral バー (4px)

---

## コーディング規約

### TypeScript

- `strict: true` 必須、`any` 禁止 (使う場合は理由をコメント)
- 型は **値の近くで定義**、共有型のみ `src/types/` へ
- Discriminated Union を活用 (例: `{ kind: 'success', data } | { kind: 'error', error }`)
- `as` キャスト最小限、必要なら `satisfies` を優先
- Enum は使わず、`const` オブジェクト + Union 型で代替

### React / Next.js

- **Server Component をデフォルト** にする。Client Component は明示的に必要な時のみ
- データ取得は **Server Component または Server Action** で
- フォーム送信は **Server Action** を第一選択
- Client State は **URL state (search params) > React state > Zustand** の順で検討
- 子コンポーネントへのデータ受け渡しは **props drilling より composition** を優先

### スタイリング

- Tailwind v4 のユーティリティクラスを使用
- 複雑なバリアントは `cn()` ユーティリティ + `clsx` 風で
- カスタム CSS は最小限、デザイントークンを CSS 変数で定義
- レスポンシブ: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- モバイルファースト

### ファイル・命名

- ファイル名: `kebab-case.tsx`
- コンポーネント名: `PascalCase`
- フック: `useCamelCase`
- 定数: `SCREAMING_SNAKE_CASE`
- 型・インターフェース: `PascalCase` (Hungarian 記法は使わない、`IUser` ではなく `User`)

### バリデーション (Zod)

- フロントとバック両方で **同じ Zod スキーマを再利用**
- スキーマは `src/lib/validations/` に集約
- エラーメッセージは日本語、UX を意識した文言で

```ts
// 例: src/lib/validations/case.ts
export const caseInputSchema = z.object({
  title: z.string().min(1, '案件名を入力してください').max(200),
  customerId: z.string().uuid(),
  expectedSales: z.number().int().nonnegative(),
});
export type CaseInput = z.infer<typeof caseInputSchema>;
```

### DB アクセス (Drizzle)

- **Repository パターン** を採用、`src/server/repositories/` に集約
- ビジネスロジックは `src/server/services/`、Repository を呼ぶ
- マルチテナンシー: クエリ時に **必ず `tenant_id` をフィルタ条件に含める** (RLS の上でさらに二重防御)
- N+1 を避ける、必要なら `with` で JOIN

### エラーハンドリング

- API レスポンスは `{ ok: true, data } | { ok: false, error: { code, message } }` 形式
- エラーコードは定数化 (`src/lib/errors.ts`)
- ユーザー向けメッセージとログ向けメッセージを分離
- 想定外エラーは Sentry (将来) へ送信

### コミット・PR

- Conventional Commits 推奨: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- 1 PR = 1 トピック。レビュー可能なサイズに保つ
- PR タイトル: `feat: 案件カンバンのドラッグ&ドロップ実装`

---

## マルチテナンシー実装ルール

これは **最重要のセキュリティ事項** です。違反するとデータ漏洩が発生します。

1. **すべてのビジネステーブルに `tenant_id` 必須**
2. **Supabase の RLS を必ず有効化**。RLS だけに頼らず、アプリ層でも `tenant_id` フィルタを必ず適用
3. **Server Action / API Route の冒頭で必ずテナント検証**

```ts
// 例: 必ずこのパターンで開始
async function someAction(input: SomeInput) {
  const { user, tenantId } = await requireAuth(); // 認証 + テナント取得
  await assertCanWrite(user.id, tenantId);        // ロールチェック
  // 以降、tenantId を必ず引き回す
}
```

4. **生 SQL を書く時は `WHERE tenant_id = $1` を必ず含める**
5. **新規テーブル追加時は RLS ポリシーをセットで実装**、テストも書く

---

## AI 統合ガイドライン

### Claude API 利用方針

- モデル: 通常は `claude-opus-4-7`、軽量タスクは `claude-sonnet-4-6` 検討
- ストリーミング: ユーザー体感が重要な箇所 (督促文生成 等) で利用
- すべての AI 呼び出しは `ai_request_logs` テーブルに記録 (トークン使用量・レイテンシ)
- プロンプトは `src/lib/ai/prompts/` で管理、バージョン管理

### プロンプト設計原則

1. **役割と目的を明示**: 「あなたは中小企業の経営分析を行う AI です」
2. **入力データ構造を明確に**: JSON で渡し、出力も JSON で受ける (構造化出力)
3. **トーンを指定**: 「丁寧な営業文体で」「経営者向けに簡潔に」
4. **禁止事項を明示**: 「断定的な投資助言は行わない」
5. **few-shot examples** を含めて出力品質を安定化

### 主要 AI 機能

- **粗利アラート判定**: ルールベース (粗利率 < target) + AI が改善案を生成
- **AI 受注確率**: 案件属性・履歴を入力、確率と理由を返す
- **督促文面**: 顧客との過去のやり取り・支払履歴を踏まえて文面生成
- **経営インサイト**: ダッシュボードで「今月のポイント」を AI が要約

---

## テスト戦略

### テストピラミッド

- **Unit (Vitest)**: ユーティリティ・バリデーション・ビジネスロジック (Repository より上のレイヤー)
- **Integration (Vitest + テスト DB)**: API Route / Server Action と DB の結合
- **E2E (Playwright)**: 主要ユーザーフロー (ログイン → 案件作成 → 請求書発行 → 入金)

### カバレッジ目標

- ビジネスロジック (services/): 80% 以上
- 全体: 60% 以上 (MVP)

### マルチテナンシーテスト

- 「他テナントのデータが見えない」テストを必ず書く
- RLS が機能していることを確認する明示的なテスト

---

## 開発フロー

### 新機能を実装する時

1. `docs/requirements.md` で要件を確認
2. 必要なら `docs/data-model.md` を確認・更新
3. Drizzle スキーマ更新 → マイグレーション生成
4. Zod バリデーションスキーマを定義
5. Repository → Service → Server Action / API Route の順に実装
6. UI コンポーネント実装 (Server Component 優先)
7. テスト記述 (Unit / Integration / E2E)
8. PR 作成、レビュー、マージ

### 開発開始時のチェックリスト

- [ ] `pnpm install` (パッケージマネージャは pnpm 推奨)
- [ ] `.env.local` セットアップ
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (サーバーサイドのみ、絶対にクライアントに漏らさない)
  - `ANTHROPIC_API_KEY`
- [ ] `pnpm db:migrate` でローカル DB セットアップ
- [ ] `pnpm db:seed` で初期データ投入
- [ ] `pnpm dev` で起動

### よく使うコマンド

```bash
pnpm dev               # 開発サーバー
pnpm build             # プロダクションビルド
pnpm lint              # ESLint
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest (watch)
pnpm test:run          # Vitest (1回)
pnpm test:e2e          # Playwright
pnpm db:generate       # Drizzle スキーマ → マイグレーション生成
pnpm db:migrate        # マイグレーション適用
pnpm db:seed           # シードデータ投入
pnpm db:studio         # Drizzle Studio (GUI)
```

---

## セキュリティ・プライバシー

- **クレデンシャル類は絶対にコミットしない** (`.gitignore` の徹底)
- **PII (氏名・メール等) はログに残さない**、必要ならハッシュ化
- **API キー類は Vercel 環境変数 / Supabase Vault で管理**
- **入力値は必ず Zod でバリデーション**、SQL は Drizzle 経由のみ (生 SQL は避ける)
- **CSP / セキュリティヘッダー** を `next.config.ts` で設定
- **Rate Limiting** を主要 API に適用 (Upstash Redis 等)

---

## パフォーマンス指針

- 案件一覧 (1万件規模) は **仮想スクロール** (TanStack Virtual)
- ダッシュボードの集計値は **マテリアライズドビュー** + 日次更新
- 画像・PDF は **CDN 配信**、Supabase Storage + Edge
- N+1 を避ける、必ず `with` JOIN
- Server Component で `Suspense` を活用、ストリーミング UI

---

## アーキテクチャ判断記録 (ADR)

重要な技術選定は `docs/decisions/NNNN-title.md` に ADR として記録してください。

例:
- `0001-use-supabase.md`
- `0002-use-drizzle-orm.md`
- `0003-multi-tenancy-pool-model.md`

---

## Claude Code への特別な指示

1. **コードを書く前に、必ず関連するドキュメント (requirements.md / data-model.md) を読んでください**
2. **テーブル設計の変更は必ず data-model.md と連動して更新してください**
3. **既存のデザイントークン・パターンを尊重してください**。デモアプリで確立済みの色・レイアウトを踏襲する
4. **マルチテナンシー (tenant_id, RLS) の徹底を最優先**。新しいテーブル・API を作る時は必ずチェック
5. **粗利可視化が本プロダクトのコアバリュー**。UI / ロジックでこの観点を欠かさない
6. **不明点は推測せず、ユーザーに確認**してください
7. **大きな変更前に、変更計画を提示し承認を得てから着手**してください

---

## 連絡先・関連リソース

- プロジェクト責任者: 幸野裕史 (FRIENDLY株式会社 代表取締役)
- デモアプリ: `docs/demo/FRIENDLY_デモアプリ.html` (提案用 HTML プロトタイプ)
- 提案書: `docs/proposals/FRIENDLY_脱エクセル_提案書_v3.pptx`

---

**このファイルはプロジェクトの進行に合わせて更新してください。最新版を保つことがチーム全員の責任です。**
