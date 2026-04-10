# ローカル環境構築

## 前提

- Node.js は DevContainer と同じ `24` 系を推奨
- `npm` が利用できること
- API 連携を確認する場合はバックエンド `billingrse_backend` を別途起動しておくこと

## 1. リポジトリを取得

```bash
git clone git@github.com:shrimptails-f/billingrse_front.git
cd billingrse_front
```

## 2. 依存関係をインストール

```bash
npm install
```

## 3. 環境変数を設定

プロジェクトルートに `.env.local` を作成し、必要な値を設定します。

バックエンドに接続して動作確認する場合:

```env
VITE_APP_NAME=billingrse
VITE_BACKEND_API_URL=http://localhost:8080/api/v1
```

バックエンド未接続で画面確認したい場合:

```env
VITE_APP_NAME=billingrse
VITE_ENABLE_MOCK_MODE=true
```

## 4. 開発サーバーを起動

```bash
npm run dev
```

## 5. 動作確認コマンド

```bash
npm run lint
npm run test
npm run build
```

## DevContainer を使う場合

VS Code DevContainer を使う場合は [VS Code DevContainer](./VsCodeDevContainer.md) を参照してください。
