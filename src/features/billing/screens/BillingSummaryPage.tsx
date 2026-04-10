import type { JSX } from 'react';
import { BillingSummaryContent } from '../components/BillingSummaryContent';
import { BillingSummaryMockContent } from '../components/BillingSummaryMockContent';
import { isMockModeEnabled } from '@/shared/lib/mock-mode';

export const BillingSummaryPage = (): JSX.Element => {
  return isMockModeEnabled ? <BillingSummaryMockContent /> : <BillingSummaryContent />;
};
