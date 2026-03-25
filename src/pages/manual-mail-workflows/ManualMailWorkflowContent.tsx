import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageIntroCard } from '@/components/ui/PageIntroCard';
import { authSessionQueryKey } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { clearAuthToken } from '@/lib/auth/token';
import { WorkflowRequestForm } from './execution-conditions/WorkflowRequestForm';
import { WorkflowHistoryList } from './execution-history/WorkflowHistoryList';
import { useManualMailWorkflowHistories } from './useManualMailWorkflowHistories';

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
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (historyQuery.error instanceof ApiError && historyQuery.error.status === 401) {
      handleUnauthorized();
    }
  }, [historyQuery.error]);

  return (
    <section className="page-shell page-shell--wide">
      <PageIntroCard
        className="mb-6"
        eyebrow="Manual Mail Workflows"
        title="手動メール取得"
        description={
          <>
            入力された条件に基づき、メールを取得し、AIによる解析を実施したうえで請求情報を保存します。
            <br />
            AI解析を利用しているため、同一条件であっても結果が都度変動する可能性があります。
            <br />
            本機能は参考用途を前提とした機能です。正式な業務判断には利用しないでください。
            <br />
            また、個人情報等を含む内容がAIに送信・処理される可能性がある点をご理解のうえご利用ください。
          </>
        }
      />

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
