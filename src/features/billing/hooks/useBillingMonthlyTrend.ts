import { useQuery } from '@tanstack/react-query';
import { billingMonthlyTrendQueryKey, fetchBillingMonthlyTrend } from '../api/billing-summary.api';
import type { BillingCurrency } from '../types/billing-summary.types';

type Params = {
  currency: BillingCurrency;
  window_end_month?: string;
};

export const useBillingMonthlyTrend = (params: Params) => {
  return useQuery({
    queryKey: [...billingMonthlyTrendQueryKey, params] as const,
    queryFn: ({ signal }) => fetchBillingMonthlyTrend(params, signal),
  });
};
