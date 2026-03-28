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

## 設計判断

- Barrel
  - 複数のモジュールから1つの便利なモジュールにエクスポートをロールアップする方法
  - index.ts は公開面を絞るために置く
  - 神クラスもとい神barrel化しそうな場所には置かない

- useStateを使う判断基準
  - 保存が必要な事実だけ state に置く
  - 表示のための派生値は state に置かず計算する
  - 同一イベント内の連続更新は updater 関数を使う

このフロントエンドでは、API 呼び出しと状態管理の責務を分けて設計します。

- `shared/api` は通信の共通ルールを担当します。`Client` と HTTP メソッドラッパを置き、base URL、認証ヘッダ、レスポンス parse、エラー整形などの横断関心を集約します。
- `features/*/api` は「どの API を叩くか」を担当します。feature ごとの業務 API を薄い関数として定義し、HTTP の詳細は `shared/api` に持ち込まない方針です。
- `features/*/hooks` は React からの利用入口を担当します。server state の取得・更新・再取得・invalidate が必要な場合に、TanStack Query の `useQuery` / `useMutation` をこの層で利用します。

状態は次の基準で分離します。

- server state: 正本がサーバーにあり、再取得で復元でき、別画面・別タブ・他ユーザー操作などで変化しうるデータ
- form state: 入力途中の値やバリデーション状態のように、ユーザー操作中の一時データ
- local UI state: モーダル開閉、選択中タブ、表示切替など、画面内で閉じる一時的な UI 状態
- command: ログイン、会員登録、メール認証のような単発実行フロー。server state 管理の恩恵が薄い場合は TanStack Query に無理に載せず、plain async として扱う判断も許容します

詳細な規約は [コーディング規約](./docs/coding_rules.md) を参照してください。

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
