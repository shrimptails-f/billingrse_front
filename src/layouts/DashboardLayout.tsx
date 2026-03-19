import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardGuard } from '@/components/layout/DashboardGuard';

export const DashboardLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <AppHeader />
      <DashboardGuard>
        <main className="py-8">
          <Outlet />
        </main>
      </DashboardGuard>
    </div>
  );
};
