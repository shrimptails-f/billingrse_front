import type {
  ManualMailWorkflowHistoriesResponse,
  ManualMailWorkflowHistoryItem,
  ManualMailWorkflowStageSummary,
} from '../types/manual-mail-workflow.types';

export type MockConnectionOption = {
  value: string;
  label: string;
  provider: string;
  accountIdentifier: string;
};

const createStageSummary = (
  successCount: number,
  businessFailureCount: number,
  technicalFailureCount: number,
  messages: string[] = []
): ManualMailWorkflowStageSummary => {
  return {
    success_count: successCount,
    business_failure_count: businessFailureCount,
    technical_failure_count: technicalFailureCount,
    failures: messages.map((message, index) => ({
      external_message_id: `mock-message-${index + 1}`,
      reason_code: `mock_reason_${index + 1}`,
      message,
      created_at: '2026-04-03T09:00:00Z',
    })),
  };
};

export const mockConnectionOptions: MockConnectionOption[] = [
  {
    value: '1',
    label: 'GMAIL / billing-team@example.com',
    provider: 'gmail',
    accountIdentifier: 'billing-team@example.com',
  },
  {
    value: '2',
    label: 'GMAIL / accounting@example.com',
    provider: 'gmail',
    accountIdentifier: 'accounting@example.com',
  },
];

export const mockManualMailWorkflowHistories: ManualMailWorkflowHistoriesResponse = {
  total_count: 4,
  items: [
    {
      workflow_id: 'wf_mock_20260403_004',
      error_message: null,
      connection_id: 2,
      provider: 'gmail',
      account_identifier: 'accounting@example.com',
      label_name: '請求書',
      since: '2026-04-01T00:00:00+09:00',
      until: '2026-04-03T23:59:59+09:00',
      status: 'running',
      current_stage: 'analysis',
      queued_at: '2026-04-03T08:30:00Z',
      finished_at: null,
      fetch: createStageSummary(12, 0, 0),
      analysis: createStageSummary(7, 1, 0, ['1件は本文に請求対象データが見つかりませんでした。']),
      vendor_resolution: createStageSummary(0, 0, 0),
      billing_eligibility: createStageSummary(0, 0, 0),
      billing: createStageSummary(0, 0, 0),
    },
    {
      workflow_id: 'wf_mock_20260402_003',
      error_message: null,
      connection_id: 1,
      provider: 'gmail',
      account_identifier: 'billing-team@example.com',
      label_name: 'INBOX',
      since: '2026-03-25T00:00:00+09:00',
      until: '2026-03-31T23:59:59+09:00',
      status: 'partial_success',
      current_stage: null,
      queued_at: '2026-04-02T07:10:00Z',
      finished_at: '2026-04-02T07:21:00Z',
      fetch: createStageSummary(18, 0, 0),
      analysis: createStageSummary(16, 1, 1, [
        'AI 解析タイムアウトが 1 件ありました。',
        '請求対象外メールを 1 件スキップしました。',
      ]),
      vendor_resolution: createStageSummary(15, 1, 0, [
        '決済会社を特定できないメールが 1 件ありました。',
      ]),
      billing_eligibility: createStageSummary(14, 1, 0, ['領収書メールのため除外しました。']),
      billing: createStageSummary(14, 0, 0),
    },
    {
      workflow_id: 'wf_mock_20260401_002',
      error_message: null,
      connection_id: 1,
      provider: 'gmail',
      account_identifier: 'billing-team@example.com',
      label_name: '請求',
      since: '2026-03-01T00:00:00+09:00',
      until: '2026-03-31T23:59:59+09:00',
      status: 'succeeded',
      current_stage: null,
      queued_at: '2026-04-01T05:12:00Z',
      finished_at: '2026-04-01T05:26:00Z',
      fetch: createStageSummary(24, 0, 0),
      analysis: createStageSummary(24, 0, 0),
      vendor_resolution: createStageSummary(24, 0, 0),
      billing_eligibility: createStageSummary(19, 5, 0, ['重複メールを 5 件除外しました。']),
      billing: createStageSummary(19, 0, 0),
    },
    {
      workflow_id: 'wf_mock_20260331_001',
      error_message: 'Gmail 側の一時エラーにより取得処理が途中で終了しました。',
      connection_id: 2,
      provider: 'gmail',
      account_identifier: 'accounting@example.com',
      label_name: '経費',
      since: '2026-03-20T00:00:00+09:00',
      until: '2026-03-31T23:59:59+09:00',
      status: 'failed',
      current_stage: 'fetch',
      queued_at: '2026-03-31T11:02:00Z',
      finished_at: '2026-03-31T11:07:00Z',
      fetch: createStageSummary(8, 0, 2, ['2 件のメール取得で API エラーが発生しました。']),
      analysis: createStageSummary(0, 0, 0),
      vendor_resolution: createStageSummary(0, 0, 0),
      billing_eligibility: createStageSummary(0, 0, 0),
      billing: createStageSummary(0, 0, 0),
    },
  ],
};

export const createQueuedMockHistory = (params: {
  connectionId: number;
  accountIdentifier: string;
  labelName: string;
  since: string;
  until: string;
}): ManualMailWorkflowHistoryItem => {
  const now = new Date();

  return {
    workflow_id: `wf_mock_${now.getTime()}`,
    error_message: null,
    connection_id: params.connectionId,
    provider: 'gmail',
    account_identifier: params.accountIdentifier,
    label_name: params.labelName,
    since: `${params.since}T00:00:00+09:00`,
    until: `${params.until}T23:59:59+09:00`,
    status: 'queued',
    current_stage: null,
    queued_at: now.toISOString(),
    finished_at: null,
    fetch: createStageSummary(0, 0, 0),
    analysis: createStageSummary(0, 0, 0),
    vendor_resolution: createStageSummary(0, 0, 0),
    billing_eligibility: createStageSummary(0, 0, 0),
    billing: createStageSummary(0, 0, 0),
  };
};
