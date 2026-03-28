import type { JSX } from 'react';
import { Button } from '@/shared/ui/primitives/Button';

type Props = {
  title: string;
  description: string;
  onRetry: () => void;
};

export const BillingSummaryErrorPanel = ({ title, description, onRetry }: Props): JSX.Element => {
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
