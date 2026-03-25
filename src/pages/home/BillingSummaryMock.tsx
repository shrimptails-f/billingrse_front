import type { JSX } from 'react';
import { useState } from 'react';

type CurrencyKey = 'JPY' | 'USD';
type ProfileKey = 'aiHeavy' | 'baseline' | 'collabHeavy' | 'devHeavy' | 'growth';

type MonthSummary = {
  label: string;
  labelLong: string;
  total: number;
  invoiceCount: number;
  fallbackCount: number;
  profile: ProfileKey;
};

type CurrencySummaryConfig = {
  periodLabel: string;
  vendors: string[];
  profiles: Record<ProfileKey, number[]>;
  months: MonthSummary[];
};

type VendorBreakdown = {
  name: string;
  amount: number;
};

const currencyOrder: CurrencyKey[] = ['JPY', 'USD'];

const billingSummaryConfig: Record<CurrencyKey, CurrencySummaryConfig> = {
  JPY: {
    periodLabel: '2025年4月 - 2026年3月',
    vendors: ['AWS', 'Google Workspace', 'OpenAI', 'Notion', 'GitHub', 'その他'],
    profiles: {
      baseline: [0.42, 0.2, 0.11, 0.09, 0.07, 0.11],
      growth: [0.45, 0.2, 0.13, 0.08, 0.06, 0.08],
      aiHeavy: [0.35, 0.18, 0.25, 0.07, 0.05, 0.1],
      collabHeavy: [0.37, 0.24, 0.12, 0.11, 0.06, 0.1],
      devHeavy: [0.39, 0.18, 0.14, 0.08, 0.12, 0.09],
    },
    months: [
      {
        label: '4月',
        labelLong: '2025年4月',
        total: 58000,
        invoiceCount: 5,
        fallbackCount: 0,
        profile: 'baseline',
      },
      {
        label: '5月',
        labelLong: '2025年5月',
        total: 64400,
        invoiceCount: 6,
        fallbackCount: 1,
        profile: 'collabHeavy',
      },
      {
        label: '6月',
        labelLong: '2025年6月',
        total: 71200,
        invoiceCount: 6,
        fallbackCount: 1,
        profile: 'baseline',
      },
      {
        label: '7月',
        labelLong: '2025年7月',
        total: 83600,
        invoiceCount: 7,
        fallbackCount: 1,
        profile: 'growth',
      },
      {
        label: '8月',
        labelLong: '2025年8月',
        total: 76800,
        invoiceCount: 7,
        fallbackCount: 2,
        profile: 'aiHeavy',
      },
      {
        label: '9月',
        labelLong: '2025年9月',
        total: 88100,
        invoiceCount: 8,
        fallbackCount: 1,
        profile: 'devHeavy',
      },
      {
        label: '10月',
        labelLong: '2025年10月',
        total: 94300,
        invoiceCount: 8,
        fallbackCount: 2,
        profile: 'growth',
      },
      {
        label: '11月',
        labelLong: '2025年11月',
        total: 109500,
        invoiceCount: 9,
        fallbackCount: 1,
        profile: 'collabHeavy',
      },
      {
        label: '12月',
        labelLong: '2025年12月',
        total: 121000,
        invoiceCount: 10,
        fallbackCount: 2,
        profile: 'aiHeavy',
      },
      {
        label: '1月',
        labelLong: '2026年1月',
        total: 142800,
        invoiceCount: 10,
        fallbackCount: 2,
        profile: 'growth',
      },
      {
        label: '2月',
        labelLong: '2026年2月',
        total: 168200,
        invoiceCount: 11,
        fallbackCount: 2,
        profile: 'aiHeavy',
      },
      {
        label: '3月',
        labelLong: '2026年3月',
        total: 182400,
        invoiceCount: 12,
        fallbackCount: 3,
        profile: 'growth',
      },
    ],
  },
  USD: {
    periodLabel: '2025年4月 - 2026年3月',
    vendors: ['OpenAI API', 'AWS', 'Google Workspace', 'Vercel', 'GitHub', 'Other'],
    profiles: {
      baseline: [0.34, 0.24, 0.16, 0.1, 0.07, 0.09],
      growth: [0.37, 0.23, 0.15, 0.09, 0.07, 0.09],
      aiHeavy: [0.44, 0.18, 0.12, 0.08, 0.06, 0.12],
      collabHeavy: [0.31, 0.22, 0.22, 0.1, 0.06, 0.09],
      devHeavy: [0.33, 0.21, 0.14, 0.11, 0.12, 0.09],
    },
    months: [
      {
        label: '4月',
        labelLong: '2025年4月',
        total: 310,
        invoiceCount: 4,
        fallbackCount: 0,
        profile: 'baseline',
      },
      {
        label: '5月',
        labelLong: '2025年5月',
        total: 352,
        invoiceCount: 4,
        fallbackCount: 1,
        profile: 'collabHeavy',
      },
      {
        label: '6月',
        labelLong: '2025年6月',
        total: 401,
        invoiceCount: 5,
        fallbackCount: 0,
        profile: 'baseline',
      },
      {
        label: '7月',
        labelLong: '2025年7月',
        total: 438,
        invoiceCount: 5,
        fallbackCount: 1,
        profile: 'growth',
      },
      {
        label: '8月',
        labelLong: '2025年8月',
        total: 420,
        invoiceCount: 5,
        fallbackCount: 1,
        profile: 'devHeavy',
      },
      {
        label: '9月',
        labelLong: '2025年9月',
        total: 508,
        invoiceCount: 6,
        fallbackCount: 1,
        profile: 'growth',
      },
      {
        label: '10月',
        labelLong: '2025年10月',
        total: 561,
        invoiceCount: 6,
        fallbackCount: 1,
        profile: 'aiHeavy',
      },
      {
        label: '11月',
        labelLong: '2025年11月',
        total: 603,
        invoiceCount: 7,
        fallbackCount: 1,
        profile: 'collabHeavy',
      },
      {
        label: '12月',
        labelLong: '2025年12月',
        total: 644,
        invoiceCount: 7,
        fallbackCount: 2,
        profile: 'aiHeavy',
      },
      {
        label: '1月',
        labelLong: '2026年1月',
        total: 718,
        invoiceCount: 8,
        fallbackCount: 1,
        profile: 'growth',
      },
      {
        label: '2月',
        labelLong: '2026年2月',
        total: 812,
        invoiceCount: 8,
        fallbackCount: 1,
        profile: 'aiHeavy',
      },
      {
        label: '3月',
        labelLong: '2026年3月',
        total: 1126,
        invoiceCount: 9,
        fallbackCount: 2,
        profile: 'aiHeavy',
      },
    ],
  },
};

const countFormatter = new Intl.NumberFormat('ja-JP');
const usdAmountFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
});

const formatAmount = (currency: CurrencyKey, amount: number): string =>
  currency === 'JPY' ? `¥${countFormatter.format(amount)}` : usdAmountFormatter.format(amount);

const formatCount = (count: number): string => countFormatter.format(count);

const buildVendorBreakdown = (currency: CurrencyKey, month: MonthSummary): VendorBreakdown[] => {
  const { profiles, vendors } = billingSummaryConfig[currency];
  const ratios = profiles[month.profile];
  const rawAmounts = ratios.map((ratio) => Math.floor(month.total * ratio));
  const assignedAmount = rawAmounts.reduce((sum, current) => sum + current, 0);
  rawAmounts[0] += month.total - assignedAmount;

  return vendors.map((name, index) => ({
    name,
    amount: rawAmounts[index],
  }));
};

export const BillingSummaryMock = (): JSX.Element => {
  const [currency, setCurrency] = useState<CurrencyKey>('JPY');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    billingSummaryConfig.JPY.months.length - 1
  );

  const summary = billingSummaryConfig[currency];
  const selectedMonth = summary.months[selectedMonthIndex];
  const monthlyMax = Math.max(...summary.months.map((month) => month.total));
  const vendorBreakdown = buildVendorBreakdown(currency, selectedMonth);
  const vendorMax = Math.max(...vendorBreakdown.map((item) => item.amount));

  const handleCurrencyChange = (nextCurrency: CurrencyKey): void => {
    setCurrency(nextCurrency);
    setSelectedMonthIndex(billingSummaryConfig[nextCurrency].months.length - 1);
  };

  return (
    <section className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4fbf7_58%,#eef7ff_100%)] shadow-xl shadow-emerald-100/60">
      <div className="border-b border-slate-200/80 px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Billing Summary Mock
            </p>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">請求サマリ</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                直近1年の推移と、選択月の支払先内訳を確認できます。
              </p>
            </div>
            <div className="space-y-1 text-sm leading-6 text-slate-500">
              <p>月の判定: 請求日を優先し、未設定時は受信日時を使用</p>
              <p>対象期間: {summary.periodLabel}</p>
            </div>
          </div>

          <div
            className="inline-flex self-start rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm"
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
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <section className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">月別請求総額</p>
              <p className="text-lg font-semibold text-slate-900 md:text-xl">
                選択中: {selectedMonth.labelLong} 合計 {formatAmount(currency, selectedMonth.total)}{' '}
                {formatCount(selectedMonth.invoiceCount)}件
              </p>
            </div>
            <p className="text-xs leading-6 text-slate-500">
              補足: 棒をクリックすると下の支払先別内訳が切り替わります
            </p>
          </div>

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
                {summary.months.map((month, index) => {
                  const isActive = index === selectedMonthIndex;
                  const height = Math.max(Math.round((month.total / monthlyMax) * 100), 14);

                  return (
                    <button
                      key={month.labelLong}
                      type="button"
                      aria-label={`${month.labelLong}を選択`}
                      aria-pressed={isActive}
                      className="flex w-[39px] shrink-0 flex-col items-center gap-2 text-center"
                      onClick={() => setSelectedMonthIndex(index)}
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
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span
                        className={[
                          'text-xs font-semibold',
                          isActive ? 'text-slate-900' : 'text-slate-500',
                        ].join(' ')}
                      >
                        {month.label}
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
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              {selectedMonth.labelLong}のサマリ
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatAmount(currency, selectedMonth.total)}
            </p>
            <p className="mt-2 text-sm text-slate-500">合計金額</p>
          </article>

          <article className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">請求件数</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatCount(selectedMonth.invoiceCount)}
              <span className="ml-1 text-lg font-semibold text-slate-500">件</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">対象月に判定された請求数</p>
          </article>

          <article className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">補完件数</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatCount(selectedMonth.fallbackCount)}
              <span className="ml-1 text-lg font-semibold text-slate-500">件</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">billing_date なしのため受信日時で月判定</p>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedMonth.labelLong}の支払先別請求総額
              </h3>
              <p className="text-sm text-slate-500">
                表示: 上位5件 + その他 / 並び順: 合計金額が高い順
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              合計 {formatAmount(currency, selectedMonth.total)}
            </div>
          </div>

          {vendorBreakdown.length > 0 ? (
            <div className="mt-6 space-y-4">
              {vendorBreakdown.map((item) => {
                const width = Math.max(Math.round((item.amount / vendorMax) * 100), 10);

                return (
                  <article
                    key={`${selectedMonth.labelLong}-${item.name}`}
                    className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{formatAmount(currency, item.amount)}</span>
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
              支払先別内訳を表示できるデータがありません
            </div>
          )}
        </section>
      </div>
    </section>
  );
};
