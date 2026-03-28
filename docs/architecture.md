# 1. アーキテクチャ（構造とデータフロー）

## 1-1. ディレクトリ構成（app / features / shared）

現行のディレクトリ構成は次のとおりとする。

```txt
src
  ├── app
  │   ├── router
  │   │   ├── index.tsx
  │   │   └── guards
  │   ├── providers
  │   │   └── Providers.tsx
  │   ├── layouts
  │   │   ├── DashboardLayout.tsx
  │   │   └── AppHeader.tsx
  │   └── styles
  │       └── globals.css
  ├── features
  │   ├── auth
  │   │   ├── screens
  │   │   ├── components
  │   │   ├── hooks
  │   │   ├── api
  │   │   ├── schema
  │   │   └── lib
  │   ├── gmail-integration
  │   │   ├── screens
  │   │   ├── components
  │   │   ├── hooks
  │   │   ├── api
  │   │   └── types
  │   ├── billing
  │   │   ├── screens
  │   │   ├── components
  │   │   ├── hooks
  │   │   ├── api
  │   │   └── types
  │   ├── manual-mail-workflows
  │   │   ├── screens
  │   │   ├── components
  │   │   ├── hooks
  │   │   ├── api
  │   │   ├── schema
  │   │   └── types
  │   └── dashboard
  │       ├── screens
  │       └── components
  ├── shared
  │   ├── ui
  │   │   ├── primitives
  │   │   └── icons
  │   ├── api
  │   ├── hooks
  │   └── lib
  └── test
```

## 1-2. 責務の分離

- `app/router`
  URL、リダイレクト、route guard、layout 合成を担当する
- `features/*`
  業務機能ごとの screen、UI、hooks、API、schema、types を担当する
- `shared/*`
  汎用 UI、共通 API クライアント、業務知識を持たない utility を担当する

feature 配下の `screens/` は、その feature に属する画面入口として扱う。
route 定義は `app/router` が持ち、`app/router` から各 feature の screen を参照する。

## 1-3. 配置ルール

- feature 名は `auth`、`gmail-integration`、`billing` のように業務機能名で付ける
- `login` や `billing-summary` のような画面名をトップレベル feature 名にしない
- 1 つの feature でしか使わない code は `shared` に出さない
- `shared` には、複数 feature で利用する code だけを置く
- feature 間の直接依存は最小限に抑える
- `page.tsx` のような汎用名より、`LoginPage.tsx` のような明示的な名前を優先する

## 1-4. データフロー

基本の流れは次のとおりとする。

1. `app/router` が URL に応じて feature の screen を選択する
2. feature の screen が、その feature 内の component や hook を組み立てる
3. feature 内の hook や API モジュールが通信や状態更新を行う
4. 複数 feature で共通な UI や基盤処理だけを `shared` から利用する
