import type { BillingCurrency } from '../types/billing-summary.types';

export const billingCurrencyOrder: BillingCurrency[] = ['JPY', 'USD'];

const countFormatter = new Intl.NumberFormat('ja-JP');

const amountFormatterMap: Record<BillingCurrency, Intl.NumberFormat> = {
  JPY: new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
};

export const formatBillingAmount = (currency: BillingCurrency, amount: number): string => {
  return amountFormatterMap[currency].format(amount);
};

export const formatBillingCount = (count: number): string => {
  return countFormatter.format(count);
};

export const formatBillingYearMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');

  return `${year}年${Number(month)}月`;
};

export const formatBillingShortMonth = (yearMonth: string): string => {
  const [, month] = yearMonth.split('-');

  return `${Number(month)}月`;
};

export const calculateBillingBarHeight = (amount: number, maxAmount: number): string => {
  if (amount <= 0 || maxAmount <= 0) {
    return '0%';
  }

  return `${Math.max(Math.round((amount / maxAmount) * 100), 14)}%`;
};
