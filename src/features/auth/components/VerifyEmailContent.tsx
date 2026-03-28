import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, getApiErrorCode } from '@/shared/api/client';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/primitives/Button';
import { useLastRegisteredEmail } from '../hooks/useLastRegisteredEmail';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

const mapVerifyError = (error: unknown): string => {
  if (error instanceof ApiError) {
    const code = getApiErrorCode(error);

    if (error.status === 400 && code === 'invalid_token') {
      return '不正なトークンです。';
    }
  }

  return 'エラーが発生しました。時間をおいて再度お試しください。';
};

type Status = 'pending' | 'success' | 'error' | 'missing';

const headingByStatus: Record<
  Status,
  {
    title: string;
    description: string;
  }
> = {
  pending: {
    title: 'メールアドレスを確認しています',
    description: 'メール記載のリンクからアクセスしました。数秒お待ちください。',
  },
  success: {
    title: 'メール認証が完了しました',
    description: 'ダッシュボードへ進むと、未ログインの場合はログイン画面へ移動します。',
  },
  error: {
    title: 'メール認証に失敗しました',
    description:
      '再送フォームから確認メールを送り直すか、必要に応じて会員登録をやり直してください。',
  },
  missing: {
    title: 'トークンが見つかりません',
    description: 'メールのリンクを再度開くか、確認メールの再送をお試しください。',
  },
};

export const VerifyEmailContent = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { email } = useLastRegisteredEmail();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'pending' : 'missing');
  const [message, setMessage] = useState<string | null>(
    token ? 'メールアドレスを確認しています...' : 'トークンが見つかりませんでした。'
  );
  const hasStartedRef = useRef<string | null>(null);
  const { mutateAsync } = useVerifyEmail();
  const resendPath = email
    ? `/signup/email-resend?email=${encodeURIComponent(email)}`
    : '/signup/email-resend';

  useEffect(() => {
    if (!token) {
      return;
    }

    if (hasStartedRef.current === token) {
      return;
    }

    hasStartedRef.current = token;

    void mutateAsync(token)
      .then((response) => {
        setStatus('success');
        setMessage(response.message ?? 'メールアドレスの認証が完了しました。');

        try {
          window.history.replaceState(null, '', '/signup/verify');
        } catch {
          // no-op
        }
      })
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(mapVerifyError(error));
      });
  }, [mutateAsync, token]);

  const isLoading = status === 'pending';
  const isSuccess = status === 'success';
  const isError = status === 'error' || status === 'missing';
  const heading = headingByStatus[status];

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-sm font-semibold text-emerald-600">メール認証</p>
        <h1 className="text-2xl font-bold text-slate-900">{heading.title}</h1>
        <p className="text-sm text-slate-600">{heading.description}</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center text-sm text-slate-700">
        {isLoading ? (
          <>
            <Spinner size={24} className="text-emerald-600" />
            <p aria-live="polite">メールアドレスを確認しています...</p>
          </>
        ) : null}

        {isSuccess ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </div>
            <p aria-live="polite" className="text-base font-semibold text-emerald-700">
              {message}
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button type="button" onClick={() => navigate('/dashboard')}>
                ダッシュボードへ移動する
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
                ログイン画面へ進む
              </Button>
            </div>
          </>
        ) : null}

        {isError ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </div>
            <p aria-live="polite" className="text-base font-semibold text-red-700">
              {message}
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button type="button" onClick={() => navigate(resendPath)}>
                確認メールを再送する
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/signup')}>
                会員登録に戻る
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
                ログイン画面へ戻る
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};
