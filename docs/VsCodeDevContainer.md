# VS Code DevContainer

## 前提

- バックエンドは別途 [billingrse_backend](https://github.com/shrimptails-f/billingrse_backend) をセットアップしておく
- VS Code と Dev Containers 拡張が利用できること
- Docker / Docker Desktop が起動していること

## 1. リポジトリを取得

```bash
git clone git@github.com:shrimptails-f/billingrse_front.git
cd billingrse_front
```

## 2. DevContainer 用の環境変数を作成

```bash
cp .devcontainer/.env.sample .devcontainer/.env
```

必要に応じて `.devcontainer/.env` の `VITE_BACKEND_API_URL` を調整してください。

## 3. VS Code でプロジェクトを開く

`billingrse_front` のフォルダを VS Code で開きます。

## 4. Reopen in Container を実行

コマンドパレットから `Dev Containers: Reopen in Container` を実行します。

## 5. 初回セットアップ

コンテナ起動後に `postCreateCommand` で `task setup` が実行されます。必要に応じて手動でも実行できます。

```bash
task setup
```

## 6. 開発サーバーを起動

```bash
npm run dev
```
