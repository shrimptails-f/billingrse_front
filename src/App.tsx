import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Providers } from './providers/Providers';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/login/page';
import SignupPage from './pages/signup/page';
import SignupEmailSentPage from './pages/signup/email-sent/page';
import SignupVerifyPage from './pages/signup/verify/page';
import HomePage from './pages/home/page';

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

          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<HomePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </Router>
  );
}
