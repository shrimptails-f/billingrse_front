import type { JSX } from 'react';

export const HomePage = (): JSX.Element => {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Dashboard
      </p>
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-sm leading-6 text-slate-600">
        認証済みユーザー向けの screen は feature ごとに分け、router 側では guard と layout
        だけを扱います。
      </p>
    </section>
  );
};
