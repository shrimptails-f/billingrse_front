import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/primitives/Button';
import { ApiError } from '@/lib/api/client';
import type { GmailAuthorizeResponse } from './gmail-oauth.types';
import { useStartGmailOAuth } from './useStartGmailOAuth';

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
            Gmail 連携
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Gmail と連携する</h1>
          <p className="text-base leading-7 text-slate-600">
            Google の認可画面へ移動して、Gmail
            の読み取り連携を開始します。認可後はこのアプリに戻り、連携結果を確認できます。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          連携済みアカウントの一覧表示や解除は、今回の API には含まれていません。現時点では Gmail
          連携の開始と callback 完了のみを提供します。
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

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            fullWidth={false}
            disabled={isSubmitting}
            aria-label="Gmail と連携する"
            leftIcon={isSubmitting ? <Spinner size={16} className="text-white" /> : null}
            onClick={handleStart}
          >
            {isSubmitting ? 'Google に移動しています...' : 'Gmail と連携する'}
          </Button>
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
