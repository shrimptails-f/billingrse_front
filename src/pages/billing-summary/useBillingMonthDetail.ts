import { useQuery } from '@tanstack/react-query';
import { fetchBillingMonthDetail } from './billing-summary.api';
import type { BillingCurrency } from './billing-summary.types';

export const billingMonthDetailQueryKey = ['billing-summary', 'monthly-detail'] as const;

type Params = {
  currency: BillingCurrency;
  yearMonth: string | null;
};

export const useBillingMonthDetail = (params: Params) =>
  useQuery({
    queryKey: [...billingMonthDetailQueryKey, params] as const,
    queryFn: ({ signal }) => {
      if (!params.yearMonth) {
        throw new Error('yearMonth is required');
      }

      return fetchBillingMonthDetail(params.yearMonth, { currency: params.currency }, signal);
    },
    enabled: params.yearMonth !== null,
  });
