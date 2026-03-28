import type { JSX } from 'react';
import { billingCurrencyOrder } from '../lib/billing-summary';
import type { BillingCurrency } from '../types/billing-summary.types';

type Props = {
  currency: BillingCurrency;
  onCurrencyChange: (nextCurrency: BillingCurrency) => void;
};

export const BillingSummaryHeader = ({ currency, onCurrencyChange }: Props): JSX.Element => {
  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Billing Summary
        </p>
        <h1 className="text-3xl font-bold text-slate-900">請求集計</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          直近12ヶ月の推移と、選択月の支払先別内訳を確認できます。
        </p>
      </div>

      <div className="mt-6">
        <div
          className="inline-flex self-start rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm"
          role="tablist"
          aria-label="通貨タブ"
        >
          {billingCurrencyOrder.map((item) => {
            const isActive = item === currency;

            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-pressed={isActive}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
                onClick={() => onCurrencyChange(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
