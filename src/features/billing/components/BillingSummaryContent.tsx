import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authSessionQueryKey } from '@/features/auth/api/auth.api';
import { ApiError } from '@/shared/api/client';
import { toFriendlyMessage } from '@/shared/api/errors';
import { clearAuthToken } from '@/shared/auth/token';
import type {
  BillingMonthDetailResponse,
  BillingMonthSummary,
  BillingMonthlyTrendItem,
} from '../types/billing-summary.types';
import { useBillingMonthDetail } from '../hooks/useBillingMonthDetail';
import { useBillingMonthlyTrend } from '../hooks/useBillingMonthlyTrend';
import { BillingSummaryDetailSection } from './BillingSummaryDetailSection';
import { BillingSummaryErrorPanel } from './BillingSummaryErrorPanel';
import { BillingSummaryHeader } from './BillingSummaryHeader';
import { BillingSummaryLoadingPanel } from './BillingSummaryLoadingPanel';
import { BillingSummaryTrendSection } from './BillingSummaryTrendSection';

const getSelectedSummary = (
  selectedTrendItem: BillingMonthlyTrendItem | null,
  detail: BillingMonthDetailResponse | undefined
): BillingMonthSummary | null => {
  if (selectedTrendItem) {
    return {
      year_month: detail?.year_month ?? selectedTrendItem.year_month,
      total_amount: detail?.total_amount ?? selectedTrendItem.total_amount,
      billing_count: detail?.billing_count ?? selectedTrendItem.billing_count,
      fallback_billing_count:
        detail?.fallback_billing_count ?? selectedTrendItem.fallback_billing_count,
    };
  }

  if (detail) {
    return {
      year_month: detail.year_month,
      total_amount: detail.total_amount,
      billing_count: detail.billing_count,
      fallback_billing_count: detail.fallback_billing_count,
    };
  }

  return null;
};

export const BillingSummaryContent = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState<'JPY' | 'USD'>('JPY');
  const [selectedMonthOverride, setSelectedMonthOverride] = useState<string | null>(null);
  const trendQuery = useBillingMonthlyTrend({ currency });
  const availableMonths = trendQuery.data?.items.map((item) => item.year_month) ?? [];
  const selectedMonth =
    selectedMonthOverride && availableMonths.includes(selectedMonthOverride)
      ? selectedMonthOverride
      : (trendQuery.data?.default_selected_month ?? null);
  const selectedTrendItem =
    trendQuery.data?.items.find((item) => item.year_month === selectedMonth) ?? null;
  const detailQuery = useBillingMonthDetail({
    currency,
    yearMonth: selectedMonth,
  });
  const isTrendUnauthorized =
    trendQuery.error instanceof ApiError && trendQuery.error.status === 401;
  const isDetailUnauthorized =
    detailQuery.error instanceof ApiError && detailQuery.error.status === 401;
  const selectedSummary = getSelectedSummary(selectedTrendItem, detailQuery.data);
  const monthlyMax =
    trendQuery.data?.items.reduce((max, item) => Math.max(max, item.total_amount), 0) ?? 0;

  useEffect(() => {
    if (!isTrendUnauthorized && !isDetailUnauthorized) {
      return;
    }

    clearAuthToken();
    queryClient.removeQueries({ queryKey: authSessionQueryKey });
    navigate('/login', { replace: true });
  }, [isDetailUnauthorized, isTrendUnauthorized, navigate, queryClient]);

  return (
    <section className="page-shell page-shell--wide space-y-6">
      <BillingSummaryHeader
        currency={currency}
        onCurrencyChange={(nextCurrency) => {
          setCurrency(nextCurrency);
          setSelectedMonthOverride(null);
        }}
      />

      {trendQuery.isLoading && !trendQuery.data ? (
        <BillingSummaryLoadingPanel
          label="請求集計を読み込み中"
          description="直近12ヶ月の推移と選択月内訳を取得しています。"
        />
      ) : null}

      {trendQuery.isError && !trendQuery.data ? (
        <BillingSummaryErrorPanel
          title="月別請求の集計取得に失敗しました。"
          description={toFriendlyMessage(trendQuery.error)}
          onRetry={() => void trendQuery.refetch()}
        />
      ) : null}

      {trendQuery.data ? (
        <div className="space-y-6">
          <BillingSummaryTrendSection
            currency={currency}
            items={trendQuery.data.items}
            monthlyMax={monthlyMax}
            selectedMonth={selectedMonth}
            selectedSummary={selectedSummary}
            onSelectMonth={(yearMonth) => {
              setSelectedMonthOverride(yearMonth);
            }}
          />

          <BillingSummaryDetailSection
            currency={currency}
            selectedSummary={selectedSummary}
            detail={detailQuery.data}
            isLoading={detailQuery.isLoading}
            isError={detailQuery.isError}
            error={detailQuery.error}
            onRetry={() => void detailQuery.refetch()}
          />
        </div>
      ) : null}
    </section>
  );
};
