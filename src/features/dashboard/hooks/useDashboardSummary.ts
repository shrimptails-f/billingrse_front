import { useQuery } from '@tanstack/react-query';
import { dashboardSummaryQueryKey, fetchDashboardSummary } from '../api/dashboard-summary.api';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardSummaryQueryKey,
    queryFn: ({ signal }) => fetchDashboardSummary(signal),
  });
};
