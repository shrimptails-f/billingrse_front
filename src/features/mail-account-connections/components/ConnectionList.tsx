import type { JSX } from 'react';
import { useState } from 'react';
import { ApiError } from '@/shared/api/client';
import { Spinner } from '@/shared/ui/Spinner';
import { useConnectionList } from '../hooks/useConnectionList';
import { useDisconnect } from '../hooks/useDisconnect';
import { ConnectionRow } from './ConnectionRow';

const mapDisconnectError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'ログイン期限が切れました。再度ログインしてください。';
    }

    if (error.status === 404) {
      return '対象の連携が見つかりませんでした。';
    }
  }

  return '連携の解除に失敗しました。時間をおいて再度お試しください。';
};

export const ConnectionList = (): JSX.Element => {
  const { data, isError, isLoading } = useConnectionList();
  const disconnectMutation = useDisconnect();
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
  const items = data?.items ?? [];

  const handleDisconnect = (connectionId: number, accountIdentifier: string): void => {
    if (!window.confirm(`${accountIdentifier} の連携を解除しますか？`)) {
      return;
    }

    setDisconnectError(null);
    setDisconnectingId(connectionId);
    disconnectMutation.mutate(connectionId, {
      onSuccess: () => {
        setDisconnectingId(null);
      },
      onError: (error: unknown) => {
        setDisconnectingId(null);
        setDisconnectError(mapDisconnectError(error));
      },
    });
  };

  return (
    <div className="mt-8">
      {disconnectError ? (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {disconnectError}
        </div>
      ) : null}

      <h2 className="text-sm font-semibold text-slate-500">連携済みアカウント</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size={24} label="連携情報を読み込み中" />
        </div>
      ) : isError ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          連携情報の取得に失敗しました。時間をおいて再度お試しください。
        </div>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">連携済みのアカウントはありません</p>
      ) : (
        <div className="mt-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={index < items.length - 1 ? 'border-b border-slate-100' : ''}
            >
              <ConnectionRow
                provider={item.provider}
                accountIdentifier={item.account_identifier}
                onDisconnect={() => handleDisconnect(item.id, item.account_identifier)}
                isDisconnecting={disconnectingId === item.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
