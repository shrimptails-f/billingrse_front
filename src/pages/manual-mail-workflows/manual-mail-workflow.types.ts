export type ManualMailWorkflowStatusValue =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'partial_success'
  | 'failed';

export type ManualMailWorkflowStageKey =
  | 'fetch'
  | 'analysis'
  | 'vendor_resolution'
  | 'billing_eligibility'
  | 'billing';

export type StartManualMailWorkflowRequest = {
  connection_id: number;
  label_name: string;
  since: string;
  until: string;
};

export type StartManualMailWorkflowResponse = {
  message: string;
  workflow_id: string;
  status: ManualMailWorkflowStatusValue;
};

export type ManualMailWorkflowStageFailure = {
  external_message_id: string | null;
  reason_code: string;
  message: string;
  created_at: string;
};

export type ManualMailWorkflowStageSummary = {
  success_count: number;
  business_failure_count: number;
  technical_failure_count: number;
  failures: ManualMailWorkflowStageFailure[];
};

export type ManualMailWorkflowHistoryItem = {
  workflow_id: string;
  connection_id: number;
  provider?: string | null;
  account_identifier?: string | null;
  label_name: string;
  since: string;
  until: string;
  status: ManualMailWorkflowStatusValue;
  current_stage: ManualMailWorkflowStageKey | null;
  queued_at: string;
  finished_at: string | null;
  fetch: ManualMailWorkflowStageSummary;
  analysis: ManualMailWorkflowStageSummary;
  vendor_resolution: ManualMailWorkflowStageSummary;
  billing_eligibility: ManualMailWorkflowStageSummary;
  billing: ManualMailWorkflowStageSummary;
};

export type ManualMailWorkflowHistoriesResponse = {
  items: ManualMailWorkflowHistoryItem[];
  total_count: number;
};
