import type { JSX } from 'react';
import { useEffect, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageIntroCard } from '@/components/ui/PageIntroCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/primitives/Button';
import { toFriendlyMessage } from '@/lib/api/errors';
import { authSessionQueryKey } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { clearAuthToken } from '@/lib/auth/token';
import type {
  BillingCurrency,
  BillingMonthDetailVendorItem,
  BillingMonthlyTrendItem,
} from './billing-summary.types';
import { useBillingMonthDetail } from './useBillingMonthDetail';
import { useBillingMonthlyTrend } from './useBillingMonthlyTrend';

type ErrorPanelProps = {
  title: string;
  description: string;
  onRetry: () => void;
};

type LoadingPanelProps = {
  label: string;
  description: string;
};

const currencyOrder: BillingCurrency[] = ['JPY', 'USD'];

const countFormatter = new Intl.NumberFormat('ja-JP');
const jpyAmountFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});
const usdAmountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatAmount = (currency: BillingCurrency, amount: number): string =>
  currency === 'JPY' ? jpyAmountFormatter.format(amount) : usdAmountFormatter.format(amount);

const formatCount = (count: number): string => countFormatter.format(count);

const formatYearMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  return `${year}年${Number(month)}月`;
};

const formatShortMonth = (yearMonth: string): string => {
  const [, month] = yearMonth.split('-');
  return `${Number(month)}月`;
};

const calculateBarHeight = (amount: number, maxAmount: number): string => {
  if (amount <= 0 || maxAmount <= 0) {
    return '0%';
  }

  return `${Math.max(Math.round((amount / maxAmount) * 100), 14)}%`;
};

type InfoTooltipProps = {
  text: string;
  label: string;
};

const InfoTooltip = (props: InfoTooltipProps): JSX.Element => {
  const { text, label } = props;
  const tooltipId = useId();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isOpen = isPinned || isHovered || isFocused;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-500 transition hover:border-emerald-400 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        onClick={() => setIsPinned((current) => !current)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsPinned(false);
        }}
      >
        ?
      </button>

      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-10 mt-2 w-60 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-left text-xs font-medium leading-5 text-white shadow-xl"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
};

const ErrorPanel = (props: ErrorPanelProps): JSX.Element => {
  const { title, description, onRetry } = props;

  return (
    <div
      role="alert"
      className="rounded-[28px] border border-red-200 bg-red-50/90 p-6 text-red-700 shadow-sm"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm leading-6">{description}</p>
      </div>
      <div className="mt-4">
        <Button type="button" variant="secondary" fullWidth={false} onClick={onRetry}>
          再読み込み
        </Button>
      </div>
    </div>
  );
};

const LoadingPanel = (props: LoadingPanelProps): JSX.Element => {
  const { label, description } = props;

  return (
    <div className="flex min-h-64 items-center justify-center rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <Spinner size={20} className="text-emerald-600" label={label} />
        <div className="space-y-1">
          <p>{label}</p>
          <p className="text-xs font-medium text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

const BillingSummaryContent = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState<BillingCurrency>('JPY');
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

  useEffect(() => {
    const isTrendUnauthorized =
      trendQuery.error instanceof ApiError && trendQuery.error.status === 401;
    const isDetailUnauthorized =
      detailQuery.error instanceof ApiError && detailQuery.error.status === 401;

    if (!isTrendUnauthorized && !isDetailUnauthorized) {
      return;
    }

    clearAuthToken();
    queryClient.removeQueries({ queryKey: authSessionQueryKey });
    navigate('/login', { replace: true });
  }, [detailQuery.error, navigate, queryClient, trendQuery.error]);

  const selectedSummary = selectedTrendItem
    ? {
        year_month: detailQuery.data?.year_month ?? selectedTrendItem.year_month,
        total_amount: detailQuery.data?.total_amount ?? selectedTrendItem.total_amount,
        billing_count: detailQuery.data?.billing_count ?? selectedTrendItem.billing_count,
        fallback_billing_count:
          detailQuery.data?.fallback_billing_count ?? selectedTrendItem.fallback_billing_count,
      }
    : detailQuery.data
      ? {
          year_month: detailQuery.data.year_month,
          total_amount: detailQuery.data.total_amount,
          billing_count: detailQuery.data.billing_count,
          fallback_billing_count: detailQuery.data.fallback_billing_count,
        }
      : null;

  const monthlyMax =
    trendQuery.data?.items.reduce((max, item) => Math.max(max, item.total_amount), 0) ?? 0;
  const vendorItems = detailQuery.data?.vendor_items ?? [];
  const vendorMax = vendorItems.reduce((max, item) => Math.max(max, item.total_amount), 0);

  const handleCurrencyChange = (nextCurrency: BillingCurrency): void => {
    setCurrency(nextCurrency);
    setSelectedMonthOverride(null);
  };

  return (
    <section className="page-shell page-shell--wide space-y-6">
      <PageIntroCard
        className="mx-auto max-w-5xl"
        eyebrow="Billing Summary"
        title="請求集計"
        description="直近12ヶ月の推移と、選択月の支払先別内訳を確認できます。"
      >
        <div
          className="inline-flex self-start rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm"
          role="tablist"
          aria-label="通貨タブ"
        >
          {currencyOrder.map((item) => {
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
                onClick={() => handleCurrencyChange(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </PageIntroCard>

      {trendQuery.isLoading && !trendQuery.data ? (
        <LoadingPanel
          label="請求集計を読み込み中"
          description="直近12ヶ月の推移と選択月内訳を取得しています。"
        />
      ) : null}

      {trendQuery.isError && !trendQuery.data ? (
        <ErrorPanel
          title="月別請求の集計取得に失敗しました。"
          description={toFriendlyMessage(trendQuery.error)}
          onRetry={() => void trendQuery.refetch()}
        />
      ) : null}

      {trendQuery.data ? (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-6">
            <div className="space-y-3 border-b border-slate-200/80 pb-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-500">月別請求総額</p>
                {selectedSummary ? (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900 md:text-xl">
                      {formatYearMonth(selectedSummary.year_month)}
                    </p>
                    <p className="text-base font-semibold text-slate-700 md:text-lg">
                      合計 {formatAmount(currency, selectedSummary.total_amount)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-slate-900 md:text-xl">
                    月を選択してください
                  </p>
                )}
              </div>
              <p className="text-xs leading-6 text-slate-500">
                棒をクリックするとその月の支払先別請求総額が下部に表示されます。
              </p>
            </div>

            {trendQuery.data.items.length > 0 ? (
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
                    {trendQuery.data.items.map((item: BillingMonthlyTrendItem) => {
                      const isActive = item.year_month === selectedMonth;

                      return (
                        <button
                          key={item.year_month}
                          type="button"
                          aria-label={`${formatYearMonth(item.year_month)}を選択`}
                          aria-pressed={isActive}
                          className="flex w-[39px] shrink-0 flex-col items-center gap-2 text-center"
                          onClick={() => setSelectedMonthOverride(item.year_month)}
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
                                height: calculateBarHeight(item.total_amount, monthlyMax),
                              }}
                            />
                          </div>
                          <span
                            className={[
                              'text-xs font-semibold',
                              isActive ? 'text-slate-900' : 'text-slate-500',
                            ].join(' ')}
                          >
                            {formatShortMonth(item.year_month)}
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

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm md:p-6">
            <div className="border-b border-slate-200/80 pb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                <span className="block">支払先別請求総額</span>
                {selectedSummary ? (
                  <span className="mt-1 block text-lg text-slate-700">
                    {formatYearMonth(selectedSummary.year_month)}
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
                      {formatAmount(currency, selectedSummary?.total_amount ?? 0)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-500">請求件数</dt>
                    <dd className="text-right text-lg font-bold text-slate-900">
                      {formatCount(selectedSummary?.billing_count ?? 0)}件
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <span>補完件数</span>
                      <InfoTooltip
                        label="補完件数の説明を表示"
                        text="請求日がメールに無いため、メール受信日で判定した件数"
                      />
                    </dt>
                    <dd className="text-right text-lg font-bold text-slate-900">
                      {formatCount(selectedSummary?.fallback_billing_count ?? 0)}件
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="border-t border-slate-200/80 pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    表示: 上位{detailQuery.data?.vendor_limit ?? 5}件 + その他 / 並び順:
                    合計金額が高い順
                  </p>
                </div>

                {detailQuery.isLoading && !detailQuery.data ? (
                  <div className="mt-6 rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-6">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <Spinner
                        size={18}
                        className="text-emerald-600"
                        label="支払先別内訳を読み込み中"
                      />
                      支払先別内訳を読み込み中
                    </div>
                  </div>
                ) : null}

                {detailQuery.isError && !detailQuery.data ? (
                  <div className="mt-6">
                    <ErrorPanel
                      title="選択月の内訳取得に失敗しました。"
                      description={toFriendlyMessage(detailQuery.error)}
                      onRetry={() => void detailQuery.refetch()}
                    />
                  </div>
                ) : null}

                {!detailQuery.isLoading && !detailQuery.isError && detailQuery.data ? (
                  vendorItems.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {vendorItems.map((item: BillingMonthDetailVendorItem) => {
                        const width =
                          vendorMax > 0
                            ? Math.max(Math.round((item.total_amount / vendorMax) * 100), 10)
                            : 0;

                        return (
                          <article
                            key={`${detailQuery.data?.year_month}-${item.vendor_name}`}
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
                              <span>{formatAmount(currency, item.total_amount)}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                              <span>{formatCount(item.billing_count)}件</span>
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
        </div>
      ) : null}
    </section>
  );
};

export { BillingSummaryContent };
