import { get, post } from '@/shared/api/http';
import type {
  ManualMailWorkflowHistoriesResponse,
  StartManualMailWorkflowRequest,
  StartManualMailWorkflowResponse,
} from '../types/manual-mail-workflow.types';

export const manualMailWorkflowsQueryKey = ['manual-mail-workflows'] as const;
export const manualMailWorkflowHistoriesQueryKey = [
  ...manualMailWorkflowsQueryKey,
  'histories',
] as const;

type FetchManualMailWorkflowHistoriesParams = {
  limit?: number;
  offset?: number;
};

export const startManualMailWorkflow = (
  payload: StartManualMailWorkflowRequest
): Promise<StartManualMailWorkflowResponse> => {
  return post<StartManualMailWorkflowResponse, StartManualMailWorkflowRequest>(
    '/manual-mail-workflows',
    {
      body: payload,
      retryOnUnauthorized: true,
    }
  );
};

export const fetchManualMailWorkflowHistories = (
  params: FetchManualMailWorkflowHistoriesParams = {}
): Promise<ManualMailWorkflowHistoriesResponse> => {
  return get<ManualMailWorkflowHistoriesResponse>('/manual-mail-workflows', {
    query: params,
    retryOnUnauthorized: true,
  });
};
