import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export const DashboardLayout = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <div className="fixed inset-x-0 top-0 z-30">
        <AppHeader />
      </div>
      <div aria-hidden="true" className="h-20" />
      <main className="page-shell flex-1 pb-8">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};
