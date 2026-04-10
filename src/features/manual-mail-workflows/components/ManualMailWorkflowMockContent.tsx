import type { JSX } from 'react';
import { useState } from 'react';
import { WorkflowHistoryList } from './WorkflowHistoryList';
import { WorkflowRequestMockForm } from './WorkflowRequestMockForm';
import {
  createQueuedMockHistory,
  mockConnectionOptions,
  mockManualMailWorkflowHistories,
} from '../lib/manual-mail-workflow.mock';
import type { ManualMailWorkflowHistoryItem } from '../types/manual-mail-workflow.types';

const pageSize = 20;

export const ManualMailWorkflowMockContent = (): JSX.Element => {
  const [histories, setHistories] = useState<ManualMailWorkflowHistoryItem[]>(
    mockManualMailWorkflowHistories.items
  );

  return (
    <section className="page-shell page-shell--wide">
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            Manual Mail Workflows
          </p>

          <h1 className="text-3xl font-bold text-slate-900">手動メール取得</h1>
          <div className="max-w-3xl space-y-1 text-sm leading-7 text-slate-600 md:text-base">
            <p>Gmail からメールを取得し、AI 解析を実行したうえで請求情報を保存します。</p>
            <p>メール連携、ラベル、取得期間を指定して実行履歴を確認できます。</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <WorkflowRequestMockForm
          connectionOptions={mockConnectionOptions}
          onSubmit={(values) => {
            setHistories((currentHistories) => [
              createQueuedMockHistory({
                connectionId: Number(values.connectionId),
                accountIdentifier: values.accountIdentifier,
                labelName: values.labelName,
                since: values.since,
                until: values.until,
              }),
              ...currentHistories,
            ]);
          }}
        />

        <WorkflowHistoryList
          currentPage={1}
          histories={{
            items: histories,
            total_count: histories.length,
          }}
          isLoading={false}
          isError={false}
          isFetching={false}
          limit={pageSize}
          onNextPage={() => undefined}
          onPreviousPage={() => undefined}
          onRefetch={async () => undefined}
        />
      </div>
    </section>
  );
};
