import type { JSX } from 'react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authSessionQueryKey } from '@/features/auth/api/auth.api';
import { ApiError } from '@/shared/api/client';
import { toFriendlyMessage } from '@/shared/api/errors';
import { clearAuthToken } from '@/shared/auth/token';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { DashboardEntryCard } from './DashboardEntryCard';

export const DashboardContent = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const summaryQuery = useDashboardSummary();
  const isUnauthorized =
    summaryQuery.error instanceof ApiError && summaryQuery.error.status === 401;

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

    clearAuthToken();
    queryClient.removeQueries({ queryKey: authSessionQueryKey });
    navigate('/login');
  }, [isUnauthorized, navigate, queryClient]);

  return (
    <DashboardEntryCard
      summary={summaryQuery.data}
      isLoading={summaryQuery.isLoading && !summaryQuery.data}
      errorMessage={
        summaryQuery.isError && !summaryQuery.data ? toFriendlyMessage(summaryQuery.error) : null
      }
      onRetry={() => void summaryQuery.refetch()}
    />
  );
};
