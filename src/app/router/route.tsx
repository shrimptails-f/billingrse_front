import type { JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Providers } from '@/app/providers/Providers';
import { LoginPage, SignupPage } from '@/features/auth';
import { BillingSummaryPage } from '@/features/billing';
import { HomePage } from '@/features/dashboard';
import { AuthGuard, GuestGuard } from '@/app/router/guards';

const AppRouter = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/billing-summary" element={<BillingSummaryPage />} />
            </Route>
          </Route>

          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashbord" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
};

export default AppRouter;
