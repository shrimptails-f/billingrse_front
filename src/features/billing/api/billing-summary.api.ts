import { get } from '@/shared/api/http';
import type {
  BillingCurrency,
  BillingMonthDetailResponse,
  BillingMonthlyTrendResponse,
} from '../types/billing-summary.types';

export const billingMonthlyTrendQueryKey = ['billing-summary', 'monthly-trend'] as const;
export const billingMonthDetailQueryKey = ['billing-summary', 'monthly-detail'] as const;

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
): Promise<BillingMonthlyTrendResponse> => {
  return get<BillingMonthlyTrendResponse>('/billings/summary/monthly-trend', {
    query: params,
    signal,
    retryOnUnauthorized: true,
  });
};

export const fetchBillingMonthDetail = (
  yearMonth: string,
  params: FetchBillingMonthDetailParams = {},
  signal?: AbortSignal
): Promise<BillingMonthDetailResponse> => {
  return get<BillingMonthDetailResponse>(`/billings/summary/monthly-detail/${yearMonth}`, {
    query: params,
    signal,
    retryOnUnauthorized: true,
  });
};
