# コーディング規約

## 1. 基本方針

- React + TypeScript を前提とする
- ディレクトリ構成は `app / features / shared` を採用する
- URL、route guard、layout は `app/` に置く
- 業務機能ごとの screen、UI、hooks、API、schema、types は `features/` に置く
- 複数 feature で再利用する UI や基盤コードだけを `shared/` に置く
- 1 つの feature でしか使わない code は、その feature 内に閉じる
- 共通化は「実際に複数 feature で使っている」と確認できてから行う

## 2. ディレクトリ・命名規約

### 2-1. ディレクトリ構成

- 全体構成は [`docs/architecture.md`](/home/node/front/docs/architecture.md) に従う
- top-level の feature 名は画面名ではなく業務機能名にする
- `app/router` が route 定義を持ち、feature 配下の `screens/` を参照する

### 2-2. ファイル命名

- React コンポーネント: `PascalCase.tsx`
- hooks: `camelCase.ts`
- API モジュール: `xxx.api.ts`
- schema: `xxx.schema.ts`
- 型定義: `xxx.types.ts`
- テスト: `*.test.ts` または `*.test.tsx`

例:

- `LoginPage.tsx`
- `GmailConnectionContent.tsx`
- `useLogin.ts`
- `billing-summary.api.ts`
- `signup.schema.ts`
- `gmail-oauth.types.ts`

### 2-3. 命名ルール

- top-level feature 名は `auth`, `gmail-integration`, `billing` のように業務機能名で付ける
- `login` や `billing-summary` のような画面名を top-level feature 名にしない
- route 用 screen は `LoginPage.tsx` のように目的が分かる名前にする
- 汎用名の `page.tsx` より、役割が明示された名前を優先する

### 2-4. `index.ts` / barrel の運用

- `index.ts` は feature やモジュールの公開面を定義するために使う
- `features/*/index.ts` には、feature 外から参照してよい screen や hook など、公開するものだけを export してよい
- `app/router/guards/index.ts` のように、責務がまとまった小さな単位を外に見せる用途でも使ってよい
- `components/index.ts` や `shared/index.ts` のような、何でも再 export する巨大 barrel は作らない
- feature 内部の実装同士は、原則として `index.ts` を経由せず相対 import を使う
- 深い階層に機械的に `index.ts` を増やさず、公開面としての必要性が明確な場合だけ追加する

## 3. TypeScript の書き方

- `any` は原則禁止とする
- 関数引数と返り値は、必要に応じて明示する
- React コンポーネントの返り値は `JSX.Element` または `JSX.Element | null` を使う
- Props は `type Props = { ... }` で定義する
- export する関数は、変数代入形式を基本とする

```typescript
type Props = {
  title: string;
};

export const PageTitle = ({ title }: Props): JSX.Element => {
  return <h1>{title}</h1>;
};
```

```typescript
type LoginPayload = {
  email: string;
  password: string;
};

export const login = async (payload: LoginPayload): Promise<void> => {
  // ...
};
```

## 4. React コンポーネント

- component は 1 ファイル 1 役割を基本とする
- screen は route の入口として薄く保ち、複雑な UI は `components/` に分離する
- hook 呼び出し、画面構成、イベントハンドラが長くなったら分割する
- 画面専用 component は feature 内に置き、汎用 component だけを `shared/ui` に置く

```typescript
import type { JSX } from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = (): JSX.Element => {
  return <LoginForm />;
};
```

## 5. React Router

- route 定義は `app/router` に集約する
- feature 側は route table を持たない
- screen component は `app/router` から import して利用する
- 画面遷移は `useNavigate`、URL パラメータやクエリは React Router の hook を使う

```typescript
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/screens/LoginPage';
import { BillingSummaryPage } from '@/features/billing/screens/BillingSummaryPage';

export const AppRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/billing-summary" element={<BillingSummaryPage />} />
    </Routes>
  );
};
```

## 6. 状態管理

### 6-1. サーバ状態

- サーバ由来データは TanStack Query を唯一のソースオブトゥルースとする
- 同じサーバデータを別の state にコピーして保持しない
- コンポーネントから直接 `fetch` せず、`useQuery` / `useMutation` を通す
- query key は意味のある単位で定義し、invalidate / remove の対象を明確にする

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchConnectionList } from '../api/gmail-connections.api';

export const useConnectionList = () => {
  return useQuery({
    queryKey: ['gmail-connections'],
    queryFn: fetchConnectionList,
  });
};
```

### 6-2. フォーム状態

- フォームは React Hook Form + Zod を基本とする
- schema と入力型は `*.schema.ts` に定義する
- 送信処理は component 内に直接書きすぎず、mutation hook に寄せる

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

### 6-3. ローカル UI 状態

- 画面内で閉じる状態は `useState` を使う
- 一時的な表示切り替えや入力補助など、局所的な状態は global に上げない
- 複数 component 間で共有する必要が出てから state の持ち上げを検討する

## 7. API 呼び出し

### 7-1. API モジュール

- API 呼び出しは `*.api.ts` に定義する
- component や hook から直接 `fetch` を呼ばない
- HTTP の詳細は共通クライアントに寄せる

```typescript
import { apiFetch } from '@/shared/api/client';
import type { LoginFormValues } from '../schema/login.schema';

export type LoginResponse = {
  accessToken: string;
};

export const login = (payload: LoginFormValues): Promise<LoginResponse> => {
  return apiFetch('POST', '/auth/login', { body: payload });
};
```

### 7-2. 共通クライアント

- 共通の HTTP ラッパは `shared/api` に置く
- 認証ヘッダ、エラー整形、クエリ文字列、再試行などは共通クライアントで扱う
- `import.meta.env.VITE_*` を使い、Vite の環境変数規約に従う

## 8. import と依存方向

- `app` は `features` と `shared` を参照してよい
- `features` は `shared` を参照してよい
- `shared` は `features` や `app` を参照しない
- feature 間の直接依存は最小限に抑える
- import path は相対参照が深くなりすぎる場合、エイリアスを優先する

## 9. スタイリング

- スタイリングは Tailwind CSS を基本とする
- 再利用する見た目は `shared/ui` の component に寄せる
- feature 固有の見た目は、その feature 内の component に閉じる
- class の組み立てが複雑になったら、見た目ごとに component を分ける

## 10. テスト

- テストは Vitest + React Testing Library を使う
- 実装詳細より、ユーザから見える振る舞いを優先して検証する
- 要素取得は `getByRole` を第一候補とし、必要に応じて `getByLabelText` や `getByText` を使う
- hook や screen のテストでは、必要な provider を wrapper で与える
- API 通信はモックし、成功系・失敗系の両方を確認する

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

test('ログイン見出しを表示する', () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
});
```

## 11. 禁止事項

- component から直接 `fetch` を呼ぶ
- 1 つの feature でしか使わない code を早い段階で `shared` に出す
- server state をローカル state や別ストアへ二重管理する
- route 定義を feature ごとに分散させる
- 役割が曖昧な巨大 component や巨大 hook を放置する
