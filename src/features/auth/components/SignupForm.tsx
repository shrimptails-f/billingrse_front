import type { JSX } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ApiError, getApiErrorCode } from '@/shared/api/client';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import { useSignup } from '../hooks/useSignup';
import { persistLastRegisteredEmail } from '../lib/lastRegisteredEmail';
import { signupSchema, type SignupFormValues } from '../schema/signup.schema';

const mapSignupError = (error: unknown): string => {
  if (error instanceof ApiError) {
    const code = getApiErrorCode(error);

    if (error.status === 401 && code === 'email_already_exists') {
      return 'このメールアドレスは既に登録されています。';
    }
  }

  return 'エラーが発生しました。時間をおいて再度お試しください。';
};

export const SignupForm = (): JSX.Element => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const signupMutation = useSignup();
  const isSubmitting = signupMutation.isPending;

  const onSubmit = (values: SignupFormValues): void => {
    setServerError(null);
    signupMutation.mutate(values, {
      onSuccess: (response) => {
        const email = response.user?.email ?? values.email;
        persistLastRegisteredEmail(email);

        const search = email ? `?email=${encodeURIComponent(email)}` : '';
        navigate(`/signup/email-sent${search}`, { replace: true });
      },
      onError: (error: unknown) => {
        setServerError(mapSignupError(error));
      },
    });
  };

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur transition">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-emerald-600">新規登録</p>
        <h1 className="text-2xl font-bold text-slate-900">会員登録</h1>
        <p className="text-sm text-slate-500">
          お名前、メールアドレス、パスワードを入力してアカウントを作成してください。
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          id="name"
          label="氏名"
          placeholder="山田 太郎"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          id="email"
          type="email"
          label="メールアドレス"
          placeholder="you@example.com"
          autoComplete="username email"
          error={errors.email?.message}
          {...register('email')}
        />

        <TextField
          id="password"
          type="password"
          label="パスワード"
          placeholder="********"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">同意事項:</span> TODO:
          利用規約・プライバシーポリシーの同意
        </div>

        {serverError ? (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {serverError}
          </div>
        ) : null}

        <div className="space-y-3">
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? '送信中...' : '登録してメールを送る'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/login', { replace: true })}
            disabled={isSubmitting}
          >
            すでに登録済みの方はこちら（ログイン）
          </Button>
        </div>
      </form>
    </section>
  );
};
