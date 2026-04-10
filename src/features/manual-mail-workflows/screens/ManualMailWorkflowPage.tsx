import type { JSX } from 'react';
import { ManualMailWorkflowContent } from '../components/ManualMailWorkflowContent';
import { ManualMailWorkflowMockContent } from '../components/ManualMailWorkflowMockContent';
import { isMockModeEnabled } from '@/shared/lib/mock-mode';

export const ManualMailWorkflowPage = (): JSX.Element => {
  return isMockModeEnabled ? <ManualMailWorkflowMockContent /> : <ManualMailWorkflowContent />;
};
