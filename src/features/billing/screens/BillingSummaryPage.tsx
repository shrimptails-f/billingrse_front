import type { JSX } from 'react';

export const BillingSummaryPage = (): JSX.Element => {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Billing</p>
      <h1 className="text-2xl font-bold text-slate-900">Billing Summary</h1>
      <p className="text-sm leading-6 text-slate-600">
        請求関連 screen の入口は `features/billing/screens` に置くべきです。
      </p>
    </section>
  );
};
