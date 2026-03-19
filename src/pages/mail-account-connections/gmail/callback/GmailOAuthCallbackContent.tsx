import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/primitives/Button';
import { ApiError } from '@/lib/api/client';
import type { GmailOAuthErrorBody } from '../gmail-oauth.types';
import { useCompleteGmailOAuth } from './useCompleteGmailOAuth';

type Status = 'pending' | 'success' | 'error' | 'missing';

const headingByStatus: Record<
  Status,
  {
    title: string;
    description: string;
  }
> = {
  pending: {
    title: 'Gmail 連携を完了しています',
    description: 'Google の認可結果を確認しています。数秒お待ちください。',
  },
  success: {
    title: 'Gmail 連携が完了しました',
    description: 'このまま連携ページへ戻るか、ホームへ移動できます。',
  },
  error: {
    title: 'Gmail 連携に失敗しました',
    description: 'もう一度連携をやり直してください。必要に応じて再ログインしてください。',
  },
  missing: {
    title: '連携に必要な情報が見つかりません',
    description: 'Gmail 連携ページから最初からやり直してください。',
  },
};

const getInitialStatus = (params: {
  code: string | null;
  state: string | null;
  googleError: string | null;
}): Status => {
  const { code, state, googleError } = params;

  if (googleError) {
    return 'error';
  }

  if (code && state) {
    return 'pending';
  }

  return 'missing';
};

const getInitialMessage = (status: Status, googleError: string | null): string => {
  if (status === 'pending') {
    return 'Google の認可結果を確認しています...';
  }

  if (status === 'missing') {
    return '連携に必要な情報が見つかりませんでした。';
  }

  if (googleError) {
    return googleError === 'access_denied'
      ? 'Google 側で連携がキャンセルされました。'
      : 'Google 連携でエラーが発生しました。もう一度お試しください。';
  }

  return 'Gmail 連携に失敗しました。もう一度お試しください。';
};

const extractApiErrorCode = (error: ApiError): string | undefined => {
  const body = error.body as GmailOAuthErrorBody | undefined;
  return body?.code ?? body?.error?.code;
};

const mapCallbackError = (error: unknown): string => {
  if (error instanceof ApiError) {
    const code = extractApiErrorCode(error);

    if (error.status === 401 || code === 'unauthorized') {
      return 'ログイン期限が切れました。再度ログインしてください。';
    }
    if (error.status === 400 || code === 'invalid_request') {
      return '連携情報が不足しています。もう一度やり直してください。';
    }
    if (error.status === 409 && code === 'oauth_state_mismatch') {
      return '連携状態が一致しません。最初からやり直してください。';
    }
    if (error.status === 409 && code === 'oauth_state_expired') {
      return '連携の有効期限が切れました。もう一度やり直してください。';
    }
    if (error.status === 503 && code === 'gmail_oauth_exchange_failed') {
      return 'Google とのトークン交換に失敗しました。時間をおいて再度お試しください。';
    }
    if (error.status === 503 && code === 'gmail_profile_fetch_failed') {
      return 'Gmail 情報の取得に失敗しました。時間をおいて再度お試しください。';
    }
  }

  return 'エラーが発生しました。時間をおいて再度お試しください。';
};

const scrubCallbackQuery = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.history.replaceState(null, '', '/mail-account-connections/gmail/callback');
  } catch {
    // no-op
  }
};

export const GmailOAuthCallbackContent = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const googleError = searchParams.get('error');
  const initialStatus = getInitialStatus({ code, state, googleError });
  const [status, setStatus] = useState<Status>(initialStatus);
  const [message, setMessage] = useState<string>(getInitialMessage(initialStatus, googleError));
  const hasStartedRef = useRef<string | null>(null);
  const { mutateAsync } = useCompleteGmailOAuth();

  useEffect(() => {
    if (googleError) {
      setStatus('error');
      setMessage(getInitialMessage('error', googleError));
      scrubCallbackQuery();
      return;
    }

    if (!code || !state) {
      setStatus('missing');
      setMessage('連携に必要な情報が見つかりませんでした。');
      return;
    }

    const requestKey = `${code}:${state}`;
    if (hasStartedRef.current === requestKey) {
      return;
    }

    hasStartedRef.current = requestKey;

    void mutateAsync({ code, state })
      .then((response) => {
        setStatus('success');
        setMessage(response.message ?? 'Gmail 連携が完了しました。');
        scrubCallbackQuery();
      })
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(mapCallbackError(error));
        scrubCallbackQuery();
      });
  }, [code, googleError, mutateAsync, state]);

  const heading = headingByStatus[status];
  const isPending = status === 'pending';
  const isSuccess = status === 'success';
  const isError = status === 'error' || status === 'missing';

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-sm font-semibold text-emerald-600">Gmail 連携</p>
        <h1 className="text-2xl font-bold text-slate-900">{heading.title}</h1>
        <p className="text-sm text-slate-600">{heading.description}</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center text-sm text-slate-700">
        {isPending ? (
          <>
            <Spinner size={24} className="text-emerald-600" />
            <p aria-live="polite">{message}</p>
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/home', { replace: true })}
              >
                ホームへ戻る
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
              <Button
                type="button"
                onClick={() => navigate('/mail-account-connections/gmail', { replace: true })}
              >
                もう一度やり直す
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/home', { replace: true })}
              >
                ホームへ戻る
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};
