# FRIENDLY データモデル設計書

**バージョン**: v0.1
**対象 DB**: PostgreSQL 15+ (Supabase 想定)
**最終更新**: 2026-05-15

---

## 1. 設計方針

### 1.1 マルチテナンシー

- **Pool model** を採用 (全テナントが同一スキーマを共有)
- すべてのビジネステーブルに `tenant_id` カラムを必須
- Row Level Security (RLS) で `tenant_id` ベースのアクセス制御
- 大規模化したら Schema-per-tenant へ移行可能な設計

### 1.2 共通カラム規約

すべてのテーブルに以下を必須:

| カラム名 | 型 | 説明 |
|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` で生成 |
| `tenant_id` | `uuid` (FK) | tenants.id への参照、RLS の起点 |
| `created_at` | `timestamptz` | `now()` デフォルト |
| `updated_at` | `timestamptz` | トリガーで自動更新 |
| `created_by` | `uuid` (FK) | users.id (操作者) |
| `updated_by` | `uuid` (FK) | users.id (最終更新者) |
| `deleted_at` | `timestamptz` | ソフトデリート用、NULL = 有効 |

### 1.3 命名規則

- テーブル名: `snake_case` 複数形 (`cases`, `cost_items`)
- カラム名: `snake_case`
- 外部キー: `<referenced_table_singular>_id` (例: `customer_id`)
- インデックス: `idx_<table>_<columns>`
- ユニーク制約: `uq_<table>_<columns>`

### 1.4 金額の扱い

- 金額は **`bigint`** (円単位、整数のみ) で保存
- 通貨コードはテナント設定 (v0.1 は JPY 固定)
- 表示時にフォーマット (¥3,200,000 等)

### 1.5 数量・パーセント

- 数量: `numeric(20, 4)` (小数 4 桁)
- パーセント: 計算で導出し DB には保存しない (粗利率 = 粗利 / 売上 × 100)

---

## 2. ER 図 (テキスト表現)

```
┌─────────────────┐
│     tenants     │ (組織)
└────────┬────────┘
         │ 1:N
    ┌────┴────────┬────────────┬────────────┬────────────┐
    │             │            │            │            │
    ▼             ▼            ▼            ▼            ▼
┌────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  users │  │customers │ │ products │ │cost_item │ │  cases   │
│        │  │          │ │          │ │_masters  │ │ (案件)   │
└────┬───┘  └────┬─────┘ └──────────┘ └──────────┘ └────┬─────┘
     │           │                                       │ 1:N
     │ M:N       │ 1:N                                   ├────────────────┐
     │           └────────────────────────────►          │                │
     ▼                                                   ▼                ▼
┌─────────────────┐                              ┌──────────────┐ ┌──────────────┐
│tenant_members   │                              │ case_costs   │ │case_activities│
│ (ロール管理)    │                              │ (原価明細)   │ │ (活動履歴)   │
└─────────────────┘                              └──────────────┘ └──────────────┘
                                                                          │
                       ┌──────────────────────────────────────────────────┘
                       │
                       ▼ 1:1                       1:N
                  ┌──────────┐               ┌──────────────┐
                  │ quotes   │──────────────►│ quote_lines  │
                  │ (見積)   │               │ (見積明細)   │
                  └──────────┘               └──────────────┘
                       │ 1:N (受注後)
                       ▼
                  ┌──────────┐               ┌──────────────┐
                  │ invoices │──────────────►│invoice_lines │
                  │ (請求書) │               │ (請求明細)   │
                  └────┬─────┘               └──────────────┘
                       │ 1:N
                       ▼
                  ┌──────────┐
                  │ payments │
                  │ (入金)   │
                  └──────────┘

  其他テーブル:
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ai_insights   │  │ notifications│  │ audit_logs   │
  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. テーブル詳細定義

### 3.1 認証・組織関連

#### `tenants` (組織)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL | 組織名 (会社名) |
| slug | text | NOT NULL, UNIQUE | URL 用識別子 |
| plan | text | NOT NULL, DEFAULT 'free' | free / standard / pro / enterprise |
| logo_url | text | | |
| timezone | text | DEFAULT 'Asia/Tokyo' | |
| currency | text | DEFAULT 'JPY' | |
| fiscal_year_start_month | smallint | DEFAULT 4 | 会計年度の開始月 (1-12) |
| target_margin_rate | numeric(5,2) | DEFAULT 20.00 | 目標粗利率 (%)、AI アラートの閾値 |
| created_at, updated_at | timestamptz | | |

#### `users` (グローバルユーザー、認証 Supabase Auth と紐付け)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | Supabase Auth の auth.users.id と一致 |
| email | text | NOT NULL, UNIQUE | |
| display_name | text | | 表示名 |
| avatar_url | text | | |
| created_at, updated_at | timestamptz | | |

#### `tenant_members` (組織×ユーザー、ロール管理)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK → tenants.id, NOT NULL | |
| user_id | uuid | FK → users.id, NOT NULL | |
| role | text | NOT NULL | owner / admin / member / viewer |
| invited_email | text | | 招待中のメール (user_id 未確定時) |
| invited_at | timestamptz | | |
| accepted_at | timestamptz | | 承認日時 (NULL = 招待中) |
| created_at, updated_at | timestamptz | | |

**制約**: `UNIQUE (tenant_id, user_id)`

#### `invitations` (招待トークン)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK | |
| email | text | NOT NULL | 招待先メール |
| role | text | NOT NULL | |
| token | text | NOT NULL, UNIQUE | 招待リンク用 |
| expires_at | timestamptz | NOT NULL | |
| accepted_at | timestamptz | | |
| invited_by | uuid | FK → users.id | |
| created_at | timestamptz | | |

---

### 3.2 マスター系

#### `customers` (顧客)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| code | text | | 顧客コード (任意、テナント内ユニーク) |
| name | text | NOT NULL | 顧客名 |
| name_kana | text | | カナ |
| postal_code | text | | |
| address | text | | |
| phone | text | | |
| email | text | | |
| website | text | | |
| invoice_registration_no | text | | 適格請求書発行事業者登録番号 (T+13桁) |
| payment_terms_days | integer | DEFAULT 30 | 支払サイト (日数) |
| billing_cycle | text | DEFAULT 'per_invoice' | per_invoice / monthly_close |
| notes | text | | |
| tags | text[] | | タグ配列 |
| created_at, updated_at, created_by, updated_by, deleted_at | | | |

**インデックス**: `idx_customers_tenant_name`, `idx_customers_tenant_code`

#### `products` (商品・サービスマスター)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| code | text | | 商品コード |
| name | text | NOT NULL | |
| description | text | | |
| unit | text | DEFAULT '式' | 単位 (式・個・人日・時間 等) |
| default_unit_price | bigint | DEFAULT 0 | 標準単価 (円) |
| default_unit_cost | bigint | DEFAULT 0 | 標準原価 (円、見積時の参考値) |
| tax_rate | numeric(5,2) | DEFAULT 10.00 | 消費税率 (%) |
| is_active | boolean | DEFAULT true | |
| created_at, updated_at, ... | | | |

#### `cost_item_masters` (原価項目マスター)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| code | text | | 例: PERSONNEL, OUTSOURCE, MATERIAL |
| name | text | NOT NULL | 表示名 (人件費 等) |
| category | text | NOT NULL | personnel / outsource / material / expense / other |
| color | text | | UI 表示用カラー (例: #5B6CFF) |
| sort_order | integer | DEFAULT 0 | |
| is_active | boolean | DEFAULT true | |
| created_at, updated_at | | | |

**デフォルトデータ** (テナント作成時に自動投入):
- 人件費 (personnel, #5B6CFF)
- 外注費 (outsource, #FF6B47)
- 材料費 (material, #00A6A6)
- 経費 (expense, #6B7280)

#### `case_stages` (案件ステージマスター)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| code | text | NOT NULL | lead / discussion / proposal / won / lost |
| name | text | NOT NULL | |
| sort_order | integer | NOT NULL | カンバン表示順 |
| is_terminal | boolean | DEFAULT false | true なら受注/失注などの最終ステージ |
| is_won | boolean | DEFAULT false | 受注ステージか |
| color | text | | |
| created_at, updated_at | | | |

---

### 3.3 案件・原価

#### `cases` (案件)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| code | text | | 案件番号 (例: C-2025-A01) 自動採番 |
| title | text | NOT NULL | 案件名 |
| customer_id | uuid | FK → customers.id | |
| owner_id | uuid | FK → users.id | 担当営業 |
| stage_id | uuid | FK → case_stages.id | 現在のステージ |
| expected_sales | bigint | DEFAULT 0 | 想定売上 (見積時) |
| expected_close_date | date | | 受注見込日 |
| won_at | timestamptz | | 受注日時 |
| lost_at | timestamptz | | 失注日時 |
| lost_reason | text | | 失注理由 |
| description | text | | |
| tags | text[] | | |
| ai_win_probability | numeric(5,2) | | AI 受注確率 (%) |
| ai_win_probability_updated_at | timestamptz | | |
| created_at, updated_at, ... | | | |

**派生カラム (VIEW で算出、保存しない)**:
- `total_cost` = SUM(case_costs.amount WHERE stage = 'plan')
- `gross_profit` = expected_sales - total_cost
- `gross_margin_rate` = gross_profit / expected_sales * 100

#### `case_costs` (案件原価明細)

1案件に対し、原価項目 × ステージ (計画/実績) で複数行。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id, NOT NULL | |
| cost_item_id | uuid | FK → cost_item_masters.id | |
| stage | text | NOT NULL | plan / actual |
| amount | bigint | NOT NULL, DEFAULT 0 | 金額 (円) |
| quantity | numeric(20,4) | | 数量 (任意) |
| unit | text | | 単位 (任意) |
| memo | text | | |
| recorded_at | date | | 実績計上日 (実績の場合) |
| created_at, updated_at, ... | | | |

**ユニーク**: `UNIQUE (case_id, cost_item_id, stage)` (1案件・1項目・1ステージ = 1行)

#### `case_snapshots` (粗利推移用スナップショット)

主要マイルストーンごとに「その時点の数字」を保存し、粗利推移グラフに使用。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id, NOT NULL | |
| snapshot_type | text | NOT NULL | quote / order / progress / forecast / final |
| sales_amount | bigint | NOT NULL | その時点の売上 |
| cost_amount | bigint | NOT NULL | その時点の原価 |
| gross_profit | bigint | NOT NULL | 粗利 |
| gross_margin_rate | numeric(5,2) | NOT NULL | 粗利率 (%) |
| is_ai_forecast | boolean | DEFAULT false | AI 予測かどうか |
| snapshot_at | timestamptz | NOT NULL DEFAULT now() | |
| memo | text | | |
| created_by | uuid | FK | |

**インデックス**: `idx_case_snapshots_case_type` (case_id, snapshot_type, snapshot_at)

#### `case_activities` (活動履歴)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id | |
| activity_type | text | NOT NULL | note / call / meeting / email / stage_change / cost_update / file |
| title | text | | |
| content | text | | |
| occurred_at | timestamptz | DEFAULT now() | |
| created_by | uuid | FK | |
| metadata | jsonb | | 種別ごとの拡張データ |
| created_at, updated_at | | | |

#### `case_attachments` (添付ファイル)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id | |
| file_name | text | NOT NULL | |
| file_size | bigint | | バイト |
| mime_type | text | | |
| storage_path | text | NOT NULL | S3/Supabase Storage のパス |
| uploaded_by | uuid | FK | |
| created_at | timestamptz | | |

---

### 3.4 見積・請求・入金

#### `quotes` (見積書)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id | 関連案件 |
| customer_id | uuid | FK → customers.id, NOT NULL | |
| quote_no | text | NOT NULL | 見積番号 (Q-2025-001 等) |
| issue_date | date | NOT NULL | 発行日 |
| expires_on | date | | 有効期限 |
| subtotal | bigint | NOT NULL DEFAULT 0 | 税抜小計 |
| tax_amount | bigint | NOT NULL DEFAULT 0 | 消費税額 |
| total_amount | bigint | NOT NULL DEFAULT 0 | 税込合計 |
| status | text | DEFAULT 'draft' | draft / sent / accepted / rejected / expired |
| pdf_storage_path | text | | |
| notes | text | | |
| created_at, updated_at, ... | | | |

**ユニーク**: `UNIQUE (tenant_id, quote_no)`

#### `quote_lines` (見積明細)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| quote_id | uuid | FK → quotes.id, NOT NULL | |
| product_id | uuid | FK → products.id | 任意 |
| line_no | integer | NOT NULL | 行番号 |
| description | text | NOT NULL | 品名・摘要 |
| quantity | numeric(20,4) | NOT NULL DEFAULT 1 | |
| unit | text | | |
| unit_price | bigint | NOT NULL DEFAULT 0 | |
| amount | bigint | NOT NULL DEFAULT 0 | 小計 (quantity × unit_price) |
| tax_rate | numeric(5,2) | DEFAULT 10.00 | |
| created_at, updated_at | | | |

#### `invoices` (請求書)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| case_id | uuid | FK → cases.id | |
| customer_id | uuid | FK → customers.id, NOT NULL | |
| quote_id | uuid | FK → quotes.id | 元となった見積 |
| invoice_no | text | NOT NULL | 請求書番号 (連番) |
| issue_date | date | NOT NULL | 発行日 |
| due_date | date | NOT NULL | 支払期限 |
| subtotal | bigint | NOT NULL DEFAULT 0 | |
| tax_amount | bigint | NOT NULL DEFAULT 0 | |
| total_amount | bigint | NOT NULL DEFAULT 0 | |
| paid_amount | bigint | NOT NULL DEFAULT 0 | 入金済額 |
| status | text | NOT NULL DEFAULT 'draft' | draft / issued / sent / partial / paid / overdue / canceled |
| invoice_registration_no | text | | 適格請求書登録番号 (発行側 = テナント) |
| pdf_storage_path | text | | |
| sent_at | timestamptz | | |
| paid_at | timestamptz | | |
| canceled_at | timestamptz | | |
| notes | text | | |
| created_at, updated_at, ... | | | |

**ユニーク**: `UNIQUE (tenant_id, invoice_no)`

#### `invoice_lines` (請求明細)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| invoice_id | uuid | FK → invoices.id, NOT NULL | |
| product_id | uuid | FK → products.id | |
| line_no | integer | NOT NULL | |
| description | text | NOT NULL | |
| quantity | numeric(20,4) | NOT NULL DEFAULT 1 | |
| unit | text | | |
| unit_price | bigint | NOT NULL DEFAULT 0 | |
| amount | bigint | NOT NULL DEFAULT 0 | |
| tax_rate | numeric(5,2) | DEFAULT 10.00 | |
| tax_category | text | DEFAULT 'standard' | standard / reduced / non_taxable / exempt |
| created_at, updated_at | | | |

#### `payments` (入金)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| invoice_id | uuid | FK → invoices.id, NOT NULL | |
| amount | bigint | NOT NULL | 入金額 |
| paid_at | date | NOT NULL | 入金日 |
| payment_method | text | | bank_transfer / cash / other |
| bank_reference | text | | 銀行 API からのリファレンス |
| matched_automatically | boolean | DEFAULT false | 自動消込か |
| memo | text | | |
| created_at, updated_at, ... | | | |

#### `dunning_actions` (督促アクション履歴)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| invoice_id | uuid | FK → invoices.id, NOT NULL | |
| action_type | text | NOT NULL | reminder / dunning / phone / escalation |
| action_date | timestamptz | NOT NULL DEFAULT now() | |
| message | text | | 送信メール本文 (AI 生成) |
| ai_generated | boolean | DEFAULT false | |
| status | text | DEFAULT 'sent' | sent / failed / received_response |
| created_by | uuid | FK | |
| created_at | timestamptz | | |

---

### 3.5 AI 機能関連

#### `ai_insights` (AI が生成した分析・提案)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| target_type | text | NOT NULL | case / invoice / tenant_dashboard |
| target_id | uuid | | 対象エンティティ ID |
| insight_type | text | NOT NULL | margin_alert / win_probability / dunning_suggestion / forecast |
| severity | text | | info / warning / critical |
| title | text | NOT NULL | |
| content | text | NOT NULL | AI 出力本文 |
| metadata | jsonb | | スコア・予測値などの構造化データ |
| recommendation | text | | 推奨アクション |
| model | text | | claude-opus-4-7 等 |
| prompt_version | text | | プロンプトのバージョン |
| acknowledged_at | timestamptz | | ユーザーが確認済み |
| acted_on_at | timestamptz | | アクション実行済み |
| created_at | timestamptz | | |

**インデックス**: `idx_ai_insights_target` (target_type, target_id, created_at DESC)

#### `ai_request_logs` (AI API 呼び出しログ、料金管理・デバッグ用)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| feature | text | NOT NULL | margin_alert / dunning / etc |
| model | text | NOT NULL | |
| input_tokens | integer | | |
| output_tokens | integer | | |
| latency_ms | integer | | |
| status | text | | success / error |
| error_message | text | | |
| user_id | uuid | FK | |
| created_at | timestamptz | | |

---

### 3.6 通知・監査・連携

#### `notifications` (アプリ内通知)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| user_id | uuid | FK → users.id, NOT NULL | 通知先 |
| notification_type | text | NOT NULL | margin_alert / overdue / mention / system |
| title | text | NOT NULL | |
| content | text | | |
| link_url | text | | クリック時の遷移先 |
| read_at | timestamptz | | |
| created_at | timestamptz | | |

#### `audit_logs` (監査ログ)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| user_id | uuid | FK | |
| action | text | NOT NULL | create / update / delete / login 等 |
| target_type | text | NOT NULL | テーブル名 |
| target_id | uuid | | |
| changes | jsonb | | before / after 差分 |
| ip_address | inet | | |
| user_agent | text | | |
| created_at | timestamptz | | |

#### `integrations` (外部サービス連携)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK, NOT NULL | |
| provider | text | NOT NULL | freee / mfcloud / slack / google_calendar |
| status | text | DEFAULT 'inactive' | active / inactive / error |
| access_token | text | | 暗号化保存 |
| refresh_token | text | | 暗号化保存 |
| expires_at | timestamptz | | |
| provider_account_id | text | | 連携先のアカウント ID |
| settings | jsonb | | 連携設定 (同期間隔等) |
| last_synced_at | timestamptz | | |
| last_error | text | | |
| created_at, updated_at | | | |

**ユニーク**: `UNIQUE (tenant_id, provider)`

#### `integration_sync_logs` (連携同期ログ)

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | |
| tenant_id | uuid | FK | |
| integration_id | uuid | FK → integrations.id | |
| sync_type | text | NOT NULL | journal_export / invoice_export / etc |
| status | text | | success / partial / failed |
| records_synced | integer | | |
| error_message | text | | |
| started_at | timestamptz | | |
| completed_at | timestamptz | | |
| created_at | timestamptz | | |

---

## 4. Row Level Security (RLS) ポリシー

### 4.1 基本方針

- **全テーブルで RLS を有効化**
- ユーザーが所属するテナントのデータのみアクセス可能
- ロールに応じた追加制限 (例: viewer は INSERT/UPDATE 不可)

### 4.2 共通ヘルパー関数

```sql
-- 現在のユーザーが指定テナントのメンバーか
CREATE FUNCTION public.is_tenant_member(p_tenant_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND accepted_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 現在のユーザーのテナント内ロールを取得
CREATE FUNCTION public.tenant_role(p_tenant_id uuid) RETURNS text AS $$
  SELECT role FROM tenant_members
  WHERE user_id = auth.uid() AND tenant_id = p_tenant_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 編集権限ありロール (owner/admin/member)
CREATE FUNCTION public.can_write(p_tenant_id uuid) RETURNS boolean AS $$
  SELECT tenant_role(p_tenant_id) IN ('owner', 'admin', 'member');
$$ LANGUAGE sql SECURITY DEFINER;
```

### 4.3 ポリシー例 (cases テーブル)

```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- SELECT: メンバーは全件閲覧可
CREATE POLICY cases_select ON cases FOR SELECT
  USING (is_tenant_member(tenant_id));

-- INSERT: 編集権限ロールのみ
CREATE POLICY cases_insert ON cases FOR INSERT
  WITH CHECK (can_write(tenant_id));

-- UPDATE: 編集権限ロールのみ
CREATE POLICY cases_update ON cases FOR UPDATE
  USING (can_write(tenant_id))
  WITH CHECK (can_write(tenant_id));

-- DELETE: owner/admin、または自分が担当者の case のみ
CREATE POLICY cases_delete ON cases FOR DELETE
  USING (
    tenant_role(tenant_id) IN ('owner', 'admin')
    OR owner_id = auth.uid()
  );
```

### 4.4 注意事項

- `users` テーブルは自分自身のレコードのみ SELECT 可
- `tenant_members` は同じテナントのメンバーのみ閲覧可
- `audit_logs` は owner/admin のみ閲覧可

---

## 5. インデックス戦略

### 5.1 必須インデックス

- 全テーブルの `tenant_id` (RLS のための前提)
- 外部キー全て (PostgreSQL は自動付与しないため明示的に作成)
- 頻繁な検索キー: `cases.code`, `invoices.invoice_no`, `customers.name`
- 時系列クエリ用: `(tenant_id, created_at DESC)`

### 5.2 複合インデックス例

```sql
CREATE INDEX idx_cases_tenant_stage ON cases (tenant_id, stage_id, expected_close_date);
CREATE INDEX idx_invoices_tenant_status ON invoices (tenant_id, status, due_date);
CREATE INDEX idx_case_snapshots_case ON case_snapshots (case_id, snapshot_at DESC);
```

---

## 6. ビュー / マテリアライズドビュー

### 6.1 `v_cases_with_margin` (案件 + 粗利情報)

```sql
CREATE VIEW v_cases_with_margin AS
SELECT
  c.*,
  COALESCE(plan_cost.total, 0) AS planned_cost,
  COALESCE(actual_cost.total, 0) AS actual_cost,
  c.expected_sales - COALESCE(plan_cost.total, 0) AS planned_gross_profit,
  CASE WHEN c.expected_sales > 0
    THEN ROUND((c.expected_sales - COALESCE(plan_cost.total, 0))::numeric / c.expected_sales * 100, 2)
    ELSE NULL
  END AS planned_margin_rate
FROM cases c
LEFT JOIN (
  SELECT case_id, SUM(amount) AS total FROM case_costs
  WHERE stage = 'plan' GROUP BY case_id
) plan_cost ON plan_cost.case_id = c.id
LEFT JOIN (
  SELECT case_id, SUM(amount) AS total FROM case_costs
  WHERE stage = 'actual' GROUP BY case_id
) actual_cost ON actual_cost.case_id = c.id;
```

### 6.2 `mv_monthly_revenue` (月次売上、マテリアライズド)

毎日 1 回更新。

```sql
CREATE MATERIALIZED VIEW mv_monthly_revenue AS
SELECT
  tenant_id,
  date_trunc('month', issue_date) AS month,
  SUM(total_amount) AS revenue,
  SUM(paid_amount) AS collected,
  COUNT(*) AS invoice_count
FROM invoices
WHERE status != 'canceled' AND deleted_at IS NULL
GROUP BY tenant_id, date_trunc('month', issue_date);
```

---

## 7. トリガー

### 7.1 `updated_at` 自動更新

```sql
CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに適用
CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
```

### 7.2 案件ステージ変更時の Snapshot 自動生成

```sql
CREATE OR REPLACE FUNCTION trg_case_stage_snapshot() RETURNS trigger AS $$
DECLARE
  v_total_cost bigint;
  v_snapshot_type text;
  v_is_won boolean;
BEGIN
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    SELECT is_won INTO v_is_won FROM case_stages WHERE id = NEW.stage_id;
    v_snapshot_type := CASE WHEN v_is_won THEN 'order' ELSE 'progress' END;

    SELECT COALESCE(SUM(amount), 0) INTO v_total_cost
    FROM case_costs WHERE case_id = NEW.id AND stage = 'plan';

    INSERT INTO case_snapshots (
      tenant_id, case_id, snapshot_type,
      sales_amount, cost_amount,
      gross_profit, gross_margin_rate
    ) VALUES (
      NEW.tenant_id, NEW.id, v_snapshot_type,
      NEW.expected_sales, v_total_cost,
      NEW.expected_sales - v_total_cost,
      CASE WHEN NEW.expected_sales > 0
        THEN ROUND((NEW.expected_sales - v_total_cost)::numeric / NEW.expected_sales * 100, 2)
        ELSE NULL END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. シードデータ (テナント作成時に投入)

新規テナント作成時、以下を自動投入:

```sql
-- 案件ステージ
INSERT INTO case_stages (tenant_id, code, name, sort_order, is_won, color) VALUES
  (t_id, 'lead',       'リード',  1, false, '#8E96A0'),
  (t_id, 'discussion', '商談中',  2, false, '#00A6A6'),
  (t_id, 'proposal',   '提案中',  3, false, '#FF6B47'),
  (t_id, 'won',        '受注',    4, true,  '#10B981'),
  (t_id, 'lost',       '失注',    5, false, '#EF4444');

-- 原価項目
INSERT INTO cost_item_masters (tenant_id, code, name, category, color, sort_order) VALUES
  (t_id, 'PERSONNEL', '人件費', 'personnel', '#5B6CFF', 1),
  (t_id, 'OUTSOURCE', '外注費', 'outsource', '#FF6B47', 2),
  (t_id, 'MATERIAL',  '材料費', 'material',  '#00A6A6', 3),
  (t_id, 'EXPENSE',   '経費',   'expense',   '#6B7280', 4);
```

---

## 9. データ削除・保持ポリシー

| データ種別 | 保持期間 | 削除方法 |
|---|---|---|
| 案件・請求書・入金 | 永久 (会計帳簿は7-10年保管要件) | ソフトデリート (deleted_at) |
| 通知 | 90日 (read済は30日) | 定期 cron で物理削除 |
| AI request logs | 90日 | 定期 cron で物理削除 |
| 監査ログ | 5年 (将来要件) | アーカイブ後物理削除 |
| 削除されたテナント | 30日間のリカバリ期間後、完全削除 | カスケード DELETE |

---

## 10. マイグレーション戦略

- マイグレーションツール: **Drizzle ORM** + drizzle-kit、または **Prisma**、または **Supabase CLI**
- マイグレーションファイルは `db/migrations/` 配下にバージョン管理
- 各マイグレーションは UP/DOWN を必ず実装
- 本番反映前に staging 環境で必ず適用テスト
- Breaking change (カラム削除・型変更) は2段階デプロイ

---

## 11. 主要 SQL クエリ集 (実装の参考)

### 案件詳細 + 原価明細 + 粗利推移

```sql
-- 案件の原価明細 (項目別 計画/実績)
SELECT
  cim.name AS item_name,
  cim.category,
  cim.color,
  MAX(CASE WHEN cc.stage = 'plan'   THEN cc.amount END) AS planned,
  MAX(CASE WHEN cc.stage = 'actual' THEN cc.amount END) AS actual
FROM cost_item_masters cim
LEFT JOIN case_costs cc
  ON cc.cost_item_id = cim.id AND cc.case_id = $1
WHERE cim.tenant_id = $2 AND cim.is_active = true
GROUP BY cim.id, cim.name, cim.category, cim.color, cim.sort_order
ORDER BY cim.sort_order;
```

### 粗利アラート対象案件の抽出

```sql
SELECT c.*, vcwm.planned_margin_rate
FROM v_cases_with_margin vcwm
JOIN cases c ON c.id = vcwm.id
JOIN tenants t ON t.id = c.tenant_id
WHERE c.tenant_id = $1
  AND c.deleted_at IS NULL
  AND vcwm.planned_margin_rate IS NOT NULL
  AND vcwm.planned_margin_rate < t.target_margin_rate
  AND c.stage_id IN (
    SELECT id FROM case_stages
    WHERE tenant_id = $1 AND code IN ('discussion', 'proposal')
  );
```

### 売掛金エイジング

```sql
SELECT
  CASE
    WHEN current_date - due_date <= 0 THEN '0-30日'
    WHEN current_date - due_date <= 30 THEN '0-30日'
    WHEN current_date - due_date <= 60 THEN '31-60日'
    WHEN current_date - due_date <= 90 THEN '61-90日'
    ELSE '90日超'
  END AS aging_bucket,
  SUM(total_amount - paid_amount) AS outstanding,
  COUNT(*) AS invoice_count
FROM invoices
WHERE tenant_id = $1
  AND status IN ('issued', 'sent', 'partial', 'overdue')
  AND deleted_at IS NULL
GROUP BY aging_bucket
ORDER BY aging_bucket;
```

---

## 12. 未決事項

- [ ] 銀行 API 連携の具体ベンダー選定 (Money Forward ME 経由 / 直接連携)
- [ ] 添付ファイルの最大サイズ (50MB? 100MB?)
- [ ] 既存 Excel からのインポート CSV フォーマット仕様
- [ ] テナント切り替え UI (1ユーザーが複数テナント所属時)
- [ ] 案件番号の自動採番ロジック (年度リセット? 通し番号?)
- [ ] 失注理由のマスター化と AI 学習への活用

---

**このデータモデルは v0.1 MVP 用。スケール要件次第で sharding や分散戦略を再検討する。**
