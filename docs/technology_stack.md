# 技術構成（スタック）

## フレームワーク / 言語

- **Next.js（App Router）**
  - `app/` ディレクトリベース
  - Route Group：`(auth)` / `(app)` でログイン前後を分割
- **TypeScript**
  - 関数は変数代入スタイルで定義

## スタイリング / UI

- **Tailwind CSS**
  - ユーティリティクラスでのスタイリング
  - コンポーネント側で className を組み合わせ
- **自作 UI コンポーネント（Material Design 風）**
  - 外部 UI ライブラリは使わない（Material Tailwind / MUI など）
  - `shared/ui/` に Button / TextField / Card / Dialog / Table など
  - Tailwind ベースで構築し、必要に応じて CSS の直書きも許容

## 状態管理 / フォーム / バリデーション

- **Zustand**
  - UI 状態管理（サイドバー開閉、テーマ、グローバル UI フラグなど）
  - サーバーデータは基本的に持たない
- **React Hook Form**
  - フォーム状態管理
  - ログイン / 会員登録 / 検索フォームなどに利用
- **Zod**
  - 入力バリデーション + 型定義
  - `zodResolver` で RHF と連携

## データ取得 / API

- **TanStack Query**
  - サーバー状態（Server State）のソースオブトゥルース
  - Gmail 解析結果 / ログインユーザ情報 / Home の統計情報など
- **fetch + 共通 API クライアント**
  - `lib/api/client.ts` に `apiRequest` ラッパを作成
  - 各画面・機能ごとに `xxx.api.ts` を定義して呼び出し

## テスト

- **React Testing Library**
  - コンポーネント振る舞いテスト
- **Vitest**
  - テストランナー（jsdom 環境）
