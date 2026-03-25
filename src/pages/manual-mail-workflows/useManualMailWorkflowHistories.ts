import { useQuery } from '@tanstack/react-query';
import { fetchManualMailWorkflowHistories } from './manual-mail-workflow.api';

export const manualMailWorkflowHistoriesQueryKey = ['manual-mail-workflows', 'histories'] as const;

type Params = {
  limit: number;
  offset: number;
};

export const useManualMailWorkflowHistories = (params: Params) =>
  useQuery({
    queryKey: [...manualMailWorkflowHistoriesQueryKey, params] as const,
    queryFn: () => fetchManualMailWorkflowHistories(params),
  });
