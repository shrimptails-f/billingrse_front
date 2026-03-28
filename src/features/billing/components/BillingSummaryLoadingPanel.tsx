import type { JSX } from 'react';
import { Spinner } from '@/shared/ui/Spinner';

type Props = {
  label: string;
  description: string;
};

export const BillingSummaryLoadingPanel = ({ label, description }: Props): JSX.Element => {
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
