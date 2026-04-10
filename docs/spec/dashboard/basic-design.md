# ダッシュボード画面 基本設計

本書はダッシュボード画面の実装方針を定義する。画面要件は [requirements-definition.md](./requirements-definition.md) を参照する。

## 1. 文書情報

- 画面名: ダッシュボード画面
- feature 名: `dashboard`
- route: `/dashboard`
- 利用 layout: `DashboardLayout`
- guard: `AuthGuard`
- 作成日: 2026-04-10
- 更新日: 2026-04-10

## 2. 設計方針

- `app/router/route.tsx` で `/dashboard` route を定義する
- `HomePage` は route 入口に限定し、`DashboardContent` を返す
- `DashboardContent` が query、unauthorized 制御、retry を担い、`DashboardEntryCard` は描画責務に寄せる
- KPI は dashboard summary API の snake_case shape をそのまま受け取り、表示整形だけを UI 側で行う
- KPI の表示順は API の返却順に依存せず、UI 側で固定する
- フォームは持たず、ローカル UI 状態も `InfoTooltip` 内に閉じる

## 3. Routing / Layout

- route:
  - `/dashboard`
- 遷移元:
  - `/login`
  - ヘッダーのアプリ名クリック
  - URL 直接入力
- 遷移先:
  - `/billing-summary`
  - `/manual-mail-workflows`
  - `401` 発生時は `/login`
- layout:
  - `DashboardLayout`
- guard:
  - `AuthGuard`
- URL parameter / query parameter:
  - なし

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    dashboard/
      screens/
        HomePage.tsx
      components/
        DashboardContent.tsx
        DashboardEntryCard.tsx
      types/
        dashboard-summary.types.ts
      hooks/
        useDashboardSummary.ts
      api/
        dashboard-summary.api.ts
```

### 4-1. 実装ファイル案

- `screens/HomePage.tsx`:
  - route 入口
  - `DashboardContent` を返す
- `components/DashboardContent.tsx`:
  - dashboard summary query を実行する
  - `401` を検知して `/login` へ遷移する
  - loading / error / success 状態を `DashboardEntryCard` に渡す
- `components/DashboardEntryCard.tsx`:
  - 画面タイトルと説明文を描画する
  - KPI 項目配列を管理し、表示順を固定する
  - KPI 値を表示整形して描画する
  - loading / error / success の表示を切り替える
  - 導線カードを描画する
- `types/dashboard-summary.types.ts`:
  - dashboard summary API の response 型を定義する
- `hooks/useDashboardSummary.ts`:
  - dashboard summary の query を提供する
- `api/dashboard-summary.api.ts`:
  - `GET /dashboard/summary` 呼び出しを定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - `DashboardLayout` の `main.page-shell` 内で表示する
  - 上段に KPI セクション、下段に機能導線カード 2 枚を配置する
- `.page-shell` の要否:
  - 親 layout が提供するため、画面側では `max-w-5xl` による内容幅制御のみ行う
- モバイル時の並び順:
  - KPI セクション
  - 請求集計導線
  - 手動メール取得導線
- デスクトップ時の拡張点:
  - KPI は 3 カラム表示し、内側は区切り線で整理する
  - 導線カードは 2 カラム表示

### 5-2. セクション一覧

| セクション / コンポーネント | 役割                  | 主な表示内容                        | 主な操作 |
| --------------------------- | --------------------- | ----------------------------------- | -------- |
| `DashboardContent`          | query と画面状態制御  | API 応答、error、retry              | 再試行   |
| `DashboardEntryCard`        | 画面全体の描画        | タイトル、説明文、3 KPI、導線カード | tooltip  |
| KPI 項目                    | summary 値の描画      | ラベル、件数、必要な項目のみ tooltip | 開閉     |
| 請求集計導線カード          | billing への遷移導線  | 見出し、説明文、リンクボタン        | 遷移     |
| 手動メール取得導線カード    | workflow への遷移導線 | 見出し、説明文、リンクボタン        | 遷移     |

## 6. コンポーネント責務

### 6-1. Screen

- `HomePage` は route の入口としてのみ機能する
- `DashboardContent` を compose する

### 6-2. Page Content

- `DashboardContent` が画面全体の query 状態を束ねる
- `DashboardEntryCard` は受け取った state に応じて描画を切り替える
- `summaryItems` で KPI ラベル、必要な tooltip 文言、表示順を定義する
- KPI 値は `toLocaleString('ja-JP')` で整形する
- `current_month_fallback_billing_count` を 2 番目に表示する

### 6-3. セクション / 部品

| コンポーネント        | 責務                 | props                                      | 備考                                  |
| --------------------- | -------------------- | ------------------------------------------ | ------------------------------------- |
| `DashboardContent`    | query と unauthorized 制御 | なし                                   | `useDashboardSummary` を利用する      |
| `DashboardEntryCard`  | KPI と導線の描画     | `summary?`, `isLoading?`, `errorMessage?`, `onRetry?` | query 状態に依存しない描画部品 |
| `InfoTooltip`         | 補完件数の補助説明表示 | `label`, `text`                           | `shared/ui` の既存部品を利用する      |
| `Button`              | 他画面への遷移導線   | `as`, `to`                                 | `react-router-dom` の link として使う |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook                  | queryKey                   | API                     | 用途         | 成功時の反映 |
| --------------------- | -------------------------- | ----------------------- | ------------ | ------------ |
| `useDashboardSummary` | `['dashboard', 'summary']` | `fetchDashboardSummary` | KPI 初期取得 | 3 KPI を描画 |

- dashboard summary を唯一のソースオブトゥルースにする
- server state を別の local state にコピーしない

### 7-2. フォーム状態

- 使用有無:
  - 使用しない
- 利用 schema:
  - なし
- 初期値:
  - なし
- submit 処理:
  - なし
- disable 条件:
  - なし

### 7-3. ローカル UI 状態

| state | 型 | 初期値 | 用途 |
| ----- | -- | ------ | ---- |
| なし  | -  | -      | 補完件数 tooltip の開閉は `InfoTooltip` 内で閉じる |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数             | Method | Endpoint             | request | response                   | 備考                        |
| ----------------------- | ------ | -------------------- | ------- | -------------------------- | --------------------------- |
| `fetchDashboardSummary` | GET    | `/dashboard/summary` | なし    | `DashboardSummaryResponse` | `retryOnUnauthorized: true` |

### 8-2. データ変換

- API 応答は snake_case のまま UI に渡す
- 件数は `toLocaleString('ja-JP')` で千区切り表示する
- 単位は UI 側で `件` を付与する
- KPI 表示順は `summaryItems` で固定する
- `0` は正常系としてそのまま表示する

### 8-3. エラー処理

- API エラー時の表示位置:
  - KPI セクション内
- 再試行方法:
  - `useDashboardSummary().refetch()`
- `401` 発生時の挙動:
  - 認証情報を破棄して `/login` へ遷移する

## 9. UI 状態設計

| 状態            | 条件                       | 表示                          | ユーザー操作 |
| --------------- | -------------------------- | ----------------------------- | ------------ |
| Initial Loading | summary 初回取得中         | KPI loading パネル            | 制限あり     |
| Success         | 取得成功                   | 3 KPI と導線カードを表示      | 通常操作可能 |
| API Error       | summary 取得失敗           | エラーパネル + 再試行ボタン   | 再試行可能   |
| Unauthorized    | `401`                      | `/login` へ遷移               | なし         |

- Empty は独立状態を持たない
- KPI がすべて `0` でも success として表示する

## 10. バリデーション設計

| 項目 | 必須 | ルール | エラーメッセージ | 実装場所 |
| ---- | ---- | ------ | ---------------- | -------- |
| なし | -    | -      | -                | -        |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - 補完件数 tooltip ボタンに説明用 `aria-label` を付与する
- キーボード操作:
  - Tab で補完件数 tooltip ボタンと導線リンクへ到達できる
  - Enter / Space で tooltip を開閉できる
- フォーカス管理:
  - 自然な DOM 順に従う
- `aria-*` の要否:
  - `InfoTooltip` が `aria-describedby`, `aria-expanded`, `role="tooltip"` を持つ
- 読み上げ対応:
  - KPI タイトルと値は近接配置し、意味が途切れない構造にする

### 11-2. レスポンシブ

- モバイル:
  - KPI 3 項目は縦積み
  - 導線カードは 1 カラム
- タブレット:
  - KPI は 3 カラム化
  - 導線カードは 2 カラム化
- デスクトップ:
  - `max-w-5xl` 内で情報密度を保つ
- 横スクロール回避策:
  - KPI と導線カードは fixed width を持たず、grid で伸縮させる

## 12. スタイリング方針

- 白ベース、緑アクセントを基本とする
- KPI セクションは白背景の親カード内で、区切り線ベースに情報を整理する
- 数値は `text-3xl` 以上で強調し、説明文は `text-slate-500` に抑える
- 導線カードは KPI セクションと同じ角丸、border、shadow トーンで統一する

## 13. テスト観点

| 観点              | テスト内容                                                   |
| ----------------- | ------------------------------------------------------------ |
| 初期表示          | 3 KPI とタイトルが描画されること                             |
| Tooltip           | 補完件数 tooltip だけが開閉できること                        |
| 導線              | `/billing-summary`, `/manual-mail-workflows` へのリンクがあること |
| API 接続後の成功系 | `0` を含む response shape をそのまま表示できること           |
| API エラー        | エラーパネルと再試行導線を確認すること                       |
| 権限制御          | `401` 時に `/login` へ戻ること                               |

## 14. 実装メモ

- dashboard 専用 UI は feature 内に閉じ、共通化は実利用が出てから判断する

## 15. 未解決事項

- `current_month_fallback_billing_count` の backend 契約名をこのまま確定するか
- KPI 取得失敗時の画面内エラー表現を専用 panel にするか、既存部品を流用するか
