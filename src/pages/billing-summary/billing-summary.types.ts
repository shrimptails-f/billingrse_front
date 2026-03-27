export type BillingCurrency = 'JPY' | 'USD';

export type BillingMonthlyTrendItem = {
  year_month: string;
  total_amount: number;
  billing_count: number;
  fallback_billing_count: number;
};

export type BillingMonthlyTrendResponse = {
  currency: BillingCurrency;
  window_start_month: string;
  window_end_month: string;
  default_selected_month: string;
  items: BillingMonthlyTrendItem[];
};

export type BillingMonthDetailVendorItem = {
  vendor_name: string;
  total_amount: number;
  billing_count: number;
  is_other: boolean;
};

export type BillingMonthDetailResponse = {
  year_month: string;
  currency: BillingCurrency;
  total_amount: number;
  billing_count: number;
  fallback_billing_count: number;
  vendor_limit: number;
  vendor_items: BillingMonthDetailVendorItem[];
};
