import type { JSX } from 'react';
import { Button } from '@/shared/ui/primitives/Button';
import { InfoTooltip } from '@/shared/ui/primitives/InfoTooltip';

export const DashboardEntryCard = (): JSX.Element => {
  const currentMonthAnalysisSuccessCount = 54;
  const totalSavedBillingCount = 321;

  return (
    <section className="mx-auto max-w-5xl space-y-6 py-2">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Dashboard
            </p>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">主要指標</h1>
              <p className="text-sm text-slate-500 md:text-base">
                今月の解析状況と、これまでに保存された請求件数を確認できます。
              </p>
            </div>
          </div>

          <div className="grid divide-y divide-slate-200 border-t border-slate-200 pt-6 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="space-y-3 pb-6 md:pb-0 md:pr-6">
              <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.02em] text-slate-500">
                <span>今月の解析成功件数</span>
                <InfoTooltip
                  label="今月の解析成功件数の説明を表示"
                  text="メール件数ではなく、メール解析結果として判定された請求件数です"
                />
              </p>
              <p className="text-3xl font-bold text-slate-900 md:text-4xl">
                {currentMonthAnalysisSuccessCount.toLocaleString('ja-JP')}件
              </p>
            </div>

            <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
              <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.02em] text-slate-500">
                <span>累計保存請求件数</span>
                <InfoTooltip
                  label="累計保存請求件数の説明を表示"
                  text="重複判定で保存されなかったものを除いた保存済み請求件数です"
                />
              </p>
              <p className="text-3xl font-bold text-slate-900 md:text-4xl">
                {totalSavedBillingCount.toLocaleString('ja-JP')}件
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Billing
              </p>
              <h2 className="text-2xl font-bold text-slate-900">請求集計</h2>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                月別の請求推移と支払先別の内訳を確認します。
              </p>
            </div>

            <Button as="link" to="/billing-summary" fullWidth={false}>
              請求集計を開く
            </Button>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Manual Mail Workflows
              </p>
              <h2 className="text-2xl font-bold text-slate-900">手動メール取得</h2>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                Gmail からメールを取得して解析を実行します。
              </p>
            </div>

            <Button as="link" to="/manual-mail-workflows" fullWidth={false}>
              手動メール取得を開く
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
};
