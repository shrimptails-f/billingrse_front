import type { JSX, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export const AuthScreenLayout = ({ children }: Props): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <div className="page-shell flex min-h-screen items-center justify-center py-12">
        {children}
      </div>
    </div>
  );
};
