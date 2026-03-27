# 技術構成（スタック）

## フレームワーク / 言語

- **React 18**
  - UI 構築のベース
- **TypeScript**
  - 型安全を前提に実装する
- **Vite**
  - 開発サーバー、build、preview を担当する
- **React Router**
  - クライアントサイドルーティングを担当する

## ディレクトリ構成

- **`app / features / shared`**
  - `app/`: router、providers、layout などアプリ全体の骨格
  - `features/`: 業務機能ごとの screen、UI、hooks、API、schema、types
  - `shared/`: 複数 feature で再利用する UI や基盤コード

## スタイリング / UI

- **Tailwind CSS**
  - ユーティリティクラスベースでスタイリングする
- **自作 UI コンポーネント**
  - `shared/ui/` に共通 UI を配置する
  - Button、TextField、Spinner などを共通部品として管理する

## 状態管理 / フォーム / バリデーション

- **TanStack Query**
  - サーバ状態の取得、更新、キャッシュ管理を担当する
- **React Hook Form**
  - フォーム状態管理を担当する
- **Zod**
  - 入力バリデーションと型定義に利用する
- **React のローカル state**
  - 画面内で閉じる UI 状態に利用する

## データ取得 / API

- **fetch + 共通 API クライアント**
  - HTTP 通信は共通クライアント経由で行う
  - 認証ヘッダ、エラー整形、リトライなどを共通化する
- **feature ごとの API モジュール**
  - 各業務機能ごとに `*.api.ts` を定義して利用する
- **Vite 環境変数**
  - `import.meta.env.VITE_*` を利用する

## テスト

- **Vitest**
  - テストランナー
- **React Testing Library**
  - UI の振る舞いテスト
- **jsdom**
  - ブラウザ相当のテスト環境

## 品質管理

- **ESLint**
  - 静的解析
- **Prettier**
  - コード整形

## 主要コマンド

- `npm run dev`
  - 開発サーバー起動
- `npm run build`
  - 本番 build
- `npm run preview`
  - build 結果の確認
- `npm run lint`
  - ESLint 実行
- `npm run test`
  - Vitest 実行
