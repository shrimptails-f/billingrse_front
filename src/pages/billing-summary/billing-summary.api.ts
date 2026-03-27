import { apiFetch } from '@/shared/api/client';
import type {
  BillingCurrency,
  BillingMonthDetailResponse,
  BillingMonthlyTrendResponse,
} from './billing-summary.types';

type FetchBillingMonthlyTrendParams = {
  currency?: BillingCurrency;
  window_end_month?: string;
};

type FetchBillingMonthDetailParams = {
  currency?: BillingCurrency;
};

export const fetchBillingMonthlyTrend = (
  params: FetchBillingMonthlyTrendParams = {},
  signal?: AbortSignal
): Promise<BillingMonthlyTrendResponse> =>
  apiFetch('GET', '/billings/summary/monthly-trend', {
    query: params,
    signal,
    retryOnUnauthorized: true,
  });

export const fetchBillingMonthDetail = (
  yearMonth: string,
  params: FetchBillingMonthDetailParams = {},
  signal?: AbortSignal
): Promise<BillingMonthDetailResponse> =>
  apiFetch('GET', `/billings/summary/monthly-detail/${yearMonth}`, {
    query: params,
    signal,
    retryOnUnauthorized: true,
  });
