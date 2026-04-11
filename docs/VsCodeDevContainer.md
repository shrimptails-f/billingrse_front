# VS Code DevContainer

## 1. ソースをクローン

```bash
git clone git@github.com:shrimptails-f/billingrse_front.git
cd billingrse_front
```

## 2. .envをコピー

```bash
cp .devcontainer/.env.sample .devcontainer/.env
```

※必要に応じて `.devcontainer/.env` の `VITE_BACKEND_API_URL` を調整してください。

## 3. VS Code でプロジェクトフォルダーを開く

`billingrse_front` のフォルダを VS Code で開きます。

## 4. Reopen in Container を実行

コマンドパレットから `Dev Containers: Reopen in Container` を実行します。

## 5. 開発サーバーを起動

VsCodeのターミナルで下記のコマンドを実行してください。

```bash
npm run dev
```
