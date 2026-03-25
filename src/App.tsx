import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Providers } from './providers/Providers';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/login/page';
import SignupPage from './pages/signup/page';
import SignupEmailSentPage from './pages/signup/email-sent/page';
import SignupVerifyPage from './pages/signup/verify/page';
import HomePage from './pages/home/page';
import GmailConnectionPage from './pages/mail-account-connections/gmail/page';
import GmailOAuthCallbackPage from './pages/mail-account-connections/gmail/callback/page';
import ManualMailWorkflowPage from './pages/manual-mail-workflows/page';

export default function App() {
  return (
    <Router>
      <Providers>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/email-sent" element={<SignupEmailSentPage />} />
          <Route path="/signup/verify" element={<SignupVerifyPage />} />
          <Route
            path="/mail-account-connections/gmail/callback"
            element={<GmailOAuthCallbackPage />}
          />

          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/mail-account-connections/gmail" element={<GmailConnectionPage />} />
            <Route path="/manual-mail-workflows" element={<ManualMailWorkflowPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </Router>
  );
}
