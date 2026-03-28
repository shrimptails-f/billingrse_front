import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/primitives/Button';
import { useStartGmailOAuth } from '../hooks/useStartGmailOAuth';
import type { GmailAuthorizeResponse } from '../types/gmail-oauth.types';
import { ConnectionList } from './ConnectionList';

const mapStartError = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 401) {
    return '認証エラーが発生しました。再度ログインしてください。';
  }

  return 'Gmail 連携の開始に失敗しました。時間をおいて再度お試しください。';
};

const isValidAuthorizationResponse = (response: GmailAuthorizeResponse): boolean => {
  return (
    typeof response.authorization_url === 'string' && response.authorization_url.trim().length > 0
  );
};

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
    <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          メールサービス連携
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Gmail アカウント連携</h1>
        <p className="text-base leading-7 text-slate-600">
          Gmail アカウントを連携して、このアプリで利用するメール送受信の入口を管理します。
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          fullWidth={false}
          loading={isSubmitting}
          disabled={isSubmitting}
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

      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          disabled={isSubmitting}
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          ホームへ戻る
        </Button>
      </div>
    </section>
  );
};
