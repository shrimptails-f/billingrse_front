import { get } from '@/shared/api/http';
import type { DashboardSummaryResponse } from '../types/dashboard-summary.types';

export const dashboardSummaryQueryKey = ['dashboard', 'summary'] as const;

export const fetchDashboardSummary = (signal?: AbortSignal): Promise<DashboardSummaryResponse> => {
  return get<DashboardSummaryResponse>('/dashboard/summary', {
    signal,
    retryOnUnauthorized: true,
  });
};
