import type { JSX } from 'react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'アプリケーション';

export const AppFooter = (): JSX.Element => {
  return (
    <footer className="border-t border-slate-200 bg-white/75">
      <div className="page-shell flex flex-col gap-2 pb-10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="font-semibold text-slate-700">{APP_NAME}</p>
        <p>Minimal dashboard footer placeholder.</p>
      </div>
    </footer>
  );
};
