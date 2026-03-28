import { useQuery } from '@tanstack/react-query';
import {
  fetchManualMailWorkflowHistories,
  manualMailWorkflowHistoriesQueryKey,
} from '../api/manual-mail-workflow.api';

type Params = {
  limit: number;
  offset: number;
};

export const useManualMailWorkflowHistories = (params: Params) => {
  return useQuery({
    queryKey: [...manualMailWorkflowHistoriesQueryKey, params] as const,
    queryFn: () => fetchManualMailWorkflowHistories(params),
  });
};
