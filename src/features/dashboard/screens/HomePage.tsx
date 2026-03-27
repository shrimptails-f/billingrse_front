import type { JSX } from 'react';

export const HomePage = (): JSX.Element => {
  return (
    <section className="min-h-[1800px] space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Dashboard
      </p>
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-sm leading-6 text-slate-600">
        認証済みユーザー向けの screen は feature ごとに分け、router 側では guard と layout
        だけを扱います。
      </p>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm leading-6 text-slate-600">
            固定ヘッダーの追従確認用に、ダッシュボードのカードを縦長にしています。
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm leading-6 text-slate-600">
            スクロールしてもヘッダーが上部に残り、コンテンツとの間に一定の余白がある状態を確認できます。
          </p>
        </div>
      </div>
    </section>
  );
};
