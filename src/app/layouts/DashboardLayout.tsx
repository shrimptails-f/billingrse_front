import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export const DashboardLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <AppHeader />
      <main className="page-shell py-8">
        <Outlet />
      </main>
    </div>
  );
};
