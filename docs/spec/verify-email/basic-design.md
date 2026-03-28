# メール認証画面 基本設計

## 1. 文書情報

- 画面名: メール認証画面
- feature 名: `auth`
- route: `/signup/verify`
- 利用 layout: `AuthScreenLayout`
- guard: なし。公開画面として扱う
- ステータス: Draft
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router/route.tsx` で `/signup/verify` route を定義する
- 画面入口は `src/features/auth/screens/VerifyEmailPage.tsx` に置く
- screen は `AuthScreenLayout` と `VerifyEmailContent` を compose する薄い入口に保つ
- メール認証実行は TanStack Query の mutation `useVerifyEmail` に寄せる
- フォームは持たず、状態判定は query parameter とローカル state で扱う

## 3. Routing / Layout

- route:
  - `/signup/verify`
- 遷移元:
  - 確認メールのリンク
  - `/signup/email-sent` からの再訪
  - URL 直接入力
- 遷移先:
  - 成功時:
    - `/dashboard`
    - `/login`
  - 失敗時 / 欠損時:
    - `/signup/email-resend`
    - `/signup`
    - `/login`
- layout:
  - `AuthScreenLayout`
- guard:
  - route 自体には適用しない
  - `/dashboard` 遷移後の認証判定は `AuthGuard` に委ねる
- URL parameter / query parameter:
  - `token`: メール認証 API 実行に使用する主要 query

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    auth/
      screens/
        VerifyEmailPage.tsx
      components/
        AuthScreenLayout.tsx
        VerifyEmailContent.tsx
      hooks/
        useVerifyEmail.ts
      api/
        verify-email.api.ts
```

### 4-1. 実装ファイル案

- `screens/VerifyEmailPage.tsx`:
  - route 入口
  - `AuthScreenLayout` と `VerifyEmailContent` を組み合わせる
- `components/VerifyEmailContent.tsx`:
  - query parameter 解析、mutation 実行、状態別 UI、画面遷移を担う
- `components/AuthScreenLayout.tsx`:
  - 認証画面共通の背景、中央寄せ、`.page-shell` を担う
- `hooks/useVerifyEmail.ts`:
  - `POST /auth/email/verify` を呼ぶ mutation を提供する
- `api/verify-email.api.ts`:
  - verify API の request / response 契約を定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - 全画面高の背景
  - 中央寄せされた認証カード
  - カード内に見出しブロックとステータスパネルを配置する
- `.page-shell` の要否:
  - 必須
- モバイル時の並び順:
  - 状態ラベル
  - タイトル
  - 説明文
  - ステータスパネル
  - 状態別アクション
- デスクトップ時の拡張点:
  - カード幅は `max-w-lg` を上限目安とする
  - 背景余白を広げて単一アクションに集中させる

### 5-2. セクション一覧

| セクション / コンポーネント | 役割                   | 主な表示内容                         | 主な操作           |
| --------------------------- | ---------------------- | ------------------------------------ | ------------------ |
| `AuthScreenLayout`          | 認証画面共通レイアウト | 背景グラデーション、中央寄せコンテナ | なし               |
| `VerifyEmailContent`        | メール認証画面本体     | タイトル、説明、状態パネル、ボタン群 | API 実行、画面遷移 |
| `Spinner`                   | 認証中表示             | スピナー、待機状態                   | なし               |
| `Button`                    | 次アクション導線       | プライマリ / セカンダリ CTA          | 画面遷移           |

## 6. コンポーネント責務

### 6-1. Screen

- `VerifyEmailPage` は route の入口としてのみ機能する
- `AuthScreenLayout` の内側に `VerifyEmailContent` を 1 つ compose する

### 6-2. Page Content

- `VerifyEmailContent` が画面全体の状態を束ねる
- `useSearchParams` で `token` を取得する
- `useVerifyEmail` を呼び、`useEffect` で初期認証を開始する
- 認証結果に応じて見出し、メッセージ、ボタン群を切り替える

### 6-3. セクション / 部品

| コンポーネント       | 責務                           | props                        | 備考                                        |
| -------------------- | ------------------------------ | ---------------------------- | ------------------------------------------- |
| `AuthScreenLayout`   | 認証画面の共通レイアウト描画   | `children`                   | 他の auth 画面でも再利用                    |
| `VerifyEmailContent` | token 解決、状態遷移、画面遷移 | なし                         | `useNavigate`, `useSearchParams` を内部利用 |
| `Spinner`            | pending 表示                   | `size`, `className` など     | 認証中のみ表示                              |
| `Button`             | 結果ごとの導線表示             | `type`, `variant`, `onClick` | 成功時と失敗時で出し分ける                  |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook             | queryKey / mutationKey | API           | 用途                   | 成功時の反映                                            |
| ---------------- | ---------------------- | ------------- | ---------------------- | ------------------------------------------------------- |
| `useVerifyEmail` | mutation               | `verifyEmail` | 初期表示時のメール認証 | `status='success'`, `message` 更新、URL から token 除去 |

- query は持たず、verify API は mutation として扱う
- server state を local state にコピーするのは UI 表示に必要な最小限の `status` と `message` に限る

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
  - 該当なし

### 7-3. ローカル UI 状態

| state           | 型                                               | 初期値                          | 用途                      |
| --------------- | ------------------------------------------------ | ------------------------------- | ------------------------- |
| `status`        | `'pending' \| 'success' \| 'error' \| 'missing'` | `token` 有無で切替              | 画面全体の表示分岐        |
| `message`       | `string \| null`                                 | pending 用または missing 用文言 | 状態結果メッセージ        |
| `hasStartedRef` | `string \| null`                                 | `null`                          | 同一 token の二重実行防止 |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数   | Method | Endpoint             | request     | response              | 備考                                            |
| ------------- | ------ | -------------------- | ----------- | --------------------- | ----------------------------------------------- |
| `verifyEmail` | POST   | `/auth/email/verify` | `{ token }` | `VerifyEmailResponse` | `attachAuthToken: false`, `credentials: 'omit'` |

### 8-2. データ変換

- query parameter `token` を取得し、`mutateAsync(token)` に渡す
- 成功時は `response.message` を優先表示し、欠損時は既定文言を使う
- `window.history.replaceState(null, '', '/signup/verify')` で URL から token を除去する
- 再送先は常に `/signup/email-resend` とする
- 状態別タイトルと説明文は `Status` ごとの定数マップで管理する

### 8-3. エラー処理

- API エラー時の表示位置:
  - カード内ステータスパネル中央
- 再試行方法:
  - 同画面での再実行は行わず、`確認メールを再送する` に誘導する
- `401` 発生時の挙動:
  - 公開画面のためリダイレクトは行わず、汎用エラーとして表示する
- エラー文言変換:
  - `400 + invalid_token` は `不正なトークンです。`
  - その他は汎用エラーメッセージ

## 9. UI 状態設計

| 状態      | 条件                            | 表示                                   | ユーザー操作                   |
| --------- | ------------------------------- | -------------------------------------- | ------------------------------ |
| `pending` | `token` あり、verify API 実行中 | スピナー、待機文言、認証中タイトル     | なし                           |
| `success` | verify API 成功                 | 成功アイコン、成功文言、成功タイトル   | ダッシュボード / ログイン遷移  |
| `error`   | verify API 失敗                 | エラーアイコン、失敗文言、失敗タイトル | 再送 / 会員登録 / ログイン遷移 |
| `missing` | `token` なし                    | 欠損アイコン、欠損文言、欠損タイトル   | 再送 / 会員登録 / ログイン遷移 |

## 10. バリデーション設計

| 項目    | 必須           | ルール                                 | エラーメッセージ                   | 実装場所                            |
| ------- | -------------- | -------------------------------------- | ---------------------------------- | ----------------------------------- |
| `token` | 条件付きで yes | 存在する場合のみ verify API を実行する | `トークンが見つかりませんでした。` | `components/VerifyEmailContent.tsx` |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - 入力フォームは持たないため不要
- キーボード操作:
  - Tab で表示中ボタンへ自然に移動できる
  - Enter / Space でボタン操作できる
- フォーカス管理:
  - 認証中から結果表示への切替時も自然な DOM 順を維持する
  - 自動フォーカス移動は行わない
- `aria-*` の要否:
  - 状態メッセージに `aria-live="polite"`
  - エラー時に必要なら `role="alert"` 相当を検討できるが、現状はライブリージョン優先
- 読み上げ対応:
  - アイコンに依存せず、状態文言を必ず併記する

### 11-2. レスポンシブ

- モバイル:
  - 全幅カード
  - 左右 16px の余白
  - ボタンは縦並びでフル幅
- タブレット:
  - カード幅を拡張しつつ中央寄せ
  - 余白と文字サイズを保って 1 カラム継続
- デスクトップ:
  - 縦中央寄せ
  - 背景グラデーションを広く見せる
- 横スクロール回避策:
  - カードとボタンを `w-full` 基準で組む
  - 固定幅を避け、最大幅のみ制限する

## 12. スタイリング方針

- 白ベース、緑アクセント、淡い背景グラデーションを使う
- `.page-shell` による左右余白と中央寄せを基本とする
- カードは `rounded-3xl`、薄いボーダー、軽いシャドウで認証系 UI として統一する
- ステータスパネルは `bg-slate-50` をベースにし、成功時は緑、失敗時は赤のアクセントを乗せる
- スペーシングは 8 / 12 / 16 / 24 / 32 を中心に組む

## 13. テスト観点

| 観点         | テスト内容                                                                |
| ------------ | ------------------------------------------------------------------------- |
| トークン欠損 | `token` なしで `missing` 状態が表示され、API が呼ばれない                 |
| 認証中表示   | `token` ありで初期表示時に pending 文言とスピナーが表示される             |
| 成功系       | verify API 成功時に成功文言が表示され、`mutateAsync(token)` が呼ばれる    |
| エラー系     | `invalid_token` で専用文言、それ以外で汎用文言が表示される                |
| 導線表示     | 成功時は dashboard/login、失敗時は resend/signup/login ボタンが表示される |
| URL 更新     | 成功時に `window.history.replaceState` で token が URL から除去される     |
| 二重実行防止 | Strict Mode や再描画でも同一 token の API 実行が重複しない                |
| 再送導線     | 失敗時と欠損時に常に `/signup/email-resend` へ遷移する                    |

## 14. 実装メモ

- `useEffect` で mutation を起動するため、`hasStartedRef` による idempotent 制御を維持する
- verify 成功後に token を URL に残すと再読み込みや共有時のリスクがあるため、URL 置換を行う
- 認証成功後の自動ログインは入れず、次アクションは明示ボタンで選ばせる

## 15. 未解決事項

なし
