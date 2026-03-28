# メールアカウント連携画面 基本設計

## 1. 文書情報

- 画面名: メールアカウント連携画面
- feature 名: `mail-account-connections`
- route: `/mail-account-connections/gmail`
- 利用 layout: `DashboardLayout`
- guard: `AuthGuard`
- ステータス: Draft
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router` で `/mail-account-connections/gmail` と `/mail-account-connections/gmail/callback` を定義する
- 画面入口は `src/features/mail-account-connections/screens/` に置く
- メイン画面は `GmailConnectionPage` を薄く保ち、状態制御は `GmailConnectionContent` に寄せる
- 連携一覧は TanStack Query、OAuth 開始と解除は mutation で扱う
- フォーム入力がないため React Hook Form / Zod は本画面では使わない
- プロバイダ固有の OAuth 処理は feature 内に閉じ、共通 UI は `shared/ui` を利用する

## 3. Routing / Layout

- route:
  - `/mail-account-connections/gmail`
- 関連 route:
  - `/mail-account-connections/gmail/callback`
- 遷移元:
  - `AppHeader` のメニュー
  - `manual-mail-workflows` の未連携導線
  - URL 直接アクセス
- 遷移先:
  - OAuth 開始成功時は Google の `authorization_url`
  - `ホームへ戻る` で `/dashboard`
  - コールバック成功 / 失敗時の操作先として `/mail-account-connections/gmail` と `/dashboard`
- layout:
  - `DashboardLayout`
- guard:
  - `AuthGuard`
- URL parameter / query parameter:
  - メイン画面はなし
  - コールバック画面は `code`, `state`, `error` を受け取る

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    mail-account-connections/
      screens/
        GmailConnectionPage.tsx
        GmailOAuthCallbackPage.tsx
      components/
        GmailConnectionContent.tsx
        ConnectionList.tsx
        ConnectionRow.tsx
        GmailOAuthCallbackContent.tsx
      hooks/
        useConnectionList.ts
        useDisconnect.ts
        useStartGmailOAuth.ts
        useCompleteGmailOAuth.ts
      api/
        mail-account-connections.api.ts
        gmail-oauth.api.ts
      types/
        mail-account-connections.types.ts
        gmail-oauth.types.ts
```

### 4-1. 実装ファイル案

- `screens/GmailConnectionPage.tsx`:
  - route 入口
  - `GmailConnectionContent` を 1 つ compose する
- `screens/GmailOAuthCallbackPage.tsx`:
  - OAuth コールバック route 入口
  - 中央寄せレイアウト内で `GmailOAuthCallbackContent` を表示する
- `components/GmailConnectionContent.tsx`:
  - タイトル、説明文、`連携追加`、ページ全体のエラー、戻る導線を扱う
- `components/ConnectionList.tsx`:
  - 一覧 query、empty / loading / error 分岐、解除処理を扱う
- `components/ConnectionRow.tsx`:
  - 1 行の描画責務に限定する
- `components/GmailOAuthCallbackContent.tsx`:
  - クエリパラメータ解釈、完了 API 実行、成功 / 失敗表示を扱う
- `hooks/useConnectionList.ts`:
  - 一覧 query を提供する
- `hooks/useDisconnect.ts`:
  - 解除 mutation と query invalidate を提供する
- `hooks/useStartGmailOAuth.ts`:
  - OAuth 開始 mutation を提供する
- `hooks/useCompleteGmailOAuth.ts`:
  - コールバック完了 mutation を提供する
- `api/mail-account-connections.api.ts`:
  - 一覧取得と解除 API を扱う
- `api/gmail-oauth.api.ts`:
  - OAuth 開始と完了 API を扱う
- `types/mail-account-connections.types.ts`:
  - 一覧 item / response 型を定義する
- `types/gmail-oauth.types.ts`:
  - OAuth response / error 型を定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - `DashboardLayout` が背景、ヘッダー、フッター、`.page-shell` を提供する
  - 画面本体は中央寄せカード 1 枚で構成する
- `.page-shell` の要否:
  - 親 layout が提供するため、画面内で再定義しない
- モバイル時の並び順:
  - アイブロウ
  - タイトル
  - 説明文
  - `連携追加`
  - 画面全体のエラー
  - 連携済みアカウント一覧
  - `ホームへ戻る`
- デスクトップ時の拡張点:
  - カードの最大幅を `max-w-2xl` 程度に制御する
  - 横幅が広がっても 1 カラムを維持する

### 5-2. セクション一覧

| セクション / コンポーネント | 役割                 | 主な表示内容                                     | 主な操作                     |
| --------------------------- | -------------------- | ------------------------------------------------ | ---------------------------- |
| `GmailConnectionContent`    | メイン画面全体の構成 | タイトル、説明、主要 CTA、一覧、戻る導線         | OAuth 開始、ホーム遷移       |
| `ConnectionList`            | 一覧状態の管理と描画 | Loading、Empty、Error、連携済み行                | 解除                         |
| `ConnectionRow`             | 1 行の描画           | プロバイダアイコン、アカウント識別子、解除ボタン | 解除                         |
| `GmailOAuthCallbackContent` | 関連画面の状態表示   | Pending、Success、Error、再試行導線              | 連携ページへ戻る、ホーム遷移 |

## 6. コンポーネント責務

### 6-1. Screen

- `GmailConnectionPage` は route の入口としてのみ機能する
- `GmailOAuthCallbackPage` は callback 画面の入口としてのみ機能する

### 6-2. Page Content

- `GmailConnectionContent` がメイン画面の状態を束ねる
- `useStartGmailOAuth` を呼び、成功時に `location.assign` で外部遷移する
- `ConnectionList` を compose して一覧表示を委譲する

### 6-3. セクション / 部品

| コンポーネント              | 責務                                             | props                                                              | 備考                                                     |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| `GmailConnectionContent`    | メイン画面の骨格、OAuth 開始、画面全体エラー表示 | なし                                                               | `serverError` を内部 state で持つ                        |
| `ConnectionList`            | 一覧 query、解除 mutation、描画分岐              | なし                                                               | `disconnectError`, `disconnectingId` を内部 state で持つ |
| `ConnectionRow`             | 一覧 1 行の描画                                  | `provider`, `accountIdentifier`, `onDisconnect`, `isDisconnecting` | 表示責務に限定する                                       |
| `GmailOAuthCallbackContent` | callback query 解釈、完了 API 実行、状態別表示   | なし                                                               | Strict Mode 下の二重実行を防ぐ                           |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook                    | queryKey / mutationKey         | API                               | 用途          | 成功時の反映                                 |
| ----------------------- | ------------------------------ | --------------------------------- | ------------- | -------------------------------------------- |
| `useConnectionList`     | `['mail-account-connections']` | `fetchMailAccountConnections`     | 初期一覧取得  | query cache に保持                           |
| `useDisconnect`         | mutation                       | `disconnectMailAccountConnection` | 連携解除      | `['mail-account-connections']` を invalidate |
| `useStartGmailOAuth`    | mutation                       | `requestGmailAuthorization`       | OAuth 開始    | 成功時に外部遷移                             |
| `useCompleteGmailOAuth` | mutation                       | `completeGmailOAuth`              | callback 完了 | 関連画面で成功状態へ遷移                     |

- server state を別 store にコピーしない
- callback 完了後の一覧更新は、連携画面再訪時の query refetch を基本とする
- query の stale policy が変わる場合は callback 成功時 invalidate を追加検討する

### 7-2. フォーム状態

- 使用有無:
  - メイン画面では使用しない
  - callback 画面も URL クエリ起点のため RHF は使用しない
- 利用 schema:
  - なし
- 初期値:
  - なし
- submit 処理:
  - `連携追加` は click handler から mutation を直接呼ぶ
- disable 条件:
  - OAuth 開始中
  - 対象行の解除中

### 7-3. ローカル UI 状態

| state             | 型                                               | 初期値               | 用途                             |
| ----------------- | ------------------------------------------------ | -------------------- | -------------------------------- |
| `serverError`     | `string \| null`                                 | `null`               | OAuth 開始失敗の表示             |
| `disconnectError` | `string \| null`                                 | `null`               | 解除失敗の表示                   |
| `disconnectingId` | `number \| null`                                 | `null`               | 解除中の行を特定する             |
| `status`          | `'pending' \| 'success' \| 'error' \| 'missing'` | クエリから算出       | callback 画面の表示状態          |
| `message`         | `string`                                         | 初期 status から算出 | callback 画面の文言              |
| `hasStartedRef`   | `string \| null`                                 | `null`               | callback mutation の重複実行防止 |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数                       | Method | Endpoint                                    | request           | response                            | 備考                        |
| --------------------------------- | ------ | ------------------------------------------- | ----------------- | ----------------------------------- | --------------------------- |
| `fetchMailAccountConnections`     | GET    | `/mail-account-connections`                 | なし              | `{ items }`                         | `retryOnUnauthorized: true` |
| `disconnectMailAccountConnection` | DELETE | `/mail-account-connections/{connectionId}`  | path parameter    | `void`                              | `retryOnUnauthorized: true` |
| `requestGmailAuthorization`       | POST   | `/mail-account-connections/gmail/authorize` | なし              | `{ authorization_url, expires_at }` | `retryOnUnauthorized: true` |
| `completeGmailOAuth`              | POST   | `/mail-account-connections/gmail/callback`  | `{ code, state }` | `{ message }`                       | `retryOnUnauthorized: true` |

### 8-2. データ変換

- `provider` は `toLowerCase()` してアイコンマップへ変換する
- 未知の `provider` は `MailFallbackIcon` にフォールバックする
- OAuth 開始レスポンスで `authorization_url` が空の場合はエラー扱いにする
- callback 画面では `code`, `state`, `error` の有無から `pending / success / error / missing` を導出する
- callback の API エラーは `status` と `code` を使って日本語メッセージへ変換する
- callback 処理後は `history.replaceState` でクエリを除去する

### 8-3. エラー処理

- OAuth 開始失敗時の表示位置:
  - `連携追加` の直下
- 一覧取得失敗時の表示位置:
  - `連携済みアカウント` セクション内
- 解除失敗時の表示位置:
  - 一覧セクション上部
- 再試行方法:
  - OAuth 開始は再度 `連携追加`
  - 一覧取得失敗は画面再読み込みまたは再訪
  - 解除失敗は再度 `解除`
  - callback 失敗は `もう一度やり直す`
- `401` 発生時の挙動:
  - API クライアントがリフレッシュを 1 回試行する
  - それでも `401` の場合、現行方針では画面内エラー文言を表示する
  - `/login` へ即時遷移するかは未解決事項で管理する

## 9. UI 状態設計

| 状態             | 条件                                          | 表示                                  | ユーザー操作               |
| ---------------- | --------------------------------------------- | ------------------------------------- | -------------------------- |
| Initial Loading  | 一覧 query 初回取得中                         | スピナー、一覧非表示                  | 制限あり                   |
| Empty            | 一覧取得成功かつ 0 件                         | 空文言、`連携追加`                    | OAuth 開始可能             |
| List Ready       | 一覧取得成功かつ 1 件以上                     | 連携行の一覧                          | 解除可能                   |
| Start Submitting | OAuth 開始 mutation 中                        | `連携追加` ローディング、ホーム非活性 | 再操作不可                 |
| Disconnecting    | 解除 mutation 中の行                          | 対象行のみ `解除中...`                | 他行は通常操作可能         |
| API Error        | 一覧 / 開始 / 解除の失敗                      | セクション直近の alert                | 再試行可能                 |
| Callback Pending | `code` と `state` があり完了処理中            | スピナー、説明文                      | 制限あり                   |
| Callback Success | callback 完了成功                             | 成功アイコン、メッセージ、戻るボタン  | 連携画面またはホームへ遷移 |
| Callback Error   | Google 側キャンセル、API 失敗、必要クエリ欠損 | エラーアイコン、再試行導線            | 連携画面またはホームへ遷移 |

## 10. バリデーション設計

| 項目 | 必須 | ルール                         | エラーメッセージ | 実装場所 |
| ---- | ---- | ------------------------------ | ---------------- | -------- |
| なし | -    | 本画面は入力フォームを持たない | -                | -        |

- `解除` は確認ダイアログで承認された場合のみ実行する
- callback 画面は `code` と `state` の両方が存在する場合のみ完了 API を実行する

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - 入力フォームは持たないため不要
- キーボード操作:
  - Tab で `連携追加`、各行の `解除`、`ホームへ戻る`、callback 画面の各ボタンへ移動できる
- フォーカス管理:
  - 自然な DOM 順を維持する
  - callback の状態変化後もボタン群へ自然に移動できる構造とする
- `aria-*` の要否:
  - エラー領域に `role="alert"` と `aria-live="polite"`
  - スピナーに読み上げラベル
  - コールバック結果文言に `aria-live="polite"`
- 読み上げ対応:
  - 主要な失敗理由と次アクションが読み上げ可能であること

### 11-2. レスポンシブ

- モバイル:
  - 1 カラム
  - 主要ボタンはタップしやすい高さを維持する
  - 一覧行は横スクロールを避ける
- タブレット:
  - カード幅を拡張するが構造は変えない
- デスクトップ:
  - カード最大幅を制御し、一覧可読性を優先する
- 横スクロール回避策:
  - 親 card を `w-full` 基準にし、固定幅を避ける
  - 長い `account_identifier` を表示してもボタンを押せる余白を確保する

## 12. スタイリング方針

- `DashboardLayout` の白ベース + 緑アクセント + 背景グラデーションに合わせる
- メインカードは白背景、薄いボーダー、`rounded-3xl`、シャドウで構成する
- アイブロウは緑、見出しは濃い slate、本文は muted トーンを使う
- 主要 CTA と戻る導線は `shared/ui/primitives/Button.tsx` を使う
- 一覧行は境界線で区切り、アイコンと操作を左右に分けて視認性を確保する

## 13. テスト観点

| 観点                | テスト内容                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| 初期表示            | タイトル、説明文、`連携追加`、一覧見出し、`ホームへ戻る` が表示される      |
| Loading             | 一覧取得中にスピナーが表示される                                           |
| Empty               | 0 件時に空状態文言が表示される                                             |
| 一覧表示            | 連携行が provider と account identifier 付きで描画される                   |
| OAuth 開始成功      | `authorization_url` へ `location.assign` される                            |
| OAuth 開始失敗      | `401` と一般エラーで適切な文言が表示される                                 |
| 解除操作            | 確認ダイアログ承認時のみ mutation が呼ばれる                               |
| 解除エラー          | `401`, `404`, その他で適切な文言が表示される                               |
| callback 欠損       | `code` / `state` 欠損時に missing 表示となる                               |
| callback キャンセル | `error=access_denied` のとき backend を呼ばずに失敗表示となる              |
| callback 成功       | Strict Mode 下でも完了 API が 1 回だけ呼ばれ、成功後に戻る導線が表示される |
| callback エラー     | `oauth_state_expired` などコード別文言が表示される                         |

## 14. 実装メモ

- `ConnectionRow` は現時点では feature 固有コンポーネントとして閉じる
- Gmail 以外の provider を追加する場合も、一覧 API は `mail-account-connections` で共有し、OAuth 開始 / callback だけを provider ごとに分ける
- `401` の共通処理が必要になった場合は、`manual-mail-workflows` と合わせて feature 内 helper または shared hook 化を検討する

## 15. 未解決事項

なし
