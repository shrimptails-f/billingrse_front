# コーディング規約

## 1. 基本方針
- 単方向データフローを最優先
- サーバーデータは TanStack Query のキャッシュを唯一のソースオブトゥルースとする
- UI 状態は Zustand / React Hook Form / ローカル state に閉じる
- 画面ごとに app 配下へ co-location
- 各ルート配下に UI / hooks / api / schema / types をまとめる
- 共通化はやりすぎない（「明らかに複数画面で使っている」と分かった段階で shared/lib/types に切り出す）

## 2. ディレクトリ & ファイル命名規約
### 2-1. ディレクトリ構成（抜粋）
- `docs/architecture.md` を参照

### 2-2. 命名ルール
#### ファイル名
- React コンポーネント: `PascalCase.tsx`（例: `LoginForm.tsx`）
- hooks: `camelCase.ts`（例: `useLogin.ts`、`home.hooks.ts` 内で `useHomeOverview`）
- API ファイル: `foo.api.ts`（例: `login.api.ts`、`home.api.ts`）
- Zod スキーマ: `xxx.schema.ts`（例: `login.schema.ts`）
- 型定義: `xxx.types.ts`、共有ドメインは `src/types/*.ts`

#### ディレクトリ名
- app 以下のルート: lowercase（Next のルール準拠）
- Route Group: `(auth)`、`(app)` のように括弧付き

## 3. TypeScript / 関数の書き方
- 関数は変数に代入する形式で統一
- 可能な限り型注釈を付ける（関数引数 / 返り値。React コンポーネントは `JSX.Element` / `ReactNode`）
- `any` は原則禁止（やむを得ず使う場合は TODO コメントを付ける）
- `type Props` を定義し、`const Component = (props: Props)` の形で書く

```typescript
// OK
export const login = (payload: LoginInput): Promise<LoginResponse> => {
  // ...
};

// NG
export function login(payload: LoginInput): Promise<LoginResponse> {
  // ...
}
```

```typescript
type Props = {
  title: string;
};

export const Title = (props: Props): JSX.Element => {
  const { title } = props;
  return <h1>{title}</h1>;
};
```

## 4. React / Next.js
### 4.1. コンポーネントの書き方
- ファイル先頭付近に `type Props` を定義し、`const Component = (props: Props)` の形で書く
- 複雑になってきたらコンポーネントを小さく分割する

```typescript
type Props = {
  userName: string;
};

export const HomeGreeting = (props: Props): JSX.Element => {
  const { userName } = props;

  return (
    <section className="px-4 py-6">
      <h1 className="text-xl font-semibold">こんにちは、{userName} さん</h1>
    </section>
  );
};
```

## 5. 状態管理（TanStack Query / Zustand / React Hook Form）
### 5.1. サーバ状態（Server State: TanStack Query）
- サーバ由来データは TanStack Query のキャッシュを唯一のソースオブトゥルースとする
- 同じデータを Zustand にコピーして保持しない（二重管理禁止）
- Query 用の hook を定義し、コンポーネントからはその hook 経由で使用する

```typescript
// app/(app)/home/home.hooks.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchHomeOverview } from './home.api';

export const useHomeOverview = () => {
  const query = useQuery({
    queryKey: ['home', 'overview'],
    queryFn: fetchHomeOverview,
  });

  return query;
};
```

### 5.2. UI 状態（UI State: Zustand）
- グローバルな UI 状態は `stores/uiStore.ts` に集約する
- サーバーデータ（ユーザ情報・一覧など）は扱わない

```typescript
// stores/uiStore.ts
import { create } from 'zustand';

type UiState = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

### 5.3. フォーム状態（React Hook Form + Zod）
- フォームは React Hook Form + Zod に統一する
- スキーマと入力型は `*.schema.ts` に定義する

```typescript
// app/(auth)/login/login.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```typescript
// app/(auth)/login/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from './login.schema';
import { useLogin } from './useLogin';

export const LoginForm = (): JSX.Element => {
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const { errors } = formState;

  const { mutate, isPending } = useLogin();

  const onSubmit = (data: LoginInput) => {
    mutate(data);
  };

  return (
    <form
      className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-2xl font-semibold text-center">ログイン</h1>

      {/* メール */}
      <div>
        <input
          type="email"
          placeholder="メールアドレス"
          {...register('email')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* パスワード */}
      <div>
        <input
          type="password"
          placeholder="パスワード"
          {...register('password')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-blue-600 text-white py-2 disabled:opacity-60"
      >
        {isPending ? 'ログイン中…' : 'ログイン'}
      </button>
    </form>
  );
};
```

## 6. API 呼び出し
### 6.1. 共通クライアント
- 共通の HTTP ラッパは `lib/api/client.ts` に定義する
- `fetch` を直接コンポーネントから呼ばず、必ずこのクライアントを通す

```typescript
// lib/api/client.ts
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

export const apiRequest = async <TResponse>(
  path: string,
  options: ApiOptions = {}
): Promise<TResponse> => {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Cookie ベース認証なら ON
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // TODO: 共通エラー型に変換
    throw new Error('API Error');
  }

  const data = (await response.json()) as TResponse;
  return data;
};
```

### 6.2. 画面専用 API
- 各画面用の API は、その画面配下に `*.api.ts` として定義する
- コンポーネントからは `useXxx` hook 経由で呼び出す

```typescript
// app/(auth)/login/login.api.ts
import { apiRequest } from '@/lib/api/client';
import type { LoginInput } from './login.schema';

export type LoginResponse = {
  id: string;
  name: string;
  email: string;
};

export const login = (payload: LoginInput): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
};
```

```typescript
// app/(auth)/login/useLogin.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from './login.api';
import type { LoginInput } from './login.schema';

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: (payload: LoginInput) => login(payload),
  });

  return mutation;
};
```

## 7. スタイリング / Tailwind / 自作 UI
- スタイルは基本的に Tailwind のユーティリティクラスを使用する
- 複数箇所で使う UI パターンは `shared/ui/` にコンポーネントとして切り出す
- デザイン方針は Material Design 風（角丸・影・余白など）をベースに統一する

```typescript
// shared/ui/Button.tsx
'use client';

import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = (props: Props): JSX.Element => {
  const { variant = 'primary', className, ...rest } = props;

  const baseClass =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200';

  return (
    <button {...rest} className={clsx(baseClass, variantClass, className)} />
  );
};
```

## 8. テスト規約（React Testing Library）
- テストファイル名: `*.test.tsx` / `*.test.ts`
- React Testing Library を使い、ユーザ視点での振る舞いをテストする
- ラベル・プレースホルダ・テキスト内容で要素を取得する
- クリック / 入力 / サブミットなどの挙動を確認する
- エラーメッセージ表示などの状態を確認する

```typescript
// 例: tests/app/auth/login/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/app/(auth)/login/LoginForm';

test('メールアドレスの入力欄が表示される', () => {
  render(<LoginForm />);
  const emailInput = screen.getByPlaceholderText('メールアドレス');
  expect(emailInput).toBeInTheDocument();
});
```

## 9. 単方向データフローのルールまとめ
- サーバデータ: TanStack Query の `useQuery` / `useMutation` を経由する。Zustand にコピーして保持しない
- UI 状態:
  - グローバル: `stores/uiStore.ts`（Zustand）
  - フォーム: React Hook Form
  - ローカル UI: `useState`（影響範囲が小さい場合）
- 状態変更: コンポーネントからは必ずカスタムフック（`useXxx`）を経由して行う。`apiRequest` や `setState` を複数箇所から直呼びしない

この規約をベースに、実装していく中で必要に応じて細かいルールを追加していく。
