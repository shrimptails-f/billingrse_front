import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/primitives/Button';
import { ApiError } from '@/lib/api/client';
import type { GmailAuthorizeResponse } from './gmail-oauth.types';
import { useStartGmailOAuth } from './useStartGmailOAuth';
import { ConnectionList } from './ConnectionList';

const mapStartError = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 401) {
    return '認証エラーが発生しました。再度ログインしてください。';
  }

  return 'Gmail 連携の開始に失敗しました。時間をおいて再度お試しください。';
};

const isValidAuthorizationResponse = (response: GmailAuthorizeResponse): boolean =>
  typeof response.authorization_url === 'string' && response.authorization_url.trim().length > 0;

export const redirectToAuthorizationUrl = (url: string): void => {
  globalThis.location.assign(url);
};

export const GmailConnectionContent = (): JSX.Element => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const startMutation = useStartGmailOAuth();
  const isSubmitting = startMutation.isPending;

  const handleStart = (): void => {
    setServerError(null);
    startMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (!isValidAuthorizationResponse(response)) {
          setServerError('認可 URL の取得に失敗しました。時間をおいて再度お試しください。');
          return;
        }

        redirectToAuthorizationUrl(response.authorization_url);
      },
      onError: (error: unknown) => {
        setServerError(mapStartError(error));
      },
    });
  };

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            メールサービス連携
          </p>
          <p className="text-base leading-7 text-slate-600">
            Gmail アカウントを連携して、メールをこのアプリで管理できます。
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="button"
            fullWidth={false}
            disabled={isSubmitting}
            aria-label="連携追加"
            leftIcon={
              isSubmitting ? (
                <Spinner size={16} className="text-white" />
              ) : (
                <span aria-hidden="true">+</span>
              )
            }
            onClick={handleStart}
          >
            {isSubmitting ? 'Google に移動しています...' : '連携追加'}
          </Button>
        </div>

        {serverError ? (
          <div
            role="alert"
            aria-live="polite"
            className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {serverError}
          </div>
        ) : null}

        <ConnectionList />

        <div className="flex justify-center mt-8">
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            disabled={isSubmitting}
            onClick={() => navigate('/home', { replace: true })}
          >
            ホームへ戻る
          </Button>
        </div>
      </div>
    </section>
  );
};
