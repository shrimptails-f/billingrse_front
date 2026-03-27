import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BillingSummaryContent } from './BillingSummaryContent';
import type {
  BillingMonthDetailResponse,
  BillingMonthlyTrendResponse,
} from './billing-summary.types';

const fetchBillingMonthlyTrendMock = vi.fn();
const fetchBillingMonthDetailMock = vi.fn();

vi.mock('./billing-summary.api', () => ({
  fetchBillingMonthlyTrend: (params: unknown, signal?: AbortSignal) =>
    fetchBillingMonthlyTrendMock(params, signal),
  fetchBillingMonthDetail: (yearMonth: string, params: unknown, signal?: AbortSignal) =>
    fetchBillingMonthDetailMock(yearMonth, params, signal),
}));

const jpyTrend: BillingMonthlyTrendResponse = {
  currency: 'JPY',
  window_start_month: '2025-04',
  window_end_month: '2026-03',
  default_selected_month: '2026-03',
  items: [
    { year_month: '2025-04', total_amount: 58000, billing_count: 5, fallback_billing_count: 0 },
    { year_month: '2025-05', total_amount: 64400, billing_count: 6, fallback_billing_count: 1 },
    { year_month: '2025-06', total_amount: 71200, billing_count: 6, fallback_billing_count: 1 },
    { year_month: '2025-07', total_amount: 83600, billing_count: 7, fallback_billing_count: 1 },
    { year_month: '2025-08', total_amount: 76800, billing_count: 7, fallback_billing_count: 2 },
    { year_month: '2025-09', total_amount: 88100, billing_count: 8, fallback_billing_count: 1 },
    { year_month: '2025-10', total_amount: 94300, billing_count: 8, fallback_billing_count: 2 },
    { year_month: '2025-11', total_amount: 109500, billing_count: 9, fallback_billing_count: 1 },
    { year_month: '2025-12', total_amount: 121000, billing_count: 10, fallback_billing_count: 2 },
    { year_month: '2026-01', total_amount: 142800, billing_count: 10, fallback_billing_count: 2 },
    { year_month: '2026-02', total_amount: 168200, billing_count: 11, fallback_billing_count: 2 },
    { year_month: '2026-03', total_amount: 182400, billing_count: 12, fallback_billing_count: 3 },
  ],
};

const usdTrend: BillingMonthlyTrendResponse = {
  currency: 'USD',
  window_start_month: '2025-04',
  window_end_month: '2026-03',
  default_selected_month: '2026-03',
  items: [
    { year_month: '2025-04', total_amount: 310, billing_count: 4, fallback_billing_count: 0 },
    { year_month: '2025-05', total_amount: 352, billing_count: 4, fallback_billing_count: 1 },
    { year_month: '2025-06', total_amount: 401, billing_count: 5, fallback_billing_count: 0 },
    { year_month: '2025-07', total_amount: 438, billing_count: 5, fallback_billing_count: 1 },
    { year_month: '2025-08', total_amount: 420, billing_count: 5, fallback_billing_count: 1 },
    { year_month: '2025-09', total_amount: 508, billing_count: 6, fallback_billing_count: 1 },
    { year_month: '2025-10', total_amount: 561, billing_count: 6, fallback_billing_count: 1 },
    { year_month: '2025-11', total_amount: 603, billing_count: 7, fallback_billing_count: 1 },
    { year_month: '2025-12', total_amount: 644, billing_count: 7, fallback_billing_count: 2 },
    { year_month: '2026-01', total_amount: 718, billing_count: 8, fallback_billing_count: 1 },
    { year_month: '2026-02', total_amount: 812, billing_count: 8, fallback_billing_count: 1 },
    { year_month: '2026-03', total_amount: 1126, billing_count: 9, fallback_billing_count: 2 },
  ],
};

const jpyMarchDetail: BillingMonthDetailResponse = {
  year_month: '2026-03',
  currency: 'JPY',
  total_amount: 182400,
  billing_count: 12,
  fallback_billing_count: 3,
  vendor_limit: 5,
  vendor_items: [
    { vendor_name: 'AWS', total_amount: 82000, billing_count: 4, is_other: false },
    {
      vendor_name: 'Google Workspace',
      total_amount: 36000,
      billing_count: 2,
      is_other: false,
    },
    { vendor_name: 'OpenAI', total_amount: 24000, billing_count: 2, is_other: false },
    { vendor_name: 'Notion', total_amount: 15000, billing_count: 1, is_other: false },
    { vendor_name: 'GitHub', total_amount: 11200, billing_count: 1, is_other: false },
    { vendor_name: 'その他', total_amount: 14200, billing_count: 2, is_other: true },
  ],
};

const jpyNovemberDetail: BillingMonthDetailResponse = {
  year_month: '2025-11',
  currency: 'JPY',
  total_amount: 109500,
  billing_count: 9,
  fallback_billing_count: 1,
  vendor_limit: 5,
  vendor_items: [
    { vendor_name: 'AWS', total_amount: 41000, billing_count: 3, is_other: false },
    {
      vendor_name: 'Google Workspace',
      total_amount: 26000,
      billing_count: 2,
      is_other: false,
    },
    { vendor_name: 'OpenAI', total_amount: 17000, billing_count: 1, is_other: false },
    { vendor_name: 'Notion', total_amount: 13500, billing_count: 1, is_other: false },
    { vendor_name: 'GitHub', total_amount: 7000, billing_count: 1, is_other: false },
    { vendor_name: 'その他', total_amount: 5000, billing_count: 1, is_other: true },
  ],
};

const usdMarchDetail: BillingMonthDetailResponse = {
  year_month: '2026-03',
  currency: 'USD',
  total_amount: 1126,
  billing_count: 9,
  fallback_billing_count: 2,
  vendor_limit: 5,
  vendor_items: [
    { vendor_name: 'OpenAI API', total_amount: 496, billing_count: 3, is_other: false },
    { vendor_name: 'AWS', total_amount: 203, billing_count: 2, is_other: false },
    { vendor_name: 'Google Workspace', total_amount: 168, billing_count: 1, is_other: false },
    { vendor_name: 'Vercel', total_amount: 101, billing_count: 1, is_other: false },
    { vendor_name: 'GitHub', total_amount: 79, billing_count: 1, is_other: false },
    { vendor_name: 'その他', total_amount: 79, billing_count: 1, is_other: true },
  ],
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

  Wrapper.displayName = 'BillingSummaryContentTestWrapper';

  return Wrapper;
};

describe('BillingSummaryContent', () => {
  beforeEach(() => {
    fetchBillingMonthlyTrendMock.mockReset();
    fetchBillingMonthDetailMock.mockReset();

    fetchBillingMonthlyTrendMock.mockImplementation((params?: { currency?: 'JPY' | 'USD' }) => {
      if (params?.currency === 'USD') {
        return Promise.resolve(usdTrend);
      }

      return Promise.resolve(jpyTrend);
    });

    fetchBillingMonthDetailMock.mockImplementation(
      (yearMonth: string, params?: { currency?: 'JPY' | 'USD' }) => {
        if (params?.currency === 'USD' && yearMonth === '2026-03') {
          return Promise.resolve(usdMarchDetail);
        }

        if (yearMonth === '2025-11') {
          return Promise.resolve(jpyNovemberDetail);
        }

        return Promise.resolve(jpyMarchDetail);
      }
    );
  });

  it('renders the monthly trend and selected month detail with JPY selected by default', async () => {
    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    expect(await screen.findByRole('heading', { name: '請求集計' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('合計 ￥182,400')).toBeInTheDocument());

    expect(screen.getByRole('tab', { name: 'JPY' })).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText('棒をクリックするとその月の支払先別請求総額が下部に表示されます。')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('月の判定: 請求日を優先し、未設定時は受信日時を使用')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('対象期間: 2025年4月 - 2026年3月')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '支払先別請求総額 2026年3月' })).toBeInTheDocument();
    expect(screen.getByText('合計金額')).toBeInTheDocument();
    expect(screen.getByText('請求件数')).toBeInTheDocument();
    expect(screen.getByText('補完件数')).toBeInTheDocument();
    expect(screen.queryByText('対象月に判定された請求数')).not.toBeInTheDocument();
    expect(
      screen.queryByText('請求日がメールに無いため、メール受信日で判定した件数')
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('合計 ￥182,400')).toHaveLength(1);
    await waitFor(() => expect(screen.getByText('AWS')).toBeInTheDocument());
    expect(fetchBillingMonthlyTrendMock).toHaveBeenCalledWith(
      { currency: 'JPY' },
      expect.any(AbortSignal)
    );
    expect(fetchBillingMonthDetailMock).toHaveBeenCalledWith(
      '2026-03',
      { currency: 'JPY' },
      expect.any(AbortSignal)
    );
  });

  it('switches the billing summary when the currency tab changes', async () => {
    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('合計 ￥182,400')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: 'USD' }));

    await waitFor(() => expect(screen.getByText('合計 $1,126')).toBeInTheDocument());

    expect(screen.getByRole('tab', { name: 'USD' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('$1,126')).toBeInTheDocument();
    expect(fetchBillingMonthDetailMock).toHaveBeenCalledWith(
      '2026-03',
      { currency: 'USD' },
      expect.any(AbortSignal)
    );
  });

  it('updates the selected month detail when a month bar is clicked', async () => {
    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('合計 ￥182,400')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '2025年11月を選択' }));

    await waitFor(() => expect(screen.getByText('合計 ￥109,500')).toBeInTheDocument());

    expect(
      screen.getByRole('heading', { name: '支払先別請求総額 2025年11月' })
    ).toBeInTheDocument();
    expect(fetchBillingMonthDetailMock).toHaveBeenCalledWith(
      '2025-11',
      { currency: 'JPY' },
      expect.any(AbortSignal)
    );
  });

  it('shows the fallback-count tooltip on click', async () => {
    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '支払先別請求総額 2026年3月' })
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: '補完件数の説明を表示' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      '請求日がメールに無いため、メール受信日で判定した件数'
    );
  });

  it('renders a zero-height month bar when the monthly total is zero', async () => {
    const zeroTrend: BillingMonthlyTrendResponse = {
      ...jpyTrend,
      items: jpyTrend.items.map((item, index) =>
        index === 0 ? { ...item, total_amount: 0 } : item
      ),
    };

    fetchBillingMonthlyTrendMock.mockReset();
    fetchBillingMonthDetailMock.mockReset();
    fetchBillingMonthlyTrendMock.mockResolvedValueOnce(zeroTrend);
    fetchBillingMonthDetailMock.mockResolvedValueOnce(jpyMarchDetail);

    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    await waitFor(() => expect(screen.getByText('合計 ￥182,400')).toBeInTheDocument());

    const aprilButton = screen.getByRole('button', { name: '2025年4月を選択' });
    const aprilBar = aprilButton.querySelector('[style]');

    expect(aprilBar).not.toBeNull();
    expect(aprilBar).toHaveStyle({ height: '0%' });
  });

  it('shows an error panel and retries when the monthly trend fetch fails', async () => {
    fetchBillingMonthlyTrendMock.mockReset();
    fetchBillingMonthDetailMock.mockReset();

    fetchBillingMonthlyTrendMock
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValueOnce(jpyTrend);
    fetchBillingMonthDetailMock.mockResolvedValueOnce(jpyMarchDetail);

    render(<BillingSummaryContent />, { wrapper: createWrapper() });

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('月別請求の集計取得に失敗しました。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '支払先別請求総額 2026年3月' })
      ).toBeInTheDocument()
    );
  });
});
