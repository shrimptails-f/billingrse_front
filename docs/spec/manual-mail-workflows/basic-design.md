# 手動メール取得画面 基本設計

## 1. 文書情報

- 画面名: 手動メール取得画面
- feature 名: `manual-mail-workflows`
- route: `/manual-mail-workflows`
- 利用 layout: `DashboardLayout`
- guard: `AuthGuard`
- ステータス: Draft
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router/route.tsx` で `/manual-mail-workflows` を定義する
- 画面入口は `src/features/manual-mail-workflows/screens/ManualMailWorkflowPage.tsx` に置く
- `ManualMailWorkflowPage` は薄く保ち、画面全体の状態制御は `ManualMailWorkflowContent` に寄せる
- 実行条件フォームは React Hook Form + Zod、サーバ状態は TanStack Query を使う
- メール連携一覧は `mail-account-connections` feature の query を再利用し、`shared` への早期共通化は行わない
- 履歴詳細は一覧取得済みデータを使い、追加 detail API は設けない
- 認証切れ処理は page content から一元的に `/login` へ収束させる

## 3. Routing / Layout

- route:
  - `/manual-mail-workflows`
- 遷移元:
  - `/dashboard`
  - URL 直接入力
- 遷移先:
  - Gmail 未連携時の `/mail-account-connections/gmail`
  - 認証切れ時の `/login`
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
    manual-mail-workflows/
      screens/
        ManualMailWorkflowPage.tsx
      components/
        ManualMailWorkflowContent.tsx
        WorkflowRequestForm.tsx
        WorkflowHistoryList.tsx
        WorkflowHistoryDetailModal.tsx
        workflow-history.shared.tsx
      hooks/
        useConnectionOptions.ts
        useManualMailWorkflowHistories.ts
        useStartManualMailWorkflow.ts
      api/
        manual-mail-workflow.api.ts
      schema/
        manual-mail-workflow.schema.ts
      types/
        manual-mail-workflow.types.ts
```

### 4-1. 実装ファイル案

- `screens/ManualMailWorkflowPage.tsx`:
  - route 入口
  - `ManualMailWorkflowContent` を 1 つ compose する
- `components/ManualMailWorkflowContent.tsx`:
  - イントロカード、実行条件カード、履歴カードの構成
  - 履歴ページング state と unauthorized 制御
- `components/WorkflowRequestForm.tsx`:
  - メール連携一覧取得
  - 実行条件フォーム描画
  - バリデーション
  - 受付 mutation 実行
- `components/WorkflowHistoryList.tsx`:
  - 履歴テーブル描画
  - ページング操作
  - 選択中履歴 state
  - 履歴詳細モーダル起動
- `components/WorkflowHistoryDetailModal.tsx`:
  - 履歴 1 件の検索条件とステージ別サマリー表示
  - `Escape` / backdrop close
- `components/workflow-history.shared.tsx`:
  - ステージ定義
  - ステータス / 日付 / provider 表示 helper
- `hooks/useConnectionOptions.ts`:
  - `GET /mail-account-connections` を option 形式へ整形する
- `hooks/useManualMailWorkflowHistories.ts`:
  - `GET /manual-mail-workflows` query を提供する
- `hooks/useStartManualMailWorkflow.ts`:
  - `POST /manual-mail-workflows` mutation を提供する
- `api/manual-mail-workflow.api.ts`:
  - 受付 API と履歴 API を提供する
- `schema/manual-mail-workflow.schema.ts`:
  - 入力バリデーション
  - JST 日付正規化 helper
- `types/manual-mail-workflow.types.ts`:
  - request / response / history / stage summary 型を定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - `DashboardLayout` がヘッダー、フッター、背景グラデーション、基本 `.page-shell` を提供する
  - 画面本体はイントロカード + 本文グリッドで構成する
- `.page-shell` の要否:
  - 親 layout が提供する
  - 画面内では広いレイアウト用の内側ラッパーだけを持たせる
- モバイル時の並び順:
  - イントロカード
  - 実行条件カード
  - 実行履歴カード
- デスクトップ時の拡張点:
  - 広い画面では実行条件を左、実行履歴を右に配置する
  - 履歴テーブルの視認性を優先して右カラムを広めにする

### 5-2. セクション一覧

| セクション / コンポーネント  | 役割                     | 主な表示内容                                   | 主な操作                                 |
| ---------------------------- | ------------------------ | ---------------------------------------------- | ---------------------------------------- |
| `ManualMailWorkflowContent`  | 画面全体の構成と状態束ね | タイトル、説明、フォーム、履歴、ページング制御 | 履歴再取得、ページ移動                   |
| `WorkflowRequestForm`        | 実行条件入力と受付       | メール連携、ラベル名、開始日、終了日、受付結果 | `解析実行`, `再読み込み`, Gmail 連携導線 |
| `WorkflowHistoryList`        | 履歴の描画と選択         | テーブル、件数、ページ番号、更新状態           | `再取得`, `前へ`, `次へ`, `詳細`         |
| `WorkflowHistoryDetailModal` | 履歴詳細表示             | 実行日時、workflow_id、検索条件、ステージ集計  | `閉じる`                                 |

## 6. コンポーネント責務

### 6-1. Screen

- `ManualMailWorkflowPage` は route の入口としてのみ機能する
- route 固有の UI ロジックは持たず、`ManualMailWorkflowContent` を返す

### 6-2. Page Content

- `ManualMailWorkflowContent` が画面全体の server state と page-level state を束ねる
- `offset` を持ち、現在ページと総ページ数を導出する
- 履歴件数変動に応じて `offset` を補正する
- `401` を検知した場合に token クリア、auth session query 破棄、`/login` 遷移を行う
- `WorkflowRequestForm` 成功時に履歴再取得または先頭ページ復帰を判断する

### 6-3. セクション / 部品

| コンポーネント               | 責務                                               | props                                                                                                                  | 備考                                                         |
| ---------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `WorkflowRequestForm`        | 連携一覧 query、フォーム描画、送信、フォームロック | `onWorkflowAccepted`, `onUnauthorized`                                                                                 | `isAccepted` と submit guard を内包する                      |
| `WorkflowHistoryList`        | 履歴一覧描画、ページング UI、選択履歴管理          | `currentPage`, `histories`, `isLoading`, `isError`, `isFetching`, `limit`, `onNextPage`, `onPreviousPage`, `onRefetch` | `selectedHistory` は内部 state                               |
| `WorkflowHistoryDetailModal` | 選択履歴 1 件の詳細表示と close interaction        | `history`, `onClose`                                                                                                   | 追加 API は呼ばない                                          |
| `workflow-history.shared`    | 表示変換 helper                                    | なし                                                                                                                   | status label, stage label, provider icon, date format を集約 |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook                             | queryKey / mutationKey                                      | API                                | 用途                     | 成功時の反映                                     |
| -------------------------------- | ----------------------------------------------------------- | ---------------------------------- | ------------------------ | ------------------------------------------------ |
| `useConnectionOptions`           | `['mail-account-connections']`                              | `fetchMailAccountConnections`      | 実行対象のメール連携取得 | option 配列へ整形してフォームへ渡す              |
| `useManualMailWorkflowHistories` | `['manual-mail-workflows', 'histories', { limit, offset }]` | `fetchManualMailWorkflowHistories` | 履歴取得                 | query cache を描画に利用する                     |
| `useStartManualMailWorkflow`     | mutation                                                    | `startManualMailWorkflow`          | ワークフロー受付         | 成功時にフォームロック、履歴再取得 or `offset=0` |

- server state を local state にコピーしない
- 履歴は `limit` / `offset` ごとに query key を分ける
- Gmail 連携一覧は `mail-account-connections` feature と同じ query key を共有する

### 7-2. フォーム状態

- 使用有無:
  - 使用する
- 利用 schema:
  - `manualMailWorkflowSchema`
- 初期値:
  - `connectionId: ''`
  - `labelName: ''`
  - `since: 当月初日`
  - `until: 当月末日`
- submit 処理:
  - `handleSubmit` で Zod バリデーション後、`since` / `until` を JST 日付境界付き文字列へ変換して mutation を呼ぶ
- disable 条件:
  - `isAccepted`
  - `startMutation.isPending`
  - `isSubmittingLocally`
  - `connectionQuery.isLoading`
  - `connectionQuery.isError`
  - `hasNoConnections`

### 7-3. ローカル UI 状態

| state                 | 型                                      | 初期値  | 用途                                         |
| --------------------- | --------------------------------------- | ------- | -------------------------------------------- |
| `offset`              | `number`                                | `0`     | 履歴ページング                               |
| `serverError`         | `string \| null`                        | `null`  | 受付失敗文言                                 |
| `isAccepted`          | `boolean`                               | `false` | 受付成功後のフォームロック                   |
| `isSubmittingLocally` | `boolean`                               | `false` | mutation callback 完了までのローカル送信状態 |
| `selectedHistory`     | `ManualMailWorkflowHistoryItem \| null` | `null`  | 詳細モーダル対象                             |
| `submitGuardRef`      | `boolean` 相当                          | `false` | 同一マウント中の重複送信防止                 |

- `currentPage`, `totalCount`, `totalPages`, `canGoPrevious`, `canGoNext` は導出値として扱う
- ページ移動時は `selectedHistory` をリセットする

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数                        | Method | Endpoint                    | request                                       | response                           | 備考                        |
| ---------------------------------- | ------ | --------------------------- | --------------------------------------------- | ---------------------------------- | --------------------------- |
| `fetchMailAccountConnections`      | GET    | `/mail-account-connections` | なし                                          | `{ items }`                        | `retryOnUnauthorized: true` |
| `startManualMailWorkflow`          | POST   | `/manual-mail-workflows`    | `{ connection_id, label_name, since, until }` | `{ message, workflow_id, status }` | `retryOnUnauthorized: true` |
| `fetchManualMailWorkflowHistories` | GET    | `/manual-mail-workflows`    | `{ limit, offset }`                           | `{ items, total_count }`           | `retryOnUnauthorized: true` |

### 8-2. データ変換

- メール連携一覧 item は `ConnectionOption` に変換する
  - `value`: `String(id)`
  - `label`: `${provider.toUpperCase()} / ${account_identifier}`
- `since`, `until` は `YYYY-MM-DD` から `YYYY-MM-DDT00:00:00+09:00` / `YYYY-MM-DDT23:59:00+09:00` に変換する
- `queued_at` は `Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo' })` で表示用に整形する
- 履歴詳細の `since`, `until` は先頭 10 文字を利用して日付表示する
- `status` はバッジ文言と色クラスに変換する
- `current_stage` はステージ表示用ラベルに変換する
- `provider` は icon map に変換し、未知値は `MailFallbackIcon` へフォールバックする
- failures が 0 件なら `なし` を表示する

### 8-3. エラー処理

- メール連携一覧取得失敗時の表示位置:
  - 実行条件カード内のフォーム上部
- 受付失敗時の表示位置:
  - 実行条件カード内のフォーム直上
- 履歴取得失敗時の表示位置:
  - 実行履歴カード内のテーブル上部
- 再試行方法:
  - メール連携一覧は `再読み込み`
  - 履歴一覧は `再取得`
  - 受付失敗はフォーム内容を維持したまま `解析実行` を再試行
- `401` 発生時の挙動:
  - API クライアントがリフレッシュを 1 回試行する
  - それでも `401` の場合、token を削除し `authSessionQueryKey` を破棄して `/login` に遷移する
- 履歴詳細モーダル:
  - 追加 API を呼ばないため、モーダル単体の通信エラーは持たない

## 9. UI 状態設計

| 状態               | 条件                         | 表示                         | ユーザー操作                       |
| ------------------ | ---------------------------- | ---------------------------- | ---------------------------------- |
| Connection Loading | メール連携一覧取得中         | スピナー、説明文             | 制限あり                           |
| Connection Error   | メール連携一覧取得失敗       | エラーアラート、`再読み込み` | 再試行可能                         |
| No Connections     | 連携 0 件                    | Gmail 連携案内、導線リンク   | Gmail 連携画面へ遷移               |
| History Loading    | 履歴初回取得中               | スピナー                     | 制限あり                           |
| History Empty      | 履歴 0 件                    | Empty 文言                   | フォーム送信可能                   |
| History Ready      | 履歴 1 件以上                | テーブル、ページング、`詳細` | 通常操作可能                       |
| History Refreshing | 履歴再取得中かつ初回ではない | `更新中`                     | 他操作は継続可能                   |
| Submitting         | 受付 mutation 中             | `解析実行中...`、ボタン無効  | 再操作不可                         |
| Accepted           | 受付成功後                   | `受付済み`、成功メッセージ   | フォーム操作不可                   |
| Validation Error   | Zod バリデーション失敗       | 入力直下エラー               | 修正可能                           |
| API Error          | 受付 or 履歴 API 失敗        | セクション内アラート         | 再試行可能                         |
| Detail Modal Open  | 履歴選択中                   | dialog 表示                  | `閉じる`, `Escape`, backdrop click |
| Unauthorized       | API が `401`                 | 画面遷移                     | `/login` へ遷移                    |

## 10. バリデーション設計

| 項目             | 必須 | ルール                 | エラーメッセージ                                          | 実装場所                         |
| ---------------- | ---- | ---------------------- | --------------------------------------------------------- | -------------------------------- |
| `connectionId`   | yes  | 1 件選択されていること | `メール連携を選択してください。`                          | `manual-mail-workflow.schema.ts` |
| `labelName`      | yes  | trim 後 1 文字以上     | `ラベル名を入力してください。`                            | `manual-mail-workflow.schema.ts` |
| `since`          | yes  | `YYYY-MM-DD` 形式      | `開始日を入力してください。` / `開始日の形式が不正です。` | `manual-mail-workflow.schema.ts` |
| `until`          | yes  | `YYYY-MM-DD` 形式      | `終了日を入力してください。` / `終了日の形式が不正です。` | `manual-mail-workflow.schema.ts` |
| `until >= since` | yes  | 相関チェック           | `終了日は開始日以降にしてください。`                      | `manual-mail-workflow.schema.ts` |

- 送信直前に `toJstStartOfDayString` / `toJstEndOfDayString` が `null` を返した場合は、フォーム上部にサーバエラー扱いで表示する
- `labelName` の文字数上限・文字種制約は将来 backend 契約確定時に schema へ追加する

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - `メール連携`, `ラベル名` は `label` と `id` を関連付ける
  - 日付入力はグループ見出し `検索日付範囲` の下で各 `aria-label` を持つ
- キーボード操作:
  - Tab 順でフォーム、再試行、ページング、`詳細`、モーダル `閉じる` に到達できる
- フォーカス管理:
  - モーダル open 時は dialog 内へフォーカスを移す
  - close 時はトリガーとなった `詳細` ボタンへ戻す方針とする
- `aria-*` の要否:
  - エラー領域に `role="alert"` または `aria-live="polite"`
  - スピナーに読み上げラベル
  - dialog に `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 読み上げ対応:
  - 受付結果、履歴取得失敗、モーダル内ワークフローエラーが読み上げ可能であること

### 11-2. レスポンシブ

- モバイル:
  - 1 カラム
  - フォーム入力は全幅
  - テーブルは `overflow-x-auto` で横スクロール可能にする
- タブレット:
  - 1 カラム維持
  - カード内余白を広げる
- デスクトップ:
  - 右カラムをやや広くした 2 カラム構成へ拡張可能にする
  - イントロカードは全幅で維持する
- 横スクロール回避策:
  - フォームは固定幅を持たせない
  - 履歴テーブルだけをスクロールコンテナ化し、ページ全体の横スクロールは避ける

## 12. スタイリング方針

- `DashboardLayout` の白ベース + 緑アクセント + 背景グラデーションを継承する
- イントロカード、実行条件カード、履歴カードは `rounded-3xl`, 薄いボーダー, 白背景, シャドウを基本とする
- タイトルは濃い slate、補助文は muted slate、アイブロウは emerald を使う
- フォーム入力は `TextField` と feature 内 `SelectField` を使い、focus 時は緑系リングで統一する
- CTA とページング、モーダル close は `shared/ui/primitives/Button` を使う
- provider icon は `shared/ui/icons/GmailIcon` と `MailFallbackIcon` を使う

## 13. テスト観点

| 観点               | テスト内容                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| 初期表示           | タイトル、注意文、実行条件、実行履歴が表示される                                        |
| デフォルト値       | 開始日 / 終了日が当月初日 / 当月末日で初期化される                                      |
| Connection Loading | メール連携取得中にスピナーが表示される                                                  |
| Connection Error   | 取得失敗時にアラートと `再読み込み` が表示される                                        |
| No Connections     | Gmail 連携案内と遷移リンクが表示され、`解析実行` が無効になる                           |
| バリデーション     | `終了日 < 開始日` で相関エラーが表示される                                              |
| 受付成功           | 正規化済み payload で mutation が呼ばれ、成功後に履歴再取得とフォームロックが行われる   |
| 受付失敗           | `401` で `/login` へ遷移し、一般エラーでフォーム上部エラーが表示される                  |
| 履歴表示           | ステータス、現在ステージ、メールアドレス、件数、ページングが表示される                  |
| ページング         | `前へ` / `次へ` に応じて `offset` が更新される                                          |
| 履歴詳細           | dialog が開き、検索条件、ステージ表、失敗メッセージ、ワークフロー全体エラーが表示される |
| Unauthorized       | 履歴 query が `401` を返したとき `/login` へ遷移する                                    |

## 14. 実装メモ

- 受付成功時の `isAccepted` は page reload では維持しない
- `onWorkflowAccepted` は現在ページが 1 ページ目なら `refetch`、それ以外なら `offset=0` を優先する
- 履歴件数が減って現在 `offset` が範囲外になった場合は、最終有効ページへ補正する
- 履歴詳細は feature 固有の表現が多いため、当面 `shared/ui` に切り出さない

## 15. 未解決事項

- `label_name` の入力上限が backend と未確定
- 受付成功後に明示的な `新しい実行条件で再度実行` 導線を設けるかは要件確認待ち
