import type { JSX } from 'react';
import { useState } from 'react';
import { BillingSummaryDetailSection } from './BillingSummaryDetailSection';
import { BillingSummaryHeader } from './BillingSummaryHeader';
import { BillingSummaryTrendSection } from './BillingSummaryTrendSection';
import {
  getMockBillingMonthDetail,
  mockBillingMonthlyTrendByCurrency,
} from '../lib/billing-summary.mock';
import type { BillingCurrency } from '../types/billing-summary.types';

export const BillingSummaryMockContent = (): JSX.Element => {
  const [currency, setCurrency] = useState<BillingCurrency>('JPY');
  const [selectedMonthOverride, setSelectedMonthOverride] = useState<string | null>(null);
  const trend = mockBillingMonthlyTrendByCurrency[currency];
  const availableMonths = trend.items.map((item) => item.year_month);
  const selectedMonth =
    selectedMonthOverride && availableMonths.includes(selectedMonthOverride)
      ? selectedMonthOverride
      : trend.default_selected_month;
  const detail = getMockBillingMonthDetail(currency, selectedMonth);
  const selectedSummary =
    trend.items.find((item) => item.year_month === selectedMonth) ?? detail ?? null;
  const monthlyMax = trend.items.reduce((max, item) => Math.max(max, item.total_amount), 0);

  return (
    <section className="page-shell page-shell--wide space-y-6">
      <BillingSummaryHeader
        currency={currency}
        onCurrencyChange={(nextCurrency) => {
          setCurrency(nextCurrency);
          setSelectedMonthOverride(null);
        }}
      />

      <div className="space-y-6">
        <BillingSummaryTrendSection
          currency={currency}
          items={trend.items}
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
          detail={detail}
          isLoading={false}
          isError={false}
          error={null}
          onRetry={() => undefined}
        />
      </div>
    </section>
  );
};
