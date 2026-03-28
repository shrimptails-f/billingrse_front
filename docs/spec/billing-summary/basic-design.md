# 請求集計画面 基本設計

## 1. 文書情報

- 画面名: 請求集計画面
- feature 名: `billing`
- route: `/billing-summary`
- 利用 layout: `DashboardLayout`
- guard: `AuthGuard`
- ステータス: Draft
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router` で `/billing-summary` route を定義する
- 画面入口は `src/features/billing/screens/BillingSummaryPage.tsx` に置く
- screen は薄く保ち、`BillingSummaryContent` に画面責務を集約する
- サーバ状態は TanStack Query の 2 query で扱い、ローカル state は通貨と選択月だけに限定する
- フォームは持たないため `schema/` は追加しない
- 画面固有 UI は `features/billing` に閉じ、汎用部品は `shared/ui` と `shared/api` を再利用する

## 3. Routing / Layout

- route:
  - `/billing-summary`
- 遷移元:
  - `/dashboard`
  - URL 直接アクセス
- 遷移先:
  - 明示的な画面遷移は持たない
  - `401` 発生時のみ `/login`
- layout:
  - `DashboardLayout`
- guard:
  - route 全体を `AuthGuard` で保護する
  - route 到達後に API が `401` を返した場合も画面側で `/login` に戻す
- URL parameter / query parameter:
  - なし
  - API は `currency` query を持つが URL には露出しない

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    billing/
      screens/
        BillingSummaryPage.tsx
      components/
        BillingSummaryContent.tsx
        BillingSummaryHeader.tsx
        BillingSummaryTrendSection.tsx
        BillingSummaryDetailSection.tsx
        BillingSummaryErrorPanel.tsx
        BillingSummaryLoadingPanel.tsx
        BillingSummaryInfoTooltip.tsx
      hooks/
        useBillingMonthlyTrend.ts
        useBillingMonthDetail.ts
      api/
        billing-summary.api.ts
      lib/
        billing-summary.ts
      types/
        billing-summary.types.ts
```

### 4-1. 実装ファイル案

- `screens/BillingSummaryPage.tsx`:
  - route 入口
  - `BillingSummaryContent` のみを返す
- `components/BillingSummaryContent.tsx`:
  - 画面全体の query、ローカル state、401 遷移、セクション compose を担う
- `components/BillingSummaryHeader.tsx`:
  - 画面タイトル、説明文、通貨タブを描画する
- `components/BillingSummaryTrendSection.tsx`:
  - 月別棒グラフ、選択中月のサマリー、empty 表示を担う
- `components/BillingSummaryDetailSection.tsx`:
  - 選択月サマリー、補完件数 tooltip、支払先別内訳、詳細 loading / error / empty を担う
- `components/BillingSummaryErrorPanel.tsx`:
  - 再試行可能な共通エラーパネルを描画する
- `components/BillingSummaryLoadingPanel.tsx`:
  - 初期取得用の loading 表示を描画する
- `components/BillingSummaryInfoTooltip.tsx`:
  - 補完件数の説明 tooltip を描画する
- `hooks/useBillingMonthlyTrend.ts`:
  - 月別推移 query を提供する
- `hooks/useBillingMonthDetail.ts`:
  - 選択月の詳細 query を提供する
- `api/billing-summary.api.ts`:
  - 集計 API 呼び出しを定義する
- `lib/billing-summary.ts`:
  - 金額、件数、年月整形とバーサイズ算出を定義する
- `types/billing-summary.types.ts`:
  - API 応答型と通貨型を定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - `DashboardLayout` の `main.page-shell` 内に請求集計コンテンツを配置する
  - 画面本体は `page-shell page-shell--wide space-y-6` の縦積みで構成する
- `.page-shell` の要否:
  - 必須
- モバイル時の並び順:
  - 画面内ヘッダー
  - 初期 loading または初期 error
  - 月別推移
  - 支払先別内訳
- デスクトップ時の拡張点:
  - `max-w-5xl` のヘッダーとワイドカードで情報密度を上げる
  - 棒グラフは横方向に余白を取りつつ中央寄せで見せる

### 5-2. セクション一覧

| セクション / コンポーネント   | 役割                           | 主な表示内容                               | 主な操作             |
| ----------------------------- | ------------------------------ | ------------------------------------------ | -------------------- |
| `BillingSummaryHeader`        | 画面概要と切替操作             | タイトル、説明文、通貨タブ                 | 通貨切替             |
| `BillingSummaryLoadingPanel`  | 初期読み込み表示               | スピナー、説明文                           | なし                 |
| `BillingSummaryErrorPanel`    | 初期取得または詳細取得失敗表示 | エラー見出し、説明文、再試行ボタン         | 再読み込み           |
| `BillingSummaryTrendSection`  | 月別推移表示                   | 棒グラフ、選択月、合計金額、説明文         | 月選択               |
| `BillingSummaryDetailSection` | 選択月内訳表示                 | 合計金額、請求件数、補完件数、支払先別一覧 | tooltip 開閉、再試行 |
| `BillingSummaryInfoTooltip`   | 補完件数の補助説明             | 説明テキスト                               | 開閉                 |

## 6. コンポーネント責務

### 6-1. Screen

- `BillingSummaryPage` は route 入口としてのみ機能する
- `BillingSummaryContent` を 1 つ compose する

### 6-2. Page Content

- `BillingSummaryContent` が画面全体の状態を束ねる
- `useBillingMonthlyTrend` と `useBillingMonthDetail` を呼び出す
- `currency` と `selectedMonthOverride` を保持する
- 通貨変更、月選択、401 時のログイン遷移を扱う

### 6-3. セクション / 部品

| コンポーネント                | 責務                           | props                                                                                  | 備考                    |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- | ----------------------- |
| `BillingSummaryHeader`        | タイトルと通貨タブ描画         | `currency`, `onCurrencyChange`                                                         | `tablist` を持つ        |
| `BillingSummaryTrendSection`  | 月別推移描画                   | `currency`, `items`, `monthlyMax`, `selectedMonth`, `selectedSummary`, `onSelectMonth` | 横スクロール可能        |
| `BillingSummaryDetailSection` | 詳細サマリーと支払先別内訳描画 | `currency`, `selectedSummary`, `detail`, `isLoading`, `isError`, `error`, `onRetry`    | detail 状態別表示を内包 |
| `BillingSummaryErrorPanel`    | エラー表示                     | `title`, `description`, `onRetry`                                                      | `role="alert"`          |
| `BillingSummaryLoadingPanel`  | loading 表示                   | `label`, `description`                                                                 | 初期 loading 専用       |
| `BillingSummaryInfoTooltip`   | 補助説明表示                   | `text`, `label`                                                                        | `role="tooltip"`        |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook                     | queryKey / mutationKey                                                  | API                        | 用途                     | 成功時の反映                                         |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------- | ------------------------ | ---------------------------------------------------- |
| `useBillingMonthlyTrend` | `['billing-summary', 'monthly-trend', { currency, window_end_month? }]` | `fetchBillingMonthlyTrend` | 通貨別の月別推移取得     | `default_selected_month` と `items` を画面描画に利用 |
| `useBillingMonthDetail`  | `['billing-summary', 'monthly-detail', { currency, yearMonth }]`        | `fetchBillingMonthDetail`  | 選択月の支払先別内訳取得 | 詳細サマリーと支払先別一覧を更新                     |
| `useAuthSession`         | `['auth', 'session']`                                                   | `checkAuth`                | route guard の認証確認   | `AuthGuard` が遷移可否を判定                         |

- `useBillingMonthDetail` は `yearMonth !== null` のときだけ有効化する
- `401` 発生時は `clearAuthToken()` と `queryClient.removeQueries({ queryKey: authSessionQueryKey })` を実行して `/login` へ遷移する
- server state を別 state にコピーせず、派生値のみ画面内で計算する

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

| state                   | 型                | 初期値  | 用途                       |
| ----------------------- | ----------------- | ------- | -------------------------- |
| `currency`              | `BillingCurrency` | `'JPY'` | 表示通貨切替               |
| `selectedMonthOverride` | `string \| null`  | `null`  | ユーザーが選択した月の保持 |

- 派生値:
  - `availableMonths`: 月別推移 `items` の年月一覧
  - `selectedMonth`: override が有効ならそれを、無効なら `default_selected_month`
  - `selectedTrendItem`: 現在選択中の月別推移 item
  - `selectedSummary`: 推移 item と詳細応答から作る表示用サマリー
  - `monthlyMax`, `vendorMax`: 棒グラフ比率の基準値

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数                | Method | Endpoint                                      | request                                  | response                      | 備考                        |
| -------------------------- | ------ | --------------------------------------------- | ---------------------------------------- | ----------------------------- | --------------------------- |
| `fetchBillingMonthlyTrend` | GET    | `/billings/summary/monthly-trend`             | query: `{ currency, window_end_month? }` | `BillingMonthlyTrendResponse` | `retryOnUnauthorized: true` |
| `fetchBillingMonthDetail`  | GET    | `/billings/summary/monthly-detail/:yearMonth` | path: `yearMonth`, query: `{ currency }` | `BillingMonthDetailResponse`  | `retryOnUnauthorized: true` |

### 8-2. データ変換

- `selectedSummary` は詳細応答が存在する項目を優先し、未取得時は月別推移 item を利用する
- 棒グラフ高さは `calculateBillingBarHeight(totalAmount, monthlyMax)` で算出する
- 支払先別バー幅は `vendorMax` 比率から算出し、最低 10% を確保する
- 金額は `formatBillingAmount`、件数は `formatBillingCount`、年月は `formatBillingYearMonth` / `formatBillingShortMonth` で整形する
- `vendor_limit` 未取得時の表示文言は `5` を既定値とする
- `window_start_month`, `window_end_month` は受け取るが現行 UI では未使用とする

### 8-3. エラー処理

- API エラー時の表示位置:
  - 月別推移失敗: `BillingSummaryHeader` 直下
  - 月別詳細失敗: `BillingSummaryDetailSection` 内
- 再試行方法:
  - `trendQuery.refetch()`
  - `detailQuery.refetch()`
- `401` 発生時の挙動:
  - `ApiError.status === 401` を検知したら認証情報を破棄する
  - 認証 session query を削除する
  - `/login` へ遷移する

## 9. UI 状態設計

| 状態                           | 条件                                                             | 表示                                | ユーザー操作     |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------- | ---------------- |
| Initial Loading                | `trendQuery.isLoading && !trendQuery.data`                       | `BillingSummaryLoadingPanel`        | なし             |
| Trend API Error                | `trendQuery.isError && !trendQuery.data`                         | 初期エラーパネル                    | `再読み込み`     |
| Trend Empty                    | `trendQuery.data && trendQuery.data.items.length === 0`          | 推移 empty 文言、詳細は月未選択状態 | 通貨切替のみ     |
| Trend Success + Detail Loading | 推移成功後、詳細取得中                                           | 推移表示 + 詳細 loading             | 通貨切替、月選択 |
| Detail API Error               | `detailQuery.isError && !detailQuery.data`                       | 詳細セクション内エラーパネル        | `再読み込み`     |
| Detail Empty                   | `detailQuery.data && detailQuery.data.vendor_items.length === 0` | `選択した月の請求はありません`      | 通貨切替、月選択 |
| Success                        | 推移成功、詳細成功                                               | 全セクション表示                    | 通常操作可能     |
| Unauthorized                   | 推移または詳細が `401`                                           | `/login` へ遷移                     | なし             |

## 10. バリデーション設計

| 項目                    | 必須 | ルール                                       | エラーメッセージ                                                          | 実装場所                    |
| ----------------------- | ---- | -------------------------------------------- | ------------------------------------------------------------------------- | --------------------------- |
| `currency`              | yes  | `JPY` または `USD` のみ                      | UI エラー表示なし。許可されたタブ操作のみ受け付ける                       | `BillingSummaryHeader.tsx`  |
| `selectedMonthOverride` | no   | `availableMonths` に含まれる場合のみ採用する | UI エラー表示なし。不正値は `default_selected_month` にフォールバックする | `BillingSummaryContent.tsx` |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - 通貨タブに `aria-label="通貨タブ"` を付ける
  - tooltip ボタンは説明用ラベルを持つ
- キーボード操作:
  - Tab で通貨タブ、月選択、tooltip、再試行ボタンへ移動できる
  - Enter / Space で各ボタン操作を実行できる
- フォーカス管理:
  - 自然な DOM 順を維持する
  - `401` 時は画面内復旧ではなくログイン画面遷移を優先する
- `aria-*` の要否:
  - `role="tablist"`, `role="tab"`
  - `aria-selected`, `aria-pressed`
  - `aria-describedby`, `aria-expanded`
  - `role="tooltip"`, `role="alert"`
- 読み上げ対応:
  - エラーパネルと tooltip を読み上げ可能にする

### 11-2. レスポンシブ

- モバイル:
  - 1 カラムで縦積み
  - 棒グラフ領域は `overflow-x-auto` で横スクロールを許容
- タブレット:
  - カード余白を拡張
  - 棒グラフの視認性を上げる
- デスクトップ:
  - `page-shell--wide` と `max-w-5xl` を使って横幅を広げる
  - セクションカードを大きめの余白で表示する
- 横スクロール回避策:
  - ページ全体は横スクロールさせず、棒グラフセクション内だけをスクロール可能にする

## 12. スタイリング方針

- `DashboardLayout` の緑系グラデーション背景の上に白系カードを重ねる
- 画面内ヘッダーと各セクションは `rounded-3xl` 前後の角丸と薄い境界線で統一する
- 通貨タブの active 状態は濃色背景、非 active は淡色背景にする
- 月別棒グラフは active を緑グラデーション、非 active をグレーグラデーションで表現する
- 支払先別バーは緑から水色へのグラデーションで金額比率を示す
- 再利用するボタン、スピナーは `shared/ui/primitives/Button` と `shared/ui/Spinner` を利用する

## 13. テスト観点

| 観点             | テスト内容                                                |
| ---------------- | --------------------------------------------------------- |
| 初期表示         | `JPY` が選択され、既定選択月の合計と内訳が表示される      |
| 通貨切替         | `USD` へ切り替えると query が再実行され、表示が更新される |
| 月選択           | 棒グラフをクリックすると対象月の詳細へ切り替わる          |
| Tooltip          | 補完件数 tooltip が開閉できる                             |
| 棒グラフ描画     | 総額 0 の月でもバー高さ計算が破綻しない                   |
| 初期 API エラー  | 月別推移失敗時にエラーパネルが表示され、再試行できる      |
| 詳細 API エラー  | 月別詳細失敗時に詳細セクションで再試行できる              |
| Empty            | 推移 0 件、支払先 0 件の両方を確認する                    |
| 認証切れ         | 推移または詳細が `401` を返したとき `/login` へ遷移する   |
| アクセシビリティ | `tab`, `tooltip`, `alert` の属性が付与される              |

## 14. 実装メモ

- この画面はフォームを持たないため `schema/` を増やさない
- 日付、件数、金額整形は `features/billing/lib` に閉じる
- `window_end_month` は API 拡張余地として残すが、現行 UI では利用しない
- `features/billing/index.ts` からは route 入口の `BillingSummaryPage` のみ公開する

## 15. 未解決事項

なし
