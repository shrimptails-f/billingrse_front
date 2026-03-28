import type { JSX } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toFriendlyMessage } from '@/shared/api/errors';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormValues } from '../schema/login.schema';

export const LoginForm = (): JSX.Element => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const loginMutation = useLogin();
  const isSubmitting = loginMutation.isPending;

  const onSubmit = (values: LoginFormValues): void => {
    setAuthError(null);
    loginMutation.mutate(values, {
      onSuccess: () => navigate('/dashboard'),
      onError: (error: unknown) => setAuthError(toFriendlyMessage(error)),
    });
  };

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="mb-8 space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">ログイン</h1>
        <p className="text-sm text-slate-500">
          メールアドレスとパスワードを入力してログインしてください。
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          id="email"
          type="email"
          label="メールアドレス"
          placeholder="you@example.com"
          autoComplete="username"
          error={errors.email?.message}
          {...register('email')}
        />

        <TextField
          id="password"
          type="password"
          label="パスワード"
          placeholder="********"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {authError ? (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {authError}
          </div>
        ) : null}

        <div className="space-y-3">
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? '送信中...' : 'ログイン'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/signup')}
            disabled={isSubmitting}
          >
            会員登録
          </Button>
        </div>
      </form>
    </section>
  );
};
