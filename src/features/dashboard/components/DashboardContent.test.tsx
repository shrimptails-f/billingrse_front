import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/client';
import { DashboardContent } from './DashboardContent';
import type { DashboardSummaryResponse } from '../types/dashboard-summary.types';

const fetchDashboardSummaryMock = vi.fn();

vi.mock('../api/dashboard-summary.api', () => ({
  dashboardSummaryQueryKey: ['dashboard', 'summary'],
  fetchDashboardSummary: (signal?: AbortSignal) => fetchDashboardSummaryMock(signal),
}));

const summaryResponse: DashboardSummaryResponse = {
  current_month_analysis_success_count: 1280,
  current_month_fallback_billing_count: 96,
  total_saved_billing_count: 842,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );

  Wrapper.displayName = 'DashboardContentTestWrapper';

  return Wrapper;
};

describe('DashboardContent', () => {
  beforeEach(() => {
    fetchDashboardSummaryMock.mockReset();
  });

  it('renders dashboard summary after fetching', async () => {
    fetchDashboardSummaryMock.mockResolvedValue(summaryResponse);

    render(<DashboardContent />, { wrapper: createWrapper() });

    expect(screen.getByText('解析・保存サマリーを取得しています。')).toBeInTheDocument();
    expect(await screen.findByText('1,280件')).toBeInTheDocument();
    expect(screen.getByText('96件')).toBeInTheDocument();
    expect(screen.getByText('842件')).toBeInTheDocument();
    expect(fetchDashboardSummaryMock).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('shows an error panel and retries the request', async () => {
    fetchDashboardSummaryMock
      .mockRejectedValueOnce(new ApiError({ status: 500 }))
      .mockResolvedValueOnce(summaryResponse);

    render(<DashboardContent />, { wrapper: createWrapper() });

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('解析・保存サマリーの取得に失敗しました。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    await waitFor(() => expect(screen.getByText('1,280件')).toBeInTheDocument());
    expect(fetchDashboardSummaryMock).toHaveBeenCalledTimes(2);
  });
});
