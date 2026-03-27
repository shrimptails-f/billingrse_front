import type { JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Providers } from '@/app/providers/Providers';
import { LoginPage, SignupEmailSentPage, SignupPage, VerifyEmailPage } from '@/features/auth';
import { BillingSummaryPage } from '@/features/billing';
import { HomePage } from '@/features/dashboard';
import { GmailConnectionPage, GmailOAuthCallbackPage } from '@/features/mail-account-connections';
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

          <Route path="/signup/email-sent" element={<SignupEmailSentPage />} />
          <Route path="/signup/verify" element={<VerifyEmailPage />} />

          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<HomePage />} />
              <Route path="/billing-summary" element={<BillingSummaryPage />} />
              <Route path="/mail-account-connections/gmail" element={<GmailConnectionPage />} />
              <Route
                path="/mail-account-connections/gmail/callback"
                element={<GmailOAuthCallbackPage />}
              />
            </Route>
          </Route>

          <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
};

export default AppRouter;
