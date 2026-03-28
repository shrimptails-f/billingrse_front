import type { JSX } from 'react';
import { toFriendlyMessage } from '@/shared/api/errors';
import { Spinner } from '@/shared/ui/Spinner';
import {
  formatBillingAmount,
  formatBillingCount,
  formatBillingYearMonth,
} from '../lib/billing-summary';
import type {
  BillingCurrency,
  BillingMonthDetailResponse,
  BillingMonthSummary,
} from '../types/billing-summary.types';
import { BillingSummaryErrorPanel } from './BillingSummaryErrorPanel';
import { BillingSummaryInfoTooltip } from './BillingSummaryInfoTooltip';

type Props = {
  currency: BillingCurrency;
  selectedSummary: BillingMonthSummary | null;
  detail: BillingMonthDetailResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
};

export const BillingSummaryDetailSection = ({
  currency,
  selectedSummary,
  detail,
  isLoading,
  isError,
  error,
  onRetry,
}: Props): JSX.Element => {
  const vendorItems = detail?.vendor_items ?? [];
  const vendorMax = vendorItems.reduce((max, item) => Math.max(max, item.total_amount), 0);

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          <span className="block">支払先別請求総額</span>
          {selectedSummary ? (
            <span className="mt-1 block text-lg text-slate-700">
              {formatBillingYearMonth(selectedSummary.year_month)}
            </span>
          ) : null}
        </h2>
      </div>

      <div className="mt-6 space-y-6">
        <section className="p-1">
          <dl className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-semibold text-slate-500">合計金額</dt>
              <dd className="text-right text-lg font-bold text-slate-900">
                {formatBillingAmount(currency, selectedSummary?.total_amount ?? 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-semibold text-slate-500">請求件数</dt>
              <dd className="text-right text-lg font-bold text-slate-900">
                {formatBillingCount(selectedSummary?.billing_count ?? 0)}件
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span>補完件数</span>
                <BillingSummaryInfoTooltip
                  label="補完件数の説明を表示"
                  text="請求日がメールに無いため、メール受信日で判定した件数"
                />
              </dt>
              <dd className="text-right text-lg font-bold text-slate-900">
                {formatBillingCount(selectedSummary?.fallback_billing_count ?? 0)}件
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-slate-200/80 pt-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              表示: 上位{detail?.vendor_limit ?? 5}件 + その他 / 並び順: 合計金額が高い順
            </p>
          </div>

          {isLoading && !detail ? (
            <div className="mt-6 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <Spinner size={18} className="text-emerald-600" label="支払先別内訳を読み込み中" />
                支払先別内訳を読み込み中
              </div>
            </div>
          ) : null}

          {isError && !detail ? (
            <div className="mt-6">
              <BillingSummaryErrorPanel
                title="選択月の内訳取得に失敗しました。"
                description={toFriendlyMessage(error)}
                onRetry={onRetry}
              />
            </div>
          ) : null}

          {!isLoading && !isError && detail ? (
            vendorItems.length > 0 ? (
              <div className="mt-6 space-y-4">
                {vendorItems.map((item) => {
                  const width =
                    vendorMax > 0
                      ? Math.max(Math.round((item.total_amount / vendorMax) * 100), 10)
                      : 0;

                  return (
                    <article
                      key={`${detail.year_month}-${item.vendor_name}`}
                      className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span>{item.vendor_name}</span>
                          {item.is_other ? (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                              集約
                            </span>
                          ) : null}
                        </div>
                        <span>{formatBillingAmount(currency, item.total_amount)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>{formatBillingCount(item.billing_count)}件</span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500">
                <p>選択した月の請求はありません</p>
                <p className="mt-1">支払先別内訳を表示できるデータがありません</p>
              </div>
            )
          ) : null}
        </section>
      </div>
    </section>
  );
};
