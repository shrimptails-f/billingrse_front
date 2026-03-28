import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authSessionQueryKey } from '@/features/auth/api/auth.api';
import { clearAuthToken } from '@/shared/auth/token';
import { ApiError } from '@/shared/api/client';
import { WorkflowRequestForm } from './WorkflowRequestForm';
import { WorkflowHistoryList } from './WorkflowHistoryList';
import { useManualMailWorkflowHistories } from '../hooks/useManualMailWorkflowHistories';

const pageSize = 20;

export const ManualMailWorkflowContent = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const historyQuery = useManualMailWorkflowHistories({
    limit: pageSize,
    offset,
  });
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalCount = historyQuery.data?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (totalCount === 0 && offset !== 0) {
      setOffset(0);
      return;
    }

    if (totalCount > 0 && offset >= totalCount) {
      setOffset((totalPages - 1) * pageSize);
    }
  }, [offset, totalCount, totalPages]);

  const handleUnauthorized = (): void => {
    clearAuthToken();
    queryClient.removeQueries({ queryKey: authSessionQueryKey });
    navigate('/login');
  };

  useEffect(() => {
    if (historyQuery.error instanceof ApiError && historyQuery.error.status === 401) {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
      navigate('/login');
    }
  }, [historyQuery.error, navigate, queryClient]);

  return (
    <section className="page-shell page-shell--wide">
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            Manual Mail Workflows
          </p>
          <h1 className="text-3xl font-bold text-slate-900">手動メール取得</h1>
          <div className="max-w-3xl space-y-1 text-sm leading-7 text-slate-600 md:text-base">
            <p>
              入力された条件に基づき、メールを取得し、AI
              による解析を実施したうえで請求情報を保存します。
            </p>
            <p>AI 解析を利用しているため、同一条件であっても結果が都度変動する可能性があります。</p>
            <p>本機能は参考用途を前提とした機能です。正式な業務判断には利用しないでください。</p>
            <p>
              また、個人情報等を含む内容が AI
              に送信・処理される可能性がある点をご理解のうえご利用ください。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <WorkflowRequestForm
          onUnauthorized={handleUnauthorized}
          onWorkflowAccepted={async () => {
            if (offset === 0) {
              await historyQuery.refetch();
              return;
            }

            setOffset(0);
          }}
        />
        <WorkflowHistoryList
          currentPage={currentPage}
          histories={historyQuery.data}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
          isFetching={historyQuery.isFetching}
          limit={pageSize}
          onNextPage={() => {
            if (currentPage < totalPages) {
              setOffset((currentOffset) => currentOffset + pageSize);
            }
          }}
          onPreviousPage={() => {
            if (currentPage > 1) {
              setOffset((currentOffset) => Math.max(0, currentOffset - pageSize));
            }
          }}
          onRefetch={historyQuery.refetch}
        />
      </div>
    </section>
  );
};
