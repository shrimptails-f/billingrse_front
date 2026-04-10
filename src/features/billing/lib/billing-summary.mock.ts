import type {
  BillingCurrency,
  BillingMonthDetailResponse,
  BillingMonthDetailVendorItem,
  BillingMonthlyTrendResponse,
} from '../types/billing-summary.types';

const jpyTrendItems = [
  { year_month: '2025-04', total_amount: 58000, billing_count: 5, fallback_billing_count: 0 },
  { year_month: '2025-05', total_amount: 64400, billing_count: 6, fallback_billing_count: 1 },
  { year_month: '2025-06', total_amount: 71200, billing_count: 6, fallback_billing_count: 1 },
  { year_month: '2025-07', total_amount: 83600, billing_count: 7, fallback_billing_count: 1 },
  { year_month: '2025-08', total_amount: 76800, billing_count: 7, fallback_billing_count: 2 },
  { year_month: '2025-09', total_amount: 88100, billing_count: 8, fallback_billing_count: 1 },
  { year_month: '2025-10', total_amount: 94300, billing_count: 8, fallback_billing_count: 2 },
  { year_month: '2025-11', total_amount: 109500, billing_count: 9, fallback_billing_count: 1 },
  { year_month: '2025-12', total_amount: 121000, billing_count: 10, fallback_billing_count: 2 },
  { year_month: '2026-01', total_amount: 142800, billing_count: 10, fallback_billing_count: 2 },
  { year_month: '2026-02', total_amount: 168200, billing_count: 11, fallback_billing_count: 2 },
  { year_month: '2026-03', total_amount: 182400, billing_count: 12, fallback_billing_count: 3 },
] as const;

const usdTrendItems = [
  { year_month: '2025-04', total_amount: 310, billing_count: 4, fallback_billing_count: 0 },
  { year_month: '2025-05', total_amount: 352, billing_count: 4, fallback_billing_count: 1 },
  { year_month: '2025-06', total_amount: 401, billing_count: 5, fallback_billing_count: 0 },
  { year_month: '2025-07', total_amount: 438, billing_count: 5, fallback_billing_count: 1 },
  { year_month: '2025-08', total_amount: 420, billing_count: 5, fallback_billing_count: 1 },
  { year_month: '2025-09', total_amount: 508, billing_count: 6, fallback_billing_count: 1 },
  { year_month: '2025-10', total_amount: 561, billing_count: 6, fallback_billing_count: 1 },
  { year_month: '2025-11', total_amount: 603, billing_count: 7, fallback_billing_count: 1 },
  { year_month: '2025-12', total_amount: 644, billing_count: 7, fallback_billing_count: 2 },
  { year_month: '2026-01', total_amount: 718, billing_count: 8, fallback_billing_count: 1 },
  { year_month: '2026-02', total_amount: 812, billing_count: 8, fallback_billing_count: 1 },
  { year_month: '2026-03', total_amount: 1126, billing_count: 9, fallback_billing_count: 2 },
] as const;

const vendorTemplates: Record<
  BillingCurrency,
  Array<{ vendor_name: string; amountRate: number; countRate: number; is_other?: boolean }>
> = {
  JPY: [
    { vendor_name: 'AWS', amountRate: 0.42, countRate: 0.33 },
    { vendor_name: 'Google Workspace', amountRate: 0.2, countRate: 0.17 },
    { vendor_name: 'OpenAI', amountRate: 0.13, countRate: 0.17 },
    { vendor_name: 'Notion', amountRate: 0.08, countRate: 0.08 },
    { vendor_name: 'GitHub', amountRate: 0.07, countRate: 0.08 },
    { vendor_name: 'その他', amountRate: 0.1, countRate: 0.17, is_other: true },
  ],
  USD: [
    { vendor_name: 'OpenAI API', amountRate: 0.44, countRate: 0.33 },
    { vendor_name: 'AWS', amountRate: 0.18, countRate: 0.22 },
    { vendor_name: 'Google Workspace', amountRate: 0.15, countRate: 0.11 },
    { vendor_name: 'Vercel', amountRate: 0.09, countRate: 0.11 },
    { vendor_name: 'GitHub', amountRate: 0.07, countRate: 0.11 },
    { vendor_name: 'その他', amountRate: 0.07, countRate: 0.12, is_other: true },
  ],
};

export const mockBillingMonthlyTrendByCurrency: Record<
  BillingCurrency,
  BillingMonthlyTrendResponse
> = {
  JPY: {
    currency: 'JPY',
    window_start_month: '2025-04',
    window_end_month: '2026-03',
    default_selected_month: '2026-03',
    items: [...jpyTrendItems],
  },
  USD: {
    currency: 'USD',
    window_start_month: '2025-04',
    window_end_month: '2026-03',
    default_selected_month: '2026-03',
    items: [...usdTrendItems],
  },
};

const distributeValues = (total: number, rates: number[]): number[] => {
  const distributed = rates.map((rate) => Math.floor(total * rate));
  const used = distributed.reduce((sum, value) => sum + value, 0);
  const remainder = total - used;

  if (distributed.length > 0) {
    distributed[distributed.length - 1] += remainder;
  }

  return distributed;
};

const buildVendorItems = (
  currency: BillingCurrency,
  totalAmount: number,
  billingCount: number
): BillingMonthDetailVendorItem[] => {
  const templates = vendorTemplates[currency];
  const amountValues = distributeValues(
    totalAmount,
    templates.map((template) => template.amountRate)
  );
  const countValues = distributeValues(
    billingCount,
    templates.map((template) => template.countRate)
  );

  return templates.map((template, index) => ({
    vendor_name: template.vendor_name,
    total_amount: amountValues[index] ?? 0,
    billing_count: countValues[index] ?? 0,
    is_other: template.is_other ?? false,
  }));
};

export const getMockBillingMonthDetail = (
  currency: BillingCurrency,
  yearMonth: string
): BillingMonthDetailResponse | undefined => {
  const summary = mockBillingMonthlyTrendByCurrency[currency].items.find(
    (item) => item.year_month === yearMonth
  );

  if (!summary) {
    return undefined;
  }

  return {
    ...summary,
    currency,
    vendor_limit: 5,
    vendor_items: buildVendorItems(currency, summary.total_amount, summary.billing_count),
  };
};
