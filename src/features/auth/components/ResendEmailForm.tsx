import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ApiError, getApiErrorCode } from '@/shared/api/client';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import { useLastRegisteredEmail } from '../hooks/useLastRegisteredEmail';
import { useResendEmail } from '../hooks/useResendEmail';
import { persistLastRegisteredEmail } from '../lib/lastRegisteredEmail';
import { resendEmailSchema, type ResendEmailFormValues } from '../schema/resend-email.schema';

type FeedbackTone = 'success' | 'error' | 'info';

type Feedback = {
  tone: FeedbackTone;
  message: string;
};

const mapResendEmailError = (error: unknown): Feedback => {
  if (error instanceof ApiError) {
    const code = getApiErrorCode(error);

    if (code === 'invalid_credentials') {
      return {
        tone: 'error',
        message: 'メールアドレスまたはパスワードが正しくありません。',
      };
    }

    if (code === 'already_verified') {
      return {
        tone: 'info',
        message: 'このメールアドレスは既に認証済みです。',
      };
    }

    if (error.apiMessage) {
      return {
        tone: 'error',
        message: error.apiMessage,
      };
    }
  }

  return {
    tone: 'error',
    message: 'エラーが発生しました。時間をおいて再度お試しください。',
  };
};

const feedbackClassNames: Record<FeedbackTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
};

const feedbackDotClassNames: Record<FeedbackTone, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
};

export const ResendEmailForm = (): JSX.Element => {
  const navigate = useNavigate();
  const { email: lastRegisteredEmail } = useLastRegisteredEmail();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ResendEmailFormValues>({
    resolver: zodResolver(resendEmailSchema),
    defaultValues: {
      email: lastRegisteredEmail ?? '',
      password: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!lastRegisteredEmail || getValues('email')) {
      return;
    }

    setValue('email', lastRegisteredEmail, { shouldDirty: false });
  }, [getValues, lastRegisteredEmail, setValue]);

  const resendEmailMutation = useResendEmail();
  const isSubmitting = resendEmailMutation.isPending;

  const onSubmit = (values: ResendEmailFormValues): void => {
    setFeedback(null);

    resendEmailMutation.mutate(values, {
      onSuccess: (response) => {
        persistLastRegisteredEmail(values.email);
        setFeedback({
          tone: 'success',
          message: response.message,
        });
      },
      onError: (error: unknown) => {
        setFeedback(mapResendEmailError(error));
      },
    });
  };

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold text-emerald-600">確認メールの再送</p>
        <h1 className="text-2xl font-bold text-slate-900">確認メールをもう一度送る</h1>
        <p className="text-sm text-slate-500">
          会員登録時のメールアドレスとパスワードを入力すると、確認メールを再送できます。
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        メールが見つからない場合は、迷惑メールフォルダもあわせて確認してください。
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {feedback ? (
          <div
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${feedbackClassNames[feedback.tone]}`}
          >
            <span className={`h-2 w-2 rounded-full ${feedbackDotClassNames[feedback.tone]}`} />
            {feedback.message}
          </div>
        ) : null}

        <div className="space-y-3">
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting ? '送信中...' : '確認メールを再送する'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/login')}
            disabled={isSubmitting}
          >
            ログイン画面へ戻る
          </Button>
        </div>
      </form>
    </section>
  );
};
