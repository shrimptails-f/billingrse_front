import { useEffect, useState, type JSX } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/primitives/Button';
import type {
  ManualMailWorkflowHistoriesResponse,
  ManualMailWorkflowHistoryItem,
} from '../manual-mail-workflow.types';
import { WorkflowHistoryDetailModal } from './WorkflowHistoryDetailModal';
import {
  formatDateTime,
  getAccountIdentifierLabel,
  getCurrentStageLabel,
  getStatusClassName,
  getStatusLabel,
} from './workflow-history.shared';

type Props = {
  currentPage: number;
  histories: ManualMailWorkflowHistoriesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  limit: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRefetch: () => Promise<unknown>;
};

const panelClassName =
  'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8';

export const WorkflowHistoryList = (props: Props): JSX.Element => {
  const {
    currentPage,
    histories,
    isLoading,
    isError,
    isFetching,
    limit,
    onNextPage,
    onPreviousPage,
    onRefetch,
  } = props;
  const [selectedHistory, setSelectedHistory] = useState<ManualMailWorkflowHistoryItem | null>(
    null
  );
  const totalCount = histories?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  useEffect(() => {
    setSelectedHistory(null);
  }, [currentPage]);

  return (
    <>
      <section className={panelClassName} aria-live="polite">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Workflow Histories
            </p>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">実行履歴</h2>
              <p className="text-sm leading-7 text-slate-600">
                手動メール取得の実行履歴を表示します。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isFetching && !isLoading ? (
              <span className="text-xs font-semibold tracking-[0.16em] text-slate-500">更新中</span>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={() => void onRefetch()}
            >
              再取得
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <Spinner size={18} label="履歴一覧を読み込み中" />
            履歴一覧を読み込み中です。
          </div>
        ) : null}

        {isError ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-700"
          >
            履歴一覧の取得に失敗しました。再取得しても改善しない場合は時間をおいて再度お試しください。
          </div>
        ) : null}

        {!isLoading && !isError && histories && histories.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center text-sm text-slate-500">
            まだ履歴はありません。解析実行後にここへ最新の受付状況が表示されます。
          </div>
        ) : null}

        {!isLoading && !isError && histories && histories.items.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>総件数: {histories.total_count}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  disabled={!canGoPrevious}
                  onClick={onPreviousPage}
                >
                  前へ
                </Button>
                <span className="min-w-20 text-center text-xs font-semibold text-slate-600">
                  {currentPage} / {totalPages} ページ
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  disabled={!canGoNext}
                  onClick={onNextPage}
                >
                  次へ
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                      受付日時
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                      メールアドレス
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                      ステータス
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                      現在ステージ
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {histories.items.map((history) => (
                    <tr key={history.workflow_id}>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {formatDateTime(history.queued_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {getAccountIdentifierLabel(history.account_identifier)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                            getStatusClassName(history.status),
                          ].join(' ')}
                        >
                          {getStatusLabel(history.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                        {getCurrentStageLabel(history)}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          type="button"
                          variant="secondary"
                          fullWidth={false}
                          className="px-3 py-2 text-xs"
                          onClick={() => {
                            setSelectedHistory(history);
                          }}
                        >
                          詳細
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <WorkflowHistoryDetailModal
        history={selectedHistory}
        onClose={() => {
          setSelectedHistory(null);
        }}
      />
    </>
  );
};
