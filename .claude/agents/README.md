# FRIENDLY 専用エージェント

このディレクトリには FRIENDLY の事業全般 (自社製品開発・営業・マーケ・コンサル・デザイン・バックオフィス・広報PR・受託開発) を高速化・高品質化するための役割別エージェントが定義されています。
各エージェントは Claude Code から `Agent` ツール経由で起動できます。

## ディレクトリ構成

```
.claude/agents/
├── README.md                  # このファイル
├── product/                   # FRIENDLY 自社製品開発 (9)
├── sales/                     # 営業 (3)
├── marketing/                 # マーケティング (6)
├── consulting/                # コンサルティング (4)
├── design/                    # デザイン (2)
├── backoffice/                # バックオフィス・経理・総務 (6)
├── pr/                        # 広報 PR (1)
└── client-dev/                # クライアント案件開発 (2)
```

合計 33 エージェント。

## エージェント一覧

### product/ — FRIENDLY 自社製品開発

| エージェント | 役割 | モデル |
|---|---|---|
| `requirements-architect` | 要件定義・データモデル設計・ADR | opus |
| `db-schema-designer` | Drizzle スキーマ・マイグレーション・RLS | opus |
| `backend-engineer` | Repository / Service / Server Action | opus |
| `frontend-engineer` | React / shadcn/ui / デザイントークン準拠 UI | opus |
| `ai-prompt-engineer` | Claude API ラッパー・プロンプト設計 | opus |
| `security-auditor` | マルチテナンシー・認証・PII 監査 (Read-only) | opus |
| `code-reviewer` | 規約遵守・可読性レビュー (Read-only) | opus |
| `test-engineer` | Vitest / Playwright テスト記述 | opus |
| `design-token-guardian` | UI トークン遵守チェック (Read-only) | haiku |

### sales/ — 営業

| エージェント | 役割 | モデル |
|---|---|---|
| `sales-email-writer` | 商談メール (初回・お礼・FW・クロージング) | opus |
| `sales-proposal-builder` | 営業提案資料ドラフト | opus |
| `sales-meeting-recorder` | 商談記録の構造化・次アクション抽出 | opus |

### marketing/ — マーケティング

| エージェント | 役割 | モデル |
|---|---|---|
| `content-writer` | ブログ・コラム・メルマガ・ホワイトペーパー | opus |
| `sns-content-creator` | X / LinkedIn / Facebook / Instagram / note | opus |
| `seo-specialist` | SEO 戦略・キーワード・記事最適化 | opus |
| `ad-strategist` | 広告コピー・バナー構成・運用戦略 | opus |
| `video-script-writer` | YouTube / Shorts / TikTok / Reels / 動画一般 | opus |
| `market-researcher` | 市場・競合・トレンド・ペルソナ調査 | opus |

### consulting/ — コンサルティング

| エージェント | 役割 | モデル |
|---|---|---|
| `hearing-designer` | ヒアリング設計・質問リスト | opus |
| `as-is-analyzer` | 現状業務分析・業務フロー可視化 | opus |
| `to-be-designer` | To-Be 業務設計・改善ロードマップ・ROI | opus |
| `consulting-proposal-writer` | コンサルティング提案書 (RFP 対応含む) | opus |

### design/ — デザイン

| エージェント | 役割 | モデル |
|---|---|---|
| `ui-ux-advisor` | UI/UX 設計助言・ユーザビリティ評価 | opus |
| `slide-design-advisor` | スライド構成・レイアウト・配色助言 | opus |

### backoffice/ — バックオフィス・経理・総務

| エージェント | 役割 | モデル |
|---|---|---|
| `minutes-writer` | 議事録作成 (社内・顧客打合せ・経営会議等) | opus |
| `email-reply-drafter` | 日常メール返信ドラフト | haiku |
| `contract-reviewer` | 契約書レビュー・要点抽出 (弁護士確認前提) | opus |
| `quote-invoice-builder` | 見積書・請求書 (インボイス対応) | haiku |
| `accounting-helper` | 経理代行サポート (税理士確認前提) | opus |
| `general-affairs-helper` | 総務全般・規程・備品・防災・BCP | haiku |

### pr/ — 広報 PR

| エージェント | 役割 | モデル |
|---|---|---|
| `pr-writer` | プレスリリース・取材対応・メディアピッチ | opus |

### client-dev/ — クライアント案件開発

| エージェント | 役割 | モデル |
|---|---|---|
| `client-requirements-hearer` | 受託案件のヒアリング・要件定義書 | opus |
| `client-estimator` | クライアント案件の工数・コスト見積 | opus |

## 標準ワークフロー

### A. 新規顧客獲得 (営業 → 提案)

```
1. hearing-designer        ヒアリング設計
2. 顧客ヒアリング (実施)
3. sales-meeting-recorder  商談記録の構造化
4. as-is-analyzer          現状業務分析
5. to-be-designer          改善設計
6. consulting-proposal-writer または sales-proposal-builder  提案書
7. slide-design-advisor    スライド化助言
8. sales-email-writer      提案後のフォローアップ
```

### B. クライアント案件 (開発受託)

```
1. hearing-designer / client-requirements-hearer    要件ヒアリング
2. client-requirements-hearer   要件定義書
3. client-estimator             見積もり
4. contract-reviewer            契約書チェック
5. (実装フェーズ)
6. minutes-writer               定例議事録
```

### C. FRIENDLY 自社プロダクト開発

```
1. product/requirements-architect    要件・データモデル
2. product/db-schema-designer        スキーマ + RLS
3. product/backend-engineer          実装
4. product/frontend-engineer         UI 実装
5. product/ai-prompt-engineer        AI 機能
6. product/test-engineer             テスト
並列でレビュー:
- product/security-auditor
- product/code-reviewer
- product/design-token-guardian
```

### D. マーケティング発信

```
1. market-researcher        テーマ・トレンド調査
2. seo-specialist (記事の場合) / sns-content-creator (SNS)
3. content-writer / video-script-writer  本文作成
4. ad-strategist (有料広告化)
5. pr-writer (プレスリリース化)
```

### E. 月次バックオフィス

```
1. quote-invoice-builder    請求書一括作成
2. email-reply-drafter      請求書送付メール
3. accounting-helper        月次仕訳・月次レポート
4. minutes-writer           月次会議の議事録
```

## エージェント起動の指針

メイン Claude Code から起動する判断基準:

- **単発の検索・grep**: 通常の Read/Bash で完結、エージェント不要
- **3 ファイル以上を横断 / 専門領域**: 該当エージェントを起動
- **複数視点が必要**: 並列で複数エージェント起動 (例: 営業メール作成中に契約書チェック並走)
- **重要な書面の最終チェック前**: 該当監査・レビュー系を必ず

## モデル選定方針

- **opus**: 戦略性・創造性・専門判断が必要 (大半)
- **haiku**: 定型処理・大量処理 (メール返信・見積書フォーマット・総務定型業務)

業務の重要度・スピード要求に応じて選定。コスト最適化したい場合は haiku 切替も検討。

## 機密保持・データ保護方針

全エージェントが共通で遵守:

1. **顧客名・金額等は匿名化推奨** (社外資料・テンプレ化時は必須)
2. **個人情報は最小限**、業務に必要な範囲のみ取扱
3. **法的判断は専門家へ** (弁護士・税理士・社労士)
4. **AI に投入する前に機密性を確認** (固有名詞は伏字に)
5. **公開許諾なき顧客名・パートナー名を社外発信しない**

## 権限・ツール

- 開発エージェント (product/): Read / Write / Edit / Bash 等フル
- 監査エージェント (product/security-auditor, code-reviewer, design-token-guardian): Read / Grep のみ
- 業務系エージェント: Read / Write / Edit / Web 系を中心に必要なツール

## エージェントの活用度を上げる Tips

1. **明示的に役割で呼ぶ**: 「sales-email-writer でフォローアップ作って」
2. **複数を並列実行**: 大きな案件は複数エージェントを並行起動
3. **エージェント間の引き渡しを明示**: 「A の出力を B に渡す」流れで設計
4. **不足情報は質問させる**: エージェントは推測せず質問するよう指示済み

## メンテナンス

- 新規エージェント追加・既存変更時は本 README も更新
- CLAUDE.md (プロジェクト全体規約) との整合性を保つ
- 半年に 1 回、各エージェントの利用頻度・効果を振り返り
- 不要 / 統合可能なエージェントは整理

## 注意事項

- 監査系エージェント (security-auditor, code-reviewer, design-token-guardian) は **書き込み権限を持たない**
- 業務系エージェントは **法的・税務的最終判断はしない** (専門家確認前提)
- すべてのエージェントは作業開始時に CLAUDE.md と関連ドキュメントを読むよう指示されている
- 出力は **必ず人がレビューしてから外部発信** すること
