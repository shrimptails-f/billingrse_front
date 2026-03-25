import { apiFetch } from '@/lib/api/client';
import type {
  ManualMailWorkflowHistoriesResponse,
  StartManualMailWorkflowRequest,
  StartManualMailWorkflowResponse,
} from './manual-mail-workflow.types';

export const startManualMailWorkflow = (
  payload: StartManualMailWorkflowRequest
): Promise<StartManualMailWorkflowResponse> =>
  apiFetch('POST', '/manual-mail-workflows', {
    body: payload,
    retryOnUnauthorized: true,
  });

type FetchManualMailWorkflowHistoriesParams = {
  limit?: number;
  offset?: number;
};

export const fetchManualMailWorkflowHistories = (
  params: FetchManualMailWorkflowHistoriesParams = {}
): Promise<ManualMailWorkflowHistoriesResponse> =>
  apiFetch('GET', '/manual-mail-workflows', {
    query: params,
    retryOnUnauthorized: true,
  });
