import type { JSX } from 'react';
import { Button } from '@/shared/ui/primitives/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { InfoTooltip } from '@/shared/ui/primitives/InfoTooltip';
import type { DashboardSummaryResponse } from '../types/dashboard-summary.types';

type Props = {
  summary?: DashboardSummaryResponse;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

const summaryItems: Array<{
  key: keyof DashboardSummaryResponse;
  title: string;
  tooltipLabel?: string;
  tooltipText?: string;
}> = [
  {
    key: 'current_month_analysis_success_count',
    title: '今月の解析成功件数',
  },
  {
    key: 'current_month_fallback_billing_count',
    title: '今月の補完件数',
    tooltipLabel: '今月の補完件数の説明を表示',
    tooltipText: '請求日がメールに無いため、メール受信日で判定した件数',
  },
  {
    key: 'total_saved_billing_count',
    title: '累計保存請求件数',
  },
];

export const DashboardEntryCard = ({
  summary,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: Props): JSX.Element => {
  return (
    <section className="mx-auto max-w-5xl space-y-6 py-2">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Dashboard
            </p>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">解析・保存サマリー</h1>
              <p className="text-sm text-slate-500 md:text-base">
                今月の解析状況と補完状況、保存済み請求の累計状況を確認できます。
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <Spinner
                  size={20}
                  className="text-emerald-600"
                  label="ダッシュボードを読み込み中"
                />
                <div className="space-y-1">
                  <p>解析・保存サマリーを取得しています。</p>
                  <p className="text-xs font-medium text-slate-500">
                    最新の解析件数と請求保存件数を反映しています。
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="rounded-[22px] border border-red-200 bg-red-50/90 p-6 text-red-700 shadow-sm"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">解析・保存サマリーの取得に失敗しました。</h2>
                <p className="text-sm leading-6">{errorMessage}</p>
              </div>
              {onRetry ? (
                <div className="mt-4">
                  <Button type="button" variant="secondary" fullWidth={false} onClick={onRetry}>
                    再読み込み
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {summary ? (
            <dl className="grid divide-y divide-slate-200 border-t border-slate-200 pt-6 md:grid-cols-3 md:divide-x md:divide-y-0">
              {summaryItems.map((item) => (
                <div
                  key={item.key}
                  className="space-y-3 py-5 first:pt-0 last:pb-0 md:px-5 md:py-0 md:first:pl-0 md:last:pr-0"
                >
                  <dt className="flex items-center gap-2 text-sm font-semibold tracking-[0.02em] text-slate-500">
                    <span>{item.title}</span>
                    {item.tooltipLabel && item.tooltipText ? (
                      <InfoTooltip label={item.tooltipLabel} text={item.tooltipText} />
                    ) : null}
                  </dt>
                  <dd className="text-3xl font-bold text-slate-900 md:text-4xl">
                    {summary[item.key].toLocaleString('ja-JP')}件
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
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
