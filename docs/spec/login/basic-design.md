# ログイン画面 基本設計

## 1. 文書情報

- 画面名: ログイン画面
- feature 名: `auth`
- route: `/login`
- 利用 layout: `AuthScreenLayout`
- guard: なし
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router` で `/login` route を定義する
- 画面入口は `src/features/auth/screens/LoginPage.tsx` に置く
- screen は `AuthScreenLayout` と `LoginForm` を compose する薄い入口に保つ
- フォーム状態は React Hook Form + Zod、認証送信は TanStack Query の mutation で扱う
- トークン保持は `shared/auth/token.ts` に集約し、画面から直接保持ロジックを書かない
- 画面固有 UI は `features/auth` に閉じ、既存の `Button` / `TextField` を再利用する

## 3. Routing / Layout

- route:
  - `/login`
- 遷移元:
  - URL 直接アクセス
  - `AuthGuard` 配下の保護画面からのリダイレクト
  - `/signup`
- 遷移先:
  - ログイン成功時は `AuthGuard` から渡された `location.state.from` の内部ルートを優先し、未指定や不正値は `/dashboard`
  - セカンダリアクションで `/signup`
- layout:
  - `AuthScreenLayout`
- guard:
  - route 自体には適用しない
  - 認証済みユーザーが直接到達しても画面表示を許容する
- URL parameter / query parameter:
  - なし
  - URL ではなく router state に `from` を持つ想定

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    auth/
      screens/
        LoginPage.tsx
      components/
        AuthScreenLayout.tsx
        LoginForm.tsx
      hooks/
        useLogin.ts
      api/
        login.api.ts
      schema/
        login.schema.ts
```

### 4-1. 実装ファイル案

- `screens/LoginPage.tsx`:
  - route 入口
  - `AuthScreenLayout` と `LoginForm` を組み合わせる
- `components/AuthScreenLayout.tsx`:
  - 認証画面共通の背景、中央寄せ、`.page-shell` を担う
- `components/LoginForm.tsx`:
  - 見出し、説明文、フォーム、エラー表示、アクションを担う
- `hooks/useLogin.ts`:
  - ログイン mutation を提供する
  - 成功時にトークン保持と auth session query の無効化を行う
- `api/login.api.ts`:
  - `POST /auth/login` を呼び出す
- `schema/login.schema.ts`:
  - フォーム入力型と Zod schema を定義する

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - 全画面高の背景
  - 中央寄せされた認証カード
- `.page-shell` の要否:
  - 必須
- モバイル時の並び順:
  - タイトル
  - 説明文
  - メールアドレス
  - パスワード
  - API エラー
  - ログインボタン
  - 会員登録ボタン
- デスクトップ時の拡張点:
  - カード幅は約 420px から 512px を上限目安とする
  - 上下余白を広げて視線集中を保つ

### 5-2. セクション一覧

| セクション / コンポーネント | 役割                   | 主な表示内容                             | 主な操作                 |
| --------------------------- | ---------------------- | ---------------------------------------- | ------------------------ |
| `AuthScreenLayout`          | 認証画面共通レイアウト | 背景グラデーション、中央寄せコンテナ     | なし                     |
| `LoginForm`                 | ログイン画面本体       | タイトル、説明文、入力欄、エラー、ボタン | 入力、送信、会員登録遷移 |
| `TextField`                 | 汎用入力部品           | ラベル、input、helper/error              | テキスト入力             |
| `Button`                    | 汎用ボタン部品         | プライマリ / セカンダリ CTA              | 送信、画面遷移           |

## 6. コンポーネント責務

### 6-1. Screen

- `LoginPage` は route の入口としてのみ機能する
- `AuthScreenLayout` の内側に `LoginForm` を 1 つ compose する

### 6-2. Page Content

- `LoginForm` が画面全体の状態を束ねる
- `useForm` と `useLogin` を呼び出す
- 入力欄、アラート、アクションを組み立てる
- 画面規模が小さいため、追加分割は行わない

### 6-3. セクション / 部品

| コンポーネント     | 責務                         | props                                         | 備考                                      |
| ------------------ | ---------------------------- | --------------------------------------------- | ----------------------------------------- |
| `AuthScreenLayout` | 認証画面の共通レイアウト描画 | `children`                                    | 他の auth 画面でも再利用                  |
| `LoginForm`        | フォーム状態、送信、画面遷移 | なし                                          | route state を読み取る場合はここで扱う    |
| `TextField`        | ラベル付き入力欄             | `id`, `label`, `error`, input props           | `aria-invalid`, `aria-describedby` を付与 |
| `Button`           | 送信 / 遷移ボタン            | `type`, `variant`, `loading`, `disabled` など | `loading` 時は内部で非活性化              |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook             | queryKey / mutationKey | API         | 用途                   | 成功時の反映                                                    |
| ---------------- | ---------------------- | ----------- | ---------------------- | --------------------------------------------------------------- |
| `useLogin`       | mutation               | `login`     | 認証送信               | `setAuthSession` 実行、`authSessionQueryKey` を `removeQueries` |
| `useAuthSession` | `['auth', 'session']`  | `checkAuth` | route guard で認証確認 | 認証 / 未認証を判定                                             |

- server state を local state にコピーしない
- ログイン画面本体は query を持たず、mutation のみを利用する

### 7-2. フォーム状態

- 使用有無:
  - 使用する
- 利用 schema:
  - `loginSchema`
- 初期値:
  - `email: ''`
  - `password: ''`
- submit 処理:
  - `handleSubmit` 経由で `useLogin().mutate` を呼ぶ
  - 送信前に API エラーをクリアする
  - 成功時は `location.state.from` から内部ルートを解決し、無効な場合は `/dashboard` へ遷移する
- disable 条件:
  - mutation pending 中

### 7-3. ローカル UI 状態

| state       | 型               | 初期値 | 用途           |
| ----------- | ---------------- | ------ | -------------- |
| `authError` | `string \| null` | `null` | API エラー表示 |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数 | Method | Endpoint      | request               | response              | 備考                     |
| ----------- | ------ | ------------- | --------------------- | --------------------- | ------------------------ |
| `login`     | POST   | `/auth/login` | `{ email, password }` | `AuthSessionResponse` | `attachAuthToken: false` |
| `checkAuth` | GET    | `/auth/check` | なし                  | `void`                | route guard 用           |

### 8-2. データ変換

- `AuthSessionResponse` は `accessToken / access_token` と `tokenType / token_type` の差異を許容する
- トークンの正規化と保持は `setAuthSession` に集約する
- `location.state.from` は `AuthGuard` が渡した router state を前提とし、アプリ内パスだけを遷移先として採用する
- 画面表示用の変換は持たず、API エラーのみ人間向け文言に変換する

### 8-3. エラー処理

- API エラー時の表示位置:
  - フォーム下部、アクションボタンの直前
- 再試行方法:
  - ユーザーが入力修正または再度送信する
- `401` 発生時の挙動:
  - ログイン API 由来の `401` は画面内エラー表示
  - route guard や保護画面での `401` は `/login` へ遷移

## 9. UI 状態設計

| 状態             | 条件               | 表示                               | ユーザー操作           |
| ---------------- | ------------------ | ---------------------------------- | ---------------------- |
| Idle             | 初期表示           | 空フォーム                         | 入力、会員登録遷移     |
| Submitting       | ログイン送信中     | プライマリボタンをローディング表示 | 入力不可、二重送信不可 |
| Success          | 認証成功           | 画面表示を維持せず遷移             | なし                   |
| Validation Error | フォーム入力不正   | 入力直下にエラー表示               | 該当入力を修正可能     |
| API Error        | 認証失敗、通信失敗 | アラート表示                       | 再送信可能             |

## 10. バリデーション設計

| 項目       | 必須 | ルール           | エラーメッセージ                                                                 | 実装場所                 |
| ---------- | ---- | ---------------- | -------------------------------------------------------------------------------- | ------------------------ |
| `email`    | yes  | 非空、email 形式 | `メールアドレスを入力してください。`, `有効なメールアドレスを入力してください。` | `schema/login.schema.ts` |
| `password` | yes  | 非空             | `パスワードを入力してください。`                                                 | `schema/login.schema.ts` |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - `TextField` に `id` を明示し、`label` と紐付ける
- キーボード操作:
  - Tab で入力とボタンを移動
  - Enter で送信
- フォーカス管理:
  - 自然な DOM 順を維持する
  - 送信失敗時は現在フォーカスを維持し、アラートと各エラーで原因を認識できるようにする
- `aria-*` の要否:
  - `aria-invalid`
  - `aria-describedby`
  - `aria-live="polite"`
  - `role="alert"`
- 読み上げ対応:
  - フィールドエラーと API エラーを読み上げ可能にする

### 11-2. レスポンシブ

- モバイル:
  - 全幅カード
  - 左右 16px の余白
  - 1 カラム
- タブレット:
  - カード幅を拡張
  - 余白を維持したまま中央寄せ
- デスクトップ:
  - 縦中央寄せ
  - 背景グラデーションを広く見せる
- 横スクロール回避策:
  - フォーム要素は `w-full`
  - 固定幅を避け、カード幅のみ最大値で制御

## 12. スタイリング方針

- 白ベース、緑アクセント、淡いグラデーション背景を使う
- `.page-shell` による左右余白と中央寄せを基本とする
- カードは角丸、薄いボーダー、軽いシャドウで認証画面としての集中度を上げる
- フォーム部品は `shared/ui/primitives/Button.tsx` と `shared/ui/primitives/TextField.tsx` を利用する
- スペーシングは 8 / 12 / 16 / 24 / 32 を中心に組む

## 13. テスト観点

| 観点             | テスト内容                                                           |
| ---------------- | -------------------------------------------------------------------- |
| 初期表示         | タイトル、説明文、メールアドレス、パスワード、CTA が表示される       |
| 成功系           | 正しい入力で `useLogin` が呼ばれ、成功後に期待遷移先へ遷移する       |
| 入力エラー       | メール未入力、メール形式不正、パスワード未入力で各エラーが表示される |
| API エラー       | 失敗時にアラート文言が表示され、再送信可能である                     |
| 二重送信防止     | pending 中は両ボタンが非活性化される                                 |
| ルーティング     | `location.state.from` がある場合の遷移優先順位を確認する             |
| アクセシビリティ | ラベル関連付け、`role="alert"`, `aria-invalid` を確認する            |

## 14. 実装メモ

- ログイン画面は小規模なため、`LoginForm` を過度に分割しない
- 認証成功後の遷移先ロジックは `navigate('/dashboard')` の固定実装にせず、router state を解釈できるようにしておく

## 15. 未解決事項

- なし
