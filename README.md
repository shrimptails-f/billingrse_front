# フロントエンド概要

IT エンジニア向け営業メールの解析結果を閲覧・検索するフロントエンドです。Next.js (App Router) をベースに、Tailwind CSS と React Query / React Hook Form / Zustand / Zod で UI と状態管理を構成します。

## 技術スタック

- Next.js 15 (TypeScript) / Turbopack 開発サーバー
- Tailwind CSS v4
- TanStack Query (サーバ状態) / Zustand (UI 状態)
- React Hook Form + Zod (フォーム + バリデーション)
- テスト: Vitest + React Testing Library (jsdom) + @testing-library/jest-dom

詳細は [技術スタック](./docs/technology_stack.md) を参照してください。

## アーキテクチャ

詳細は[こちら](./docs/architecture.md)を参照してください。

## 環境構築

VS Code DevContainer 利用時は [こちら](./docs/VsCodeDevContainer.md) を参照してください。

## セットアップ

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. 開発サーバーを起動

   ```bash
   npm run dev
   ```

3. Lint / テスト / ビルド

   ```bash
   npm run lint   # ESLint
   npm test       # Vitest (jsdom)
   npm run build  # Next.js 本番ビルド
   ```

- テストの型チェックを含めて確認したい場合は `npx tsc -p tsconfig.vitest.json` を利用してください。
