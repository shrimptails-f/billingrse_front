import { useQuery } from '@tanstack/react-query';
import { fetchBillingMonthlyTrend } from './billing-summary.api';
import type { BillingCurrency } from './billing-summary.types';

export const billingMonthlyTrendQueryKey = ['billing-summary', 'monthly-trend'] as const;

type Params = {
  currency: BillingCurrency;
  window_end_month?: string;
};

export const useBillingMonthlyTrend = (params: Params) =>
  useQuery({
    queryKey: [...billingMonthlyTrendQueryKey, params] as const,
    queryFn: ({ signal }) => fetchBillingMonthlyTrend(params, signal),
  });
