# [画面名] 基本設計

## 1. 文書情報

- 画面名:
- feature 名:
- route:
- 利用 layout:
- guard:
- ステータス:
- 作成日:
- 更新日:

## 2. 設計方針

- `app/router` で route を定義する
- 画面入口は `src/features/<feature>/screens/` に置く
- screen は薄く保ち、複雑な UI は `components/` に分離する
- サーバ状態は TanStack Query、フォームは React Hook Form + Zod を使う
- 共通化は `shared/` に早出しせず、feature 内に閉じる

## 3. Routing / Layout

- route:
- 遷移元:
- 遷移先:
- layout:
- guard:
- URL parameter / query parameter:

## 4. 配置設計

```txt
src/
  app/
    router/
  features/
    <feature>/
      screens/
        <ScreenPage>.tsx
      components/
      hooks/
      api/
      schema/
      types/
```

### 4-1. 実装ファイル案

- `screens/<ScreenPage>.tsx`:
- `components/<ScreenContent>.tsx`:
- `components/<Section>.tsx`:
- `hooks/use<Something>.ts`:
- `api/<screen>.api.ts`:
- `schema/<screen>.schema.ts`:
- `types/<screen>.types.ts`:

## 5. 画面構成

### 5-1. レイアウト構成

- ページ全体の構成:
- `.page-shell` の要否:
- モバイル時の並び順:
- デスクトップ時の拡張点:

### 5-2. セクション一覧

| セクション / コンポーネント | 役割 | 主な表示内容 | 主な操作 |
| --- | --- | --- | --- |
| 例: HeaderSection | 画面概要の提示 | タイトル、説明 | なし |

## 6. コンポーネント責務

### 6-1. Screen

- route の入口として機能する
- 画面コンテナを 1 つ compose する

### 6-2. Page Content

- 画面全体の状態を束ねる
- データ取得 hook を呼ぶ
- セクション component を組み立てる

### 6-3. セクション / 部品

| コンポーネント | 責務 | props | 備考 |
| --- | --- | --- | --- |
| 例: ResultList | 一覧描画 | items, onSelect | 描画責務に限定 |

## 7. 状態管理設計

### 7-1. サーバ状態

| hook | queryKey / mutationKey | API | 用途 | 成功時の反映 |
| --- | --- | --- | --- | --- |
| 例: useExampleList | `['examples']` | fetchExamples | 初期一覧取得 | refetch |

- server state を local state にコピーしない
- invalidate 対象を明確にする

### 7-2. フォーム状態

- 使用有無:
- 利用 schema:
- 初期値:
- submit 処理:
- disable 条件:

### 7-3. ローカル UI 状態

| state | 型 | 初期値 | 用途 |
| --- | --- | --- | --- |
| 例: isOpen | boolean | false | モーダル開閉 |

## 8. API 連携設計

### 8-1. API 一覧

| hook / 関数 | Method | Endpoint | request | response | 備考 |
| --- | --- | --- | --- | --- | --- |
| 例: fetchExamples | GET | `/examples` | query | items | 一覧取得 |

### 8-2. データ変換

- API 応答から UI 表示値へどう変換するか
- 日付、数値、ステータス表示の整形方針
- 欠損値のフォールバック方針

### 8-3. エラー処理

- API エラー時の表示位置
- 再試行方法
- `401` 発生時の挙動

## 9. UI 状態設計

| 状態 | 条件 | 表示 | ユーザー操作 |
| --- | --- | --- | --- |
| Initial Loading | 初期取得中 | スピナー / スケルトン | 制限あり |
| Empty | データなし | Empty 文言 | CTA を表示 |
| Success | 正常取得 | 本文表示 | 通常操作可能 |
| Validation Error | 入力不正 | 入力直下に表示 | 修正可能 |
| API Error | 通信失敗 | エラーパネル | 再試行可能 |

## 10. バリデーション設計

| 項目 | 必須 | ルール | エラーメッセージ | 実装場所 |
| --- | --- | --- | --- | --- |
| 例: email | yes | email 形式 | メールアドレス形式で入力してください | Zod schema |

## 11. アクセシビリティ / レスポンシブ設計

### 11-1. アクセシビリティ

- ラベル関連付け:
- キーボード操作:
- フォーカス管理:
- `aria-*` の要否:
- 読み上げ対応:

### 11-2. レスポンシブ

- モバイル:
- タブレット:
- デスクトップ:
- 横スクロール回避策:

## 12. スタイリング方針

- 白ベース、緑アクセントを基本とする
- `.page-shell` による左右余白と中央寄せを基本とする
- スペーシングは 4 / 8 / 12 / 16 / 24 / 32 を使う
- 共通 UI は `shared/ui` を優先し、feature 固有 UI は feature 内に閉じる

## 13. テスト観点

| 観点 | テスト内容 |
| --- | --- |
| 初期表示 | Loading から表示完了まで確認する |
| 成功系 | 主要操作の成功を確認する |
| 入力エラー | バリデーション表示を確認する |
| API エラー | エラー表示と再試行導線を確認する |
| 権限制御 | `401` や guard 挙動を確認する |
| レンダリング分岐 | Empty / 一覧 / モーダル表示を確認する |

## 14. 実装メモ

- 実装時の注意点
- 共通化を後回しにする箇所
- 将来の拡張余地

## 15. 未解決事項

- API 契約の未確定事項
- UI 文言の未確定事項
- デザイン確認待ち事項
