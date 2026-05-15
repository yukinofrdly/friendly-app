# FRIENDLY 専用エージェント

このディレクトリには FRIENDLY プロジェクトの作業を高速化・高品質化するための役割別エージェントが定義されています。
各エージェントは Claude Code から `Agent` ツール経由で起動できます。

## エージェント一覧

### 開発担当

| エージェント | 役割 | モデル | ツール |
|---|---|---|---|
| `requirements-architect` | 要件定義・データモデル設計・ADR | opus | Read/Write/Edit/Web |
| `db-schema-designer` | Drizzle スキーマ・マイグレーション・RLS | opus | Read/Write/Edit/Bash |
| `backend-engineer` | Repository / Service / Server Action | opus | Read/Write/Edit/Bash |
| `frontend-engineer` | React / shadcn/ui / デザイントークン準拠 UI | opus | Read/Write/Edit/Bash |
| `ai-prompt-engineer` | Claude API ラッパー・プロンプト設計 | opus | Read/Write/Edit/Web |

### 品質・レビュー担当 (書き込み権限なし、報告のみ)

| エージェント | 役割 | モデル | ツール |
|---|---|---|---|
| `security-auditor` | マルチテナンシー・認証・PII 監査 | opus | Read/Grep のみ |
| `code-reviewer` | 規約遵守・可読性・保守性レビュー | opus | Read/Grep のみ |
| `test-engineer` | Vitest / Playwright のテスト記述 | opus | Read/Write/Edit/Bash |
| `design-token-guardian` | UI のデザイントークン遵守チェック | haiku | Read/Grep のみ |

## 使い分け・ワークフロー

### 新機能開発の標準フロー

```
1. requirements-architect → 要件・データモデル・ADR を整備
2. db-schema-designer     → スキーマ + マイグレーション + RLS
3. backend-engineer       → Repository → Service → Server Action 実装
4. frontend-engineer      → UI 実装
5. ai-prompt-engineer     → (AI 機能あれば) プロンプト・ラッパー
6. test-engineer          → Unit / Integration / E2E テスト追加
7. security-auditor       → セキュリティ監査 (マルチテナンシー必須)
8. design-token-guardian  → UI トークン遵守チェック
9. code-reviewer          → 総合レビュー
```

### バグ修正フロー

```
1. test-engineer        → 再現テスト (Red)
2. backend / frontend   → 修正
3. test-engineer        → テスト Green 確認 + 回帰テスト追加
4. code-reviewer        → 変更レビュー
```

### PR レビューフロー

```
並列で実行:
- security-auditor       (重大事項あれば即停止)
- code-reviewer
- design-token-guardian  (UI 変更があれば)
```

## エージェント起動の指針

メインのアシスタントから起動する際の判断基準:

- **単純な調査・grep**: 通常の Read/Bash で完結、エージェント不要
- **3 ファイル以上を横断する設計判断**: 該当エージェントを起動
- **複数の独立した観点が必要**: 並列で複数エージェントを起動
- **書き込み伴う重要操作の事前監査**: security-auditor / code-reviewer を先に走らせる

## メンテナンス

- エージェントを追加・変更したら、このディレクトリの README も更新
- プロジェクトの規約 (CLAUDE.md) を変更したら、関連エージェントのプロンプトを同期
- 半年に1回、各エージェントのプロンプトを見直し (現実の作業パターンに合っているか)

## 注意事項

- 監査系エージェント (security-auditor, code-reviewer, design-token-guardian) は **書き込み権限を持たない**。発見事項は報告するだけで、修正は担当エンジニアに委ねる。
- すべてのエージェントは作業開始時に `CLAUDE.md` と関連ドキュメントを読むよう指示されている。
- エージェント間の委譲は明示的に: 「これは X エージェントに依頼してください」と書いて返す。
