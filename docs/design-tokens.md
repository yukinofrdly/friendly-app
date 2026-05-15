# Design Tokens

このプロジェクトのデザイントークン定義です。`tailwind.config.ts` および CSS 変数で参照されることを想定しています。

提案デモ (`FRIENDLY_デモアプリ.html`) で確立されたパターンを正式化したものです。

---

## 1. カラーパレット

### Brand Colors

```ts
export const brand = {
  navy: {
    DEFAULT: '#0E2A4A',  // Primary - 信頼・専門性
    deep:    '#061528',  // 表紙・ヒーロー背景
    soft:    '#1B3A5C',  // サブナビ・ホバー
  },
  teal: {
    DEFAULT: '#00A6A6',  // Secondary - AI・革新
    light:   '#33C3C3',
    50:      '#E6F7F7',
  },
  coral: {
    DEFAULT: '#FF6B47',  // Accent - エネルギー・警告
    light:   '#FF9277',
    50:      '#FFF0EC',
  },
} as const;
```

### Cost Category Colors (原価項目別)

これらは UI と DB の両方で使用されます (cost_item_masters.color に保存)。

```ts
export const costColors = {
  personnel: '#5B6CFF',  // 人件費 (blue-violet)
  outsource: '#FF6B47',  // 外注費 (coral)
  material:  '#00A6A6',  // 材料費 (teal)
  expense:   '#6B7280',  // 経費 (gray)
} as const;
```

### Margin Status Colors (粗利率の状態)

```ts
export const marginStatus = {
  good: '#10B981',  // 20%以上: 健全 (green)
  mid:  '#F59E0B',  // 15-20%: 注意 (amber)
  bad:  '#EF4444',  // 15%未満: 危険 (red)
  unknown: '#9CA3AF', // 未確定 (gray)
} as const;

// 判定ロジック
export function getMarginStatus(rate: number | null, target = 20): keyof typeof marginStatus {
  if (rate === null || rate === undefined) return 'unknown';
  if (rate >= target) return 'good';
  if (rate >= target - 5) return 'mid';
  return 'bad';
}
```

### Semantic Colors

```ts
export const semantic = {
  bg:          '#F7F9FC',
  surface:     '#FFFFFF',
  border:      '#E5E7EB',
  borderSoft:  '#F0F2F5',
  text:        '#1A2B4C',
  textBody:    '#374151',
  textMuted:   '#6B7280',
  textFaint:   '#9CA3AF',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger:  '#EF4444',
  info:    '#3B82F6',
} as const;
```

---

## 2. タイポグラフィ

### Font Stacks

```css
--font-sans: 'Noto Sans JP', 'Yu Gothic', 'メイリオ', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
```

**Mono フォントの用途**: 金額表示、日付、コード、ID 表示

### Font Sizes / Hierarchy

```ts
export const typography = {
  hero:    { size: '44px', weight: 700, lineHeight: 1.2 },  // ランディングのみ
  display: { size: '32px', weight: 700, lineHeight: 1.25 }, // ページタイトル
  h1:      { size: '24px', weight: 700, lineHeight: 1.3 },
  h2:      { size: '20px', weight: 700, lineHeight: 1.3 },
  h3:      { size: '16px', weight: 700, lineHeight: 1.4 },
  body:    { size: '14px', weight: 400, lineHeight: 1.6 },
  bodySm:  { size: '13px', weight: 400, lineHeight: 1.5 },
  caption: { size: '12px', weight: 500, lineHeight: 1.4 },
  micro:   { size: '10px', weight: 700, lineHeight: 1.4, letterSpacing: '0.1em' }, // ラベル系
} as const;
```

---

## 3. スペーシング

Tailwind デフォルト (4px ベース) を踏襲。

```
0   = 0
1   = 4px
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
16  = 64px
20  = 80px
```

---

## 4. ボーダー半径

```ts
export const radii = {
  sm:   '4px',   // 小バッジ・ピル
  DEFAULT: '6px', // ボタン・カード子要素
  md:   '6px',
  lg:   '8px',   // パネル・カード
  xl:   '12px',  // モーダル
  full: '9999px',
} as const;
```

---

## 5. シャドウ

```ts
export const shadows = {
  sm:      '0 1px 2px rgba(14, 42, 74, 0.06)',
  DEFAULT: '0 4px 12px rgba(14, 42, 74, 0.08)',
  lg:      '0 12px 32px rgba(14, 42, 74, 0.14)',
  focus:   '0 0 0 3px rgba(0, 166, 166, 0.25)', // teal フォーカスリング
} as const;
```

---

## 6. アニメーション

### Transition

```css
--transition-fast:   120ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base:   180ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow:   280ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 240ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### キーフレーム

主要なアニメーション:

- **fade-in**: 200ms ease
- **slide-up**: 240ms ease-out (モーダル)
- **pulse**: 2s infinite (新着・通知ドット)

---

## 7. UI コンポーネントパターン

### Button

```
Primary:   bg-coral text-white, hover:bg-coral-light, shadow-md
Secondary: bg-white border border-border text-text, hover:border-teal text-teal
Ghost:     bg-transparent text-text-muted, hover:bg-bg
Danger:    bg-red text-white
```

### Card

```
基本: bg-surface border border-border rounded-lg shadow-sm
ホバー: shadow-md transition
重要なカード: 左に 4px アクセントバー (色は要件次第)
```

### Pill / Badge (ステータス表示)

```
入金済:   bg-margin-good (green) text-white
期限超過: bg-coral text-white
警告:     bg-amber text-white
発行済:   bg-text-muted (gray) text-white

すべて small (10px), uppercase letter-spacing, padding 4px 10px, rounded-full
```

### 粗利率表示

```tsx
function MarginDisplay({ rate, target = 20 }: { rate: number | null; target?: number }) {
  if (rate === null) return <span className="text-text-faint">─</span>;
  const status = getMarginStatus(rate, target);
  const colors = {
    good: 'text-margin-good',
    mid:  'text-margin-mid',
    bad:  'text-margin-bad',
    unknown: 'text-text-faint',
  };
  return (
    <span className={`font-mono font-bold ${colors[status]}`}>
      {rate.toFixed(1)}%
    </span>
  );
}
```

### 金額表示

```tsx
function Amount({ value, compact = false }: { value: number; compact?: boolean }) {
  if (compact && value >= 10_000) {
    return <span className="font-mono">¥{(value / 10_000).toFixed(1)}万</span>;
  }
  return <span className="font-mono">¥{value.toLocaleString('ja-JP')}</span>;
}
```

---

## 8. レイアウト

### Breakpoints (Tailwind デフォルト)

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Container

- メインコンテンツ最大幅: `max-w-7xl` (1280px)
- ダッシュボードはフル幅 (`max-w-none`)

### サイドバー

- 幅: `w-56` (224px) もしくは `w-64` (256px)
- 背景: `bg-navy-deep`
- アクティブナビ: 左に 3px coral border + bg-navy

---

## 9. アイコン

- ライブラリ: **Lucide React** (`lucide-react`)
- サイズ: `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px)
- ストロークウィドス: `1.5` (default), `2` (強調)

---

## 10. チャート (Recharts / Tremor)

### カラーパレット (チャート用)

```ts
export const chartColors = [
  '#0E2A4A',  // navy
  '#00A6A6',  // teal
  '#FF6B47',  // coral
  '#10B981',  // green
  '#F59E0B',  // amber
  '#5B6CFF',  // blue-violet
  '#8B5CF6',  // purple
] as const;
```

### グラフの一般原則

- 軸ラベルは `text-text-muted` (小さめ・控えめ)
- グリッドラインは `border-soft` 同等の薄さ
- データラベルは bold で
- ツールチップは shadow-lg + rounded-lg + bg-surface

---

## 11. Tailwind 設定例

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0E2A4A',
          deep:    '#061528',
          soft:    '#1B3A5C',
        },
        teal: {
          DEFAULT: '#00A6A6',
          light:   '#33C3C3',
          50:      '#E6F7F7',
        },
        coral: {
          DEFAULT: '#FF6B47',
          light:   '#FF9277',
          50:      '#FFF0EC',
        },
        margin: {
          good: '#10B981',
          mid:  '#F59E0B',
          bad:  '#EF4444',
        },
        cost: {
          personnel: '#5B6CFF',
          outsource: '#FF6B47',
          material:  '#00A6A6',
          expense:   '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Yu Gothic', 'メイリオ', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm:      '0 1px 2px rgba(14, 42, 74, 0.06)',
        DEFAULT: '0 4px 12px rgba(14, 42, 74, 0.08)',
        lg:      '0 12px 32px rgba(14, 42, 74, 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 12. デザイン参考素材

- **デモアプリ**: `docs/demo/FRIENDLY_デモアプリ.html` (HTML プロトタイプ)
- **提案書**: `docs/proposals/FRIENDLY_脱エクセル_提案書_v3.pptx`

新しい画面・コンポーネントを実装する時は、まずデモアプリで類似の UI パターンを参照してください。

---

**このトークン設計は提案デモで実証済みのものです。新しい色や値を追加する時は ADR を残してください。**
