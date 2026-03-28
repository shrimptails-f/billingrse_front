# 会員登録画面 基本設計

## 1. 文書情報

- 画面名: 会員登録画面
- feature 名: `auth`
- route: `/signup`
- 利用 layout: `AuthScreenLayout`
- guard: `GuestGuard`
- ステータス: Draft
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router` で `/signup` を定義し、ゲストユーザー専用画面として `GuestGuard` 配下に配置する
- 画面入口は `src/features/auth/screens/SignupPage.tsx` とし、実際の UI は `SignupForm` に閉じる
- フォーム状態は React Hook Form + Zod、登録処理は TanStack Query の mutation に寄せる
- 登録後に必要なメールアドレスだけを `sessionStorage` に保持し、パスワードは永続化しない
- 共通 UI は `shared/ui/primitives` の `Button` と `TextField` を利用する

## 3. Routing / Layout

- route: `/signup`
- 遷移元:
  - `/login`
  - 直接 URL アクセス
  - `/signup/email-resend`
  - `/signup/verify`
- 遷移先:
  - 成功時: `/signup/email-sent?email=<encoded-email>`
  - 既認証アクセス時: `/dashboard`
  - 補助操作: `/signup/email-resend`, `/login`
- layout: `AuthScreenLayout`
- guard: `GuestGuard`
- URL parameter / query parameter: なし

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
      guards/
        GuestGuard.tsx
  features/
    auth/
      screens/
        SignupPage.tsx
      components/
        AuthScreenLayout.tsx
        SignupForm.tsx
      hooks/
        useSignup.ts
        useLastRegisteredEmail.ts
      api/
        signup.api.ts
      schema/
        signup.schema.ts
      lib/
        lastRegisteredEmail.ts
```

### 4-1. 実装ファイル案

- `screens/SignupPage.tsx`: route の入口。`AuthScreenLayout` と `SignupForm` を compose する
- `components/AuthScreenLayout.tsx`: 認証画面共通の背景、中央寄せ、`.page-shell` を提供する
- `components/SignupForm.tsx`: 会員登録フォーム本体、画面内エラー表示、遷移制御を担当する
- `hooks/useSignup.ts`: 会員登録 mutation を提供する
- `hooks/useLastRegisteredEmail.ts`: 後続画面で利用するメールアドレス参照ロジックを提供する
- `api/signup.api.ts`: `POST /auth/register` 呼び出しを定義する
- `schema/signup.schema.ts`: 入力バリデーションと `SignupFormValues` 型を定義する
- `lib/lastRegisteredEmail.ts`: `sessionStorage` への保存・取得を行う

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - 画面全体に淡いグラデーション背景を敷く
  - `.page-shell` 内でカードを垂直・水平中央寄せする
  - カード内に見出し、説明文、フォーム、エラー、アクションを縦積みする
- `.page-shell` の要否: 必須。左右余白と中央寄せを統一するため
- モバイル時の並び順:
  - ラベル
  - 見出し
  - 説明文
  - 入力 3 項目
  - 同意事項案内
  - API エラー
  - CTA 3 本
- デスクトップ時の拡張点:
  - 1 カラムを維持したままカード最大幅だけを `max-w-lg` に制限する
  - 上下余白を十分に確保する

### 5-2. セクション一覧

| セクション / コンポーネント | 役割           | 主な表示内容                     | 主な操作       |
| --------------------------- | -------------- | -------------------------------- | -------------- |
| SignupIntro                 | 画面意図の提示 | `新規登録`, `会員登録`, 説明文   | なし           |
| SignupFields                | 入力受付       | 氏名、メールアドレス、パスワード | 入力           |
| AgreementNotice             | 将来要件の案内 | 同意事項プレースホルダ           | なし           |
| SignupFeedback              | API 結果表示   | サーバエラー文言                 | なし           |
| SignupActions               | 主要導線       | 送信、再送、ログインボタン       | 画面遷移、送信 |

## 6. コンポーネント責務

### 6-1. Screen

- `SignupPage` は route の入口としてのみ機能する
- `AuthScreenLayout` 配下に `SignupForm` を 1 つ compose する

### 6-2. Page Content

- `SignupForm` が画面全体の状態を束ねる
- React Hook Form と `useSignup` を呼ぶ
- 成功時のメールアドレス永続化と画面遷移を処理する

### 6-3. セクション / 部品

| コンポーネント     | 責務                         | props                                 | 備考                                      |
| ------------------ | ---------------------------- | ------------------------------------- | ----------------------------------------- |
| `AuthScreenLayout` | 認証画面共通レイアウト       | `children`                            | 他の auth 画面でも再利用                  |
| `SignupForm`       | 入力、送信、エラー表示、遷移 | なし                                  | route 専用のフォームコンテナ              |
| `TextField`        | ラベル付き入力欄描画         | `label`, `error`, input props         | `aria-invalid`, `aria-describedby` を付与 |
| `Button`           | CTA 描画                     | `variant`, `loading`, `disabled` ほか | `loading` 中は押下不可                    |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook        | queryKey / mutationKey | API            | 用途         | 成功時の反映                |
| ----------- | ---------------------- | -------------- | ------------ | --------------------------- |
| `useSignup` | なし                   | `registerUser` | 会員登録実行 | `/signup/email-sent` へ遷移 |

- server state を local state にコピーしない
- 登録 API は一覧再取得や invalidate を必要としない

### 7-2. フォーム状態

- 使用有無: あり
- 利用 schema: `signupSchema`
- 初期値:
  - `name: ''`
  - `email: ''`
  - `password: ''`
- submit 処理:
  - `handleSubmit(onSubmit)` で検証後に `signupMutation.mutate` を実行する
  - 成功時は `response.user.email ?? values.email` を保存して遷移する
- disable 条件:
  - `signupMutation.isPending === true`

### 7-3. ローカル UI 状態

| state         | 型               | 初期値 | 用途                 |
| ------------- | ---------------- | ------ | -------------------- |
| `serverError` | `string \| null` | `null` | API エラー文言の保持 |

- `watch('email')` は `確認メールを再送する` の遷移先 URL を組み立てるための派生値として使う
- 登録メールアドレスは React state ではなく `sessionStorage` に保存する

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数    | Method | Endpoint         | request            | response         | 備考           |
| -------------- | ------ | ---------------- | ------------------ | ---------------- | -------------- |
| `registerUser` | POST   | `/auth/register` | `SignupFormValues` | `SignupResponse` | 会員登録を実行 |

### 8-2. データ変換

- API 応答の `user.email` を後続画面へ引き渡すメールアドレスとして利用する
- `user.email` が欠損している場合のみフォーム入力値の `email` をフォールバックに使う
- メールアドレスは query parameter と `sessionStorage` に保存し、後続の再送・認証画面で再利用する

### 8-3. エラー処理

- Zod の検証エラーは各入力欄の直下に表示する
- API エラーはフォーム下部のアラート領域に表示する
- `ApiError` かつ `status === 401` かつ `code === 'email_already_exists'` の場合は専用文言に変換する
- それ以外のエラーは汎用エラーメッセージを表示する
- `401` 時にログイン画面へ飛ばす設計ではなく、ゲスト画面としてエラー表示に留める

## 9. UI 状態設計

| 状態             | 条件                                | 表示                         | ユーザー操作                |
| ---------------- | ----------------------------------- | ---------------------------- | --------------------------- |
| Guard Loading    | `GuestGuard.isChecking === true`    | `Loading...`                 | なし                        |
| Editing          | 初期表示後、未送信                  | フォームと 3 本のボタン      | 入力、送信、画面遷移        |
| Submitting       | `signupMutation.isPending === true` | 送信ボタンにローディング表示 | 送信・遷移とも不可          |
| Validation Error | Zod 検証失敗                        | 入力直下にメッセージ         | 修正して再送信              |
| API Error        | mutation 失敗                       | フォーム下部アラート         | 修正または再試行            |
| Success Navigate | mutation 成功                       | 画面遷移を実行               | `/signup/email-sent` へ移動 |

## 10. バリデーション設計

| 項目       | 必須 | ルール                    | エラーメッセージ                                                                  | 実装場所           |
| ---------- | ---- | ------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| `name`     | yes  | 1 文字以上                | `氏名を入力してください。`                                                        | `signup.schema.ts` |
| `email`    | yes  | 1 文字以上かつ email 形式 | `メールアドレスを入力してください。` / `有効なメールアドレスを入力してください。` | `signup.schema.ts` |
| `password` | yes  | 1 文字以上                | `パスワードを入力してください。`                                                  | `signup.schema.ts` |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け: `TextField` が `label` と `id` を結び付ける
- キーボード操作: Tab 移動と Enter 送信で完結できる
- フォーカス管理: 明示的なフォーカス移動は持たず、自然順序に従う
- `aria-*` の要否:
  - 入力欄に `aria-invalid`
  - エラー文に `aria-describedby`
  - API エラーに `role="alert"` と `aria-live="polite"`
- 読み上げ対応: エラー内容をスクリーンリーダーが追える構成にする

### 11-2. レスポンシブ

- モバイル:
  - 1 カラム
  - 画面左右 16px 相当の余白を維持
  - ボタンはフル幅
- タブレット:
  - 1 カラム維持
  - 余白のみ増やして視認性を上げる
- デスクトップ:
  - カードを中央寄せし、最大幅を制限する
  - 複数カラムにはしない
- 横スクロール回避策:
  - 入力欄とボタンを `w-full` に統一する

## 12. スタイリング方針

- 白ベース、緑アクセントを基調にしつつ、認証画面では淡いグラデーション背景を許容する
- `AuthScreenLayout` の `.page-shell` で左右余白と中央寄せを統一する
- フォームカードは `rounded-3xl`, `border`, `shadow-lg`, `backdrop-blur` を使って視認性を確保する
- 入力欄とボタンは `shared/ui/primitives` のトークンに従う
- 画面固有の情報ボックスやエラー表示は `auth` feature 内に閉じる

## 13. テスト観点

| 観点       | テスト内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 初期表示   | 見出し、入力欄、CTA 3 本が表示されること                                                              |
| 入力エラー | 未入力時とメールアドレス形式不正時のバリデーション表示を確認する                                      |
| 成功系     | 登録成功後に `/signup/email-sent?email=...` へ遷移し、`sessionStorage` にメールアドレスを保存すること |
| API エラー | `email_already_exists` と汎用エラーの表示を確認する                                                   |
| 補助導線   | 再送ボタンが現在入力中メールアドレス付きで遷移すること、ログイン導線が動くこと                        |
| 権限制御   | ログイン済み状態で `/signup` にアクセスした場合に `/dashboard` へ遷移すること                         |

## 14. 実装メモ

- 現行実装では `SignupForm` 1 コンポーネントに閉じており、さらなる分割は不要
- 同意事項はプレースホルダ表示のみなので、要件確定までは `schema` に含めない
- API エラーコード設計が変わる場合は `mapSignupError` を起点に表示方針を見直す

## 15. 未解決事項

- 利用規約同意をチェックボックス化するか未確定
  - 将来利用規約を用意したタイミングで検討する
- ゲストガードのローディング表示を `AuthScreenLayout` 配下に寄せるか未確定
