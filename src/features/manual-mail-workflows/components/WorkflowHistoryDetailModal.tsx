import { useEffect, type JSX } from 'react';
import { Button } from '@/shared/ui/primitives/Button';
import type { ManualMailWorkflowHistoryItem } from '../types/manual-mail-workflow.types';
import {
  ProviderWithIcon,
  formatDateRange,
  formatDateTime,
  formatMessages,
  getAccountIdentifierLabel,
  stageDefinitions,
} from './workflow-history.shared';

type Props = {
  history: ManualMailWorkflowHistoryItem | null;
  onClose: () => void;
};

export const WorkflowHistoryDetailModal = (props: Props): JSX.Element | null => {
  const { history, onClose } = props;

  useEffect(() => {
    if (!history) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [history, onClose]);

  if (!history) {
    return null;
  }

  const workflowErrorMessage = history.error_message?.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-history-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Workflow Detail
            </p>
            <div className="space-y-4">
              <h3 id="workflow-history-detail-title" className="text-2xl font-bold text-slate-900">
                履歴詳細
              </h3>

              {workflowErrorMessage ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-red-500" />
                    <div className="space-y-1">
                      <p className="font-semibold">エラーメッセージ</p>
                      <p className="leading-6">{workflowErrorMessage}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <dl className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    実行日時
                  </dt>
                  <dd className="mt-1 text-slate-900">{formatDateTime(history.queued_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    ワークフローID
                  </dt>
                  <dd className="mt-1 break-all font-mono text-sm text-slate-900">
                    {history.workflow_id}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <Button type="button" variant="secondary" fullWidth={false} onClick={onClose}>
            閉じる
          </Button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900">検索条件</h4>

            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  メールサービス
                </dt>
                <dd className="mt-1">
                  <ProviderWithIcon provider={history.provider} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  メールアドレス
                </dt>
                <dd className="mt-1 text-slate-900">
                  {getAccountIdentifierLabel(history.account_identifier)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  ラベル名
                </dt>
                <dd className="mt-1 text-slate-900">{history.label_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  取得期間
                </dt>
                <dd className="mt-1 text-slate-900">
                  {formatDateRange(history.since, history.until)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ステージ</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">成功</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">業務失敗</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">技術失敗</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">メッセージ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {stageDefinitions.map((stageDefinition) => {
                const summary = history[stageDefinition.key];

                return (
                  <tr key={stageDefinition.key} className="align-top">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {stageDefinition.label}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">{summary.success_count}</td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {summary.business_failure_count}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {summary.technical_failure_count}
                    </td>
                    <td className="min-w-64 px-4 py-4 text-slate-700">{formatMessages(summary)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
