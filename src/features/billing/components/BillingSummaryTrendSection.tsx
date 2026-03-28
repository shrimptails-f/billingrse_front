import type { JSX } from 'react';
import {
  calculateBillingBarHeight,
  formatBillingAmount,
  formatBillingShortMonth,
  formatBillingYearMonth,
} from '../lib/billing-summary';
import type {
  BillingCurrency,
  BillingMonthSummary,
  BillingMonthlyTrendItem,
} from '../types/billing-summary.types';

type Props = {
  currency: BillingCurrency;
  items: BillingMonthlyTrendItem[];
  monthlyMax: number;
  selectedMonth: string | null;
  selectedSummary: BillingMonthSummary | null;
  onSelectMonth: (yearMonth: string) => void;
};

export const BillingSummaryTrendSection = ({
  currency,
  items,
  monthlyMax,
  selectedMonth,
  selectedSummary,
  onSelectMonth,
}: Props): JSX.Element => {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-6">
      <div className="space-y-3 border-b border-slate-200/80 pb-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-500">月別請求総額</p>
          {selectedSummary ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900 md:text-xl">
                {formatBillingYearMonth(selectedSummary.year_month)}
              </p>
              <p className="text-base font-semibold text-slate-700 md:text-lg">
                合計 {formatBillingAmount(currency, selectedSummary.total_amount)}
              </p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-slate-900 md:text-xl">月を選択してください</p>
          )}
        </div>
        <p className="text-xs leading-6 text-slate-500">
          棒をクリックするとその月の支払先別請求総額が下部に表示されます。
        </p>
      </div>
      {items.length > 0 ? (
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="mx-auto w-fit space-y-4">
            <div className="hidden md:block">
              <div className="flex w-[39px] justify-center">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-700">
                  {currency}
                </span>
              </div>
            </div>

            <div className="flex w-fit items-end gap-2 md:gap-3">
              {items.map((item) => {
                const isActive = item.year_month === selectedMonth;

                return (
                  <button
                    key={item.year_month}
                    type="button"
                    aria-label={`${formatBillingYearMonth(item.year_month)}を選択`}
                    aria-pressed={isActive}
                    className="flex w-[39px] shrink-0 flex-col items-center gap-2 text-center"
                    onClick={() => onSelectMonth(item.year_month)}
                  >
                    <div
                      className={[
                        'flex h-56 w-full items-end transition',
                        isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'w-full transition-all',
                          isActive
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            : 'bg-gradient-to-t from-slate-500 to-slate-300',
                        ].join(' ')}
                        style={{
                          height: calculateBillingBarHeight(item.total_amount, monthlyMax),
                        }}
                      />
                    </div>
                    <span
                      className={[
                        'text-xs font-semibold',
                        isActive ? 'text-slate-900' : 'text-slate-500',
                      ].join(' ')}
                    >
                      {formatBillingShortMonth(item.year_month)}
                    </span>
                    <span
                      className={[
                        'text-[11px] font-semibold',
                        isActive ? 'text-emerald-600' : 'text-transparent',
                      ].join(' ')}
                    >
                      選択中
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500">
          表示できる月別集計データがありません
        </div>
      )}
    </section>
  );
};
