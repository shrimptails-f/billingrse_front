# メール再送信画面 基本設計

## 1. 文書情報

- 画面名: メール再送信画面
- feature 名: `auth`
- route: `/signup/email-resend`
- 利用 layout: `AuthScreenLayout`
- guard: なし。公開画面として扱う
- 作成日: 2026-03-29
- 更新日: 2026-03-29

## 2. 設計方針

- `app/router/route.tsx` で `/signup/email-resend` route を定義する
- 画面入口は `src/features/auth/screens/ResendEmailPage.tsx` に置く
- screen は `AuthScreenLayout` と `ResendEmailForm` を compose する薄い入口に保つ
- フォーム状態は React Hook Form + Zod、再送処理は TanStack Query の mutation `useResendEmail` に寄せる
- メールアドレス初期値は `useLastRegisteredEmail` で query parameter と `sessionStorage` から解決する
- 画面固有のフィードバック表示は `features/auth` に閉じ、共通化は後回しにする

## 3. Routing / Layout

- route:
  - `/signup/email-resend`
- 遷移元:
  - `/signup`
  - `/signup/email-sent`
  - `/signup/verify`
  - URL 直接アクセス
- 遷移先:
  - ボタン操作では `/login`
  - 画面内の主要完了は同画面内で完結する
- layout:
  - `AuthScreenLayout`
- guard:
  - route 自体には適用しない
- URL parameter / query parameter:
  - `email`: 任意。メールアドレス入力欄の初期値に利用する

## 4. 配置設計

```txt
src/
  app/
    router/
      route.tsx
  features/
    auth/
      screens/
        ResendEmailPage.tsx
      components/
        AuthScreenLayout.tsx
        ResendEmailForm.tsx
      hooks/
        useLastRegisteredEmail.ts
        useResendEmail.ts
      api/
        resend-email.api.ts
      schema/
        resend-email.schema.ts
      lib/
        lastRegisteredEmail.ts
```

### 4-1. 実装ファイル案

- `screens/ResendEmailPage.tsx`:
  - route 入口
  - `AuthScreenLayout` と `ResendEmailForm` を組み合わせる
- `components/ResendEmailForm.tsx`:
  - 見出し、補助案内、入力、送信、結果表示、画面遷移を担う
- `components/AuthScreenLayout.tsx`:
  - 認証画面共通の背景、中央寄せ、`.page-shell` を担う
- `hooks/useLastRegisteredEmail.ts`:
  - query parameter と `sessionStorage` からメールアドレス初期値を解決する
- `hooks/useResendEmail.ts`:
  - `POST /auth/email/resend` を呼ぶ mutation を提供する
- `api/resend-email.api.ts`:
  - resend API の request / response 契約を定義する
- `schema/resend-email.schema.ts`:
  - フォーム入力型と Zod schema を定義する
- `lib/lastRegisteredEmail.ts`:
  - `sessionStorage` への保存、取得を担う

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
  - 全画面高の背景
  - 中央寄せされた認証カード
  - カード内に見出し、補助案内、フォーム、フィードバック、ボタン群を配置する
- `.page-shell` の要否:
  - 必須
- モバイル時の並び順:
  - カテゴリラベル
  - タイトル
  - 説明文
  - 補助案内ボックス
  - メールアドレス入力
  - パスワード入力
  - フィードバック
  - 再送ボタン
  - ログイン画面へ戻るボタン
- デスクトップ時の拡張点:
  - カード幅は `max-w-lg` を上限目安とする
  - 上下余白を広げて 1 カラムの集中度を保つ

### 5-2. セクション一覧

| セクション / コンポーネント | 役割                   | 主な表示内容                             | 主な操作             |
| --------------------------- | ---------------------- | ---------------------------------------- | -------------------- |
| `AuthScreenLayout`          | 認証画面共通レイアウト | 背景グラデーション、中央寄せコンテナ     | なし                 |
| `ResendEmailForm`           | メール再送画面本体     | 見出し、説明文、入力欄、結果表示、ボタン | 入力、送信、画面遷移 |
| `TextField`                 | 汎用入力部品           | ラベル、input、helper / error            | テキスト入力         |
| `Button`                    | 汎用ボタン部品         | プライマリ / セカンダリ CTA              | 送信、画面遷移       |

## 6. コンポーネント責務

### 6-1. Screen

- `ResendEmailPage` は route の入口としてのみ機能する
- `AuthScreenLayout` の内側に `ResendEmailForm` を 1 つ compose する

### 6-2. Page Content

- `ResendEmailForm` が画面全体の状態を束ねる
- `useLastRegisteredEmail` でメールアドレス初期値を解決する
- `useForm` と `useResendEmail` を呼び出す
- `useEffect` で未入力時のみフォームのメールアドレス欄へ初期値を反映する
- submit 時にフィードバックをクリアし、成功 / 失敗に応じて画面内メッセージを更新する

### 6-3. セクション / 部品

| コンポーネント           | 責務                               | props                                         | 備考                                                 |
| ------------------------ | ---------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `AuthScreenLayout`       | 認証画面の共通レイアウト描画       | `children`                                    | 他の auth 画面でも再利用                             |
| `ResendEmailForm`        | 入力、送信、結果表示、ログイン遷移 | なし                                          | route 専用フォームコンテナ                           |
| `TextField`              | ラベル付き入力欄描画               | `id`, `label`, `error`, input props           | `aria-invalid`, `aria-describedby` を付与            |
| `Button`                 | 送信 / 遷移ボタン                  | `type`, `variant`, `loading`, `disabled` など | `loading` 時は内部で非活性化                         |
| `useLastRegisteredEmail` | 初期メールアドレス解決             | なし                                          | query parameter を優先し `sessionStorage` に同期する |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook             | queryKey / mutationKey | API           | 用途           | 成功時の反映                           |
| ---------------- | ---------------------- | ------------- | -------------- | -------------------------------------- |
| `useResendEmail` | mutation               | `resendEmail` | 確認メール再送 | フィードバック更新、メールアドレス保存 |

- query は持たず、再送 API は mutation として扱う
- server state を local state にコピーするのは UI 表示用のフィードバックに限定する

### 7-2. フォーム状態

- 使用有無:
  - 使用する
- 利用 schema:
  - `resendEmailSchema`
- 初期値:
  - `email: lastRegisteredEmail ?? ''`
  - `password: ''`
- submit 処理:
  - `handleSubmit(onSubmit)` で検証後に `useResendEmail().mutate` を呼ぶ
  - 送信前に既存のフィードバックをクリアする
  - 成功時は `persistLastRegisteredEmail(values.email)` を実行し、成功メッセージを表示する
  - 失敗時は API エラーコードを画面文言へ変換して表示する
- disable 条件:
  - `resendEmailMutation.isPending === true`

### 7-3. ローカル UI 状態

| state      | 型                 | 初期値 | 用途                     |
| ---------- | ------------------ | ------ | ------------------------ |
| `feedback` | `Feedback \| null` | `null` | 成功 / 情報 / 失敗の表示 |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数   | Method | Endpoint             | request                 | response              | 備考                                                   |
| ------------- | ------ | -------------------- | ----------------------- | --------------------- | ------------------------------------------------------ |
| `resendEmail` | POST   | `/auth/email/resend` | `ResendEmailFormValues` | `ResendEmailResponse` | `attachAuthToken: false`, `retryOnUnauthorized: false` |

### 8-2. データ変換

- `useLastRegisteredEmail` は `searchParams.get('email') ?? readLastRegisteredEmail()` でメールアドレス候補を解決する
- query parameter に `email` がある場合は `persistLastRegisteredEmail` を実行して `sessionStorage` に同期する
- `ResendEmailForm` は、現在のフォームメールアドレスが空のときだけ `setValue('email', lastRegisteredEmail)` を行う
- 成功時は API 応答の `message` をそのまま成功表示に使う
- エラー時は `ApiError` のコードを UI 表示文言へ変換する

### 8-3. エラー処理

- API エラー時の表示位置:
  - フォーム内、入力欄の下、アクションボタンの上
- 再試行方法:
  - ユーザーが入力修正またはそのまま再送信する
- `401` 発生時の挙動:
  - ログイン画面へは遷移せず、`invalid_credentials` として画面内表示する
- エラー文言変換:
  - `invalid_credentials`: `メールアドレスまたはパスワードが正しくありません。`
  - `already_verified`: `このメールアドレスは既に認証済みです。`
  - `apiMessage` があればその文言を優先する
  - それ以外は汎用メッセージ

## 9. UI 状態設計

| 状態             | 条件                         | 表示                         | ユーザー操作               |
| ---------------- | ---------------------------- | ---------------------------- | -------------------------- |
| Editing          | 初期表示、未送信             | フォームと 2 本のボタン      | 入力、送信、ログイン遷移   |
| Submitting       | 再送 API 実行中              | 再送ボタンをローディング表示 | 送信・遷移とも不可         |
| Success Feedback | 再送 API 成功                | 緑系フィードバック           | 再送可能、ログイン遷移可能 |
| Info Feedback    | `already_verified`           | 青系フィードバック           | 再送可能、ログイン遷移可能 |
| Validation Error | Zod 検証失敗                 | 入力直下にエラー表示         | 該当入力を修正可能         |
| API Error        | 資格情報不一致、通信失敗など | 赤系フィードバック           | 修正または再試行可能       |

## 10. バリデーション設計

| 項目       | 必須 | ルール           | エラーメッセージ                                                                 | 実装場所                        |
| ---------- | ---- | ---------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| `email`    | yes  | 非空、email 形式 | `メールアドレスを入力してください。`, `有効なメールアドレスを入力してください。` | `schema/resend-email.schema.ts` |
| `password` | yes  | 非空             | `パスワードを入力してください。`                                                 | `schema/resend-email.schema.ts` |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
  - `TextField` に `id` を明示し、`label` と紐付ける
- キーボード操作:
  - Tab で入力とボタンを移動
  - Enter で送信
- フォーカス管理:
  - 自然な DOM 順を維持する
  - 送信結果表示時の自動フォーカス移動は行わない
- `aria-*` の要否:
  - `aria-invalid`
  - `aria-describedby`
  - フィードバックに `aria-live="polite"`
  - フィードバック tone が `error` の場合は `role="alert"`、それ以外は `role="status"`
- 読み上げ対応:
  - フィールドエラーと送信結果を読み上げ可能にする

### 11-2. レスポンシブ

- モバイル:
  - 全幅カード
  - 左右 16px の余白
  - 1 カラム
  - ボタンはフル幅
- タブレット:
  - カード幅を拡張しつつ 1 カラム維持
  - 余白だけを増やして視認性を上げる
- デスクトップ:
  - 縦中央寄せ
  - 背景グラデーションを広く見せる
- 横スクロール回避策:
  - 入力欄とボタンを `w-full` 基準で構成する
  - 固定幅を避け、最大幅のみを制限する

## 12. スタイリング方針

- 白ベース、緑アクセント、淡い背景グラデーションを使う
- `.page-shell` による左右余白と中央寄せを基本とする
- カードは `rounded-3xl`、薄いボーダー、軽いシャドウで認証系 UI として統一する
- 補助案内ボックスは `bg-slate-50`、フィードバックは tone ごとの背景色で視認性を出す
- 入力欄とボタンは `shared/ui/primitives/Button.tsx` と `shared/ui/primitives/TextField.tsx` を利用する
- スペーシングは 8 / 12 / 16 / 24 / 32 を中心に組む

## 13. テスト観点

| 観点             | テスト内容                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| 初期表示         | 見出し、説明文、入力欄、CTA 2 本が表示されること                           |
| 初期値解決       | `email` query parameter を優先してメールアドレス欄に表示できること         |
| ストレージ連携   | query parameter なしでも `sessionStorage` のメールアドレスを利用できること |
| 入力エラー       | 空送信時にメールアドレス、パスワードのエラーが表示されること               |
| 成功系           | 成功メッセージを表示し、メールアドレスを `sessionStorage` に保存すること   |
| API エラー       | `invalid_credentials` と汎用エラーの表示を確認すること                     |
| 情報系レスポンス | `already_verified` を青系の情報表示で扱うこと                              |
| ローディング     | 送信中は再送ボタンがローディングになり、ログインボタンも非活性になること   |
| 画面遷移         | `ログイン画面へ戻る` で `/login` へ遷移すること                            |

## 14. 実装メモ

- 現行規模では `ResendEmailForm` 1 コンポーネントに閉じて問題ない
- フィードバック表示は auth feature 内のローカル実装とし、他画面で重複が増えた段階で共通化を検討する
- `useLastRegisteredEmail` を前後画面でも使うことで、メールアドレス受け渡しを一貫させる

## 15. 未解決事項

なし
