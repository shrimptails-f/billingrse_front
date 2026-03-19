# 1. アーキテクチャ（構造とデータフロー）

## 1-1. ディレクトリ構成（app 中心＋ shared / co-location）

基本方針：

- 画面単位で UI・ロジック・スキーマを `app/xxx` にまとめる
- 横断的なものだけ components/, lib/, stores/, types/ に配置
- page.tsx は薄く、コンテナ UI を呼ぶだけにする

```
home/node/front/
└── src
    ├── app
    │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── globals.css
    │   └── {domain}            // domainの数だけこのセットが増えたり入れ子になる
    │       ├── layout.tsx      // 画面固有のレイアウト
    │       ├── page.tsx        // レイアウトのラッパー
    │       ├── xxx.types.ts    // 画面固有の型
    │       ├── api.ts          // 画面固有のAPI 呼び出し
    │       └── hooks.ts        // 画面固有のカスタムフック
    ├── components              // 共通のデザイン部品を配置
    │   ├── ui // Material Design 方針の共通 UI コンポーネント
    │   │   ├── 少し複雑なUIは直下に配置
    │   │   └── primitives
    │   │       └── Button.tsx
    │   └── hooks/
    │       └── useToast.ts
    ├── styles // 共通スタイルなどがあれば
    ├── lib // ライブラリ固有操作の隠蔽
    │   ├── api
    │   │   └── client.ts       // 共通 fetch ラッパ(apiRequest など)
    │   └── router
    │       └── router.ts       // ルーティング helper など
    ├── stores                  // グローバルUI状態(サイドバー開閉、テーマなど)
    ├── types                   // 複数画面で共有できる型
    │   └── user.ts
    └── public                  // 静的なアセットを格納
```
