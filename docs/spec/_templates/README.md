# 画面設計ドキュメントテンプレート

このディレクトリには、画面設計で使うテンプレートを置く。

## 方針

- 画面ごとの設計は `requirements-definition.md` と `basic-design.md` の 2 段階で管理する
- 要件と設計を 1 ファイルに混在させず、まず要求を固めてから実装設計に落とす
- テンプレートは現行の `app / features / shared` 構成に合わせる
- スタイリングは Tailwind CSS、サーバ状態は TanStack Query、フォームは React Hook Form + Zod を前提とする

## 使い分け

### `requirements-definition.md`

- その画面で何を実現するかを定義する
- 目的、対象ユーザー、ユーザーフロー、機能要件、状態要件、API 依存、完了条件を記載する
- 実装ファイル名や hook 分割のような詳細設計はここでは確定しすぎない

### `basic-design.md`

- 要件を前提に、フロントエンド実装へ落とすための設計を定義する
- route、layout、feature 配下のファイル配置、コンポーネント責務、状態管理、API 連携、UI 状態、テスト観点を記載する
- 実装担当者が `src/` 配下に迷わず配置できる粒度まで落とす
- 詳細な実装内容は記載せず構成程度の粒度のとどめること。

## 推奨配置

新しい画面設計を追加する場合は、次のような構成を推奨する。

```txt
docs/spec/<screen-or-feature-name>/
  ├── requirements-definition.md
  └── basic-design.md
```

feature 単位で複数画面をまとめる場合でも、画面ごとの差分が大きい場合は画面単位で分割する。
