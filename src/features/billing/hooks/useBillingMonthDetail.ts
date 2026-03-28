import { useQuery } from '@tanstack/react-query';
import { billingMonthDetailQueryKey, fetchBillingMonthDetail } from '../api/billing-summary.api';
import type { BillingCurrency } from '../types/billing-summary.types';

type Params = {
  currency: BillingCurrency;
  yearMonth: string | null;
};

export const useBillingMonthDetail = (params: Params) => {
  return useQuery({
    queryKey: [...billingMonthDetailQueryKey, params] as const,
    queryFn: ({ signal }) => {
      if (!params.yearMonth) {
        throw new Error('yearMonth is required');
      }

      return fetchBillingMonthDetail(params.yearMonth, { currency: params.currency }, signal);
    },
    enabled: params.yearMonth !== null,
  });
};
