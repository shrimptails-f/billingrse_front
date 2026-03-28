import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRouter from './route';

const useAuthSessionMock = vi.fn();

vi.mock('@/features/auth', () => ({
  useAuthSession: () => useAuthSessionMock(),
  useLogout: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  LoginPage: () => <div>login-page</div>,
  ResendEmailPage: () => <div>resend-page</div>,
  SignupEmailSentPage: () => <div>signup-email-sent-page</div>,
  SignupPage: () => <div>signup-page</div>,
  VerifyEmailPage: () => <div>verify-email-page</div>,
}));

vi.mock('@/features/billing', () => ({
  BillingSummaryPage: () => <div>billing-page</div>,
}));

vi.mock('@/features/dashboard', () => ({
  HomePage: () => <div>home-page</div>,
}));

vi.mock('@/features/mail-account-connections', () => ({
  GmailConnectionPage: () => <div>gmail-connection-page</div>,
  GmailOAuthCallbackPage: () => <div>gmail-oauth-callback-page</div>,
}));

vi.mock('@/features/manual-mail-workflows', () => ({
  ManualMailWorkflowPage: () => <div>manual-mail-workflow-page</div>,
}));

describe('AppRouter', () => {
  beforeEach(() => {
    useAuthSessionMock.mockReset();
    window.history.replaceState(null, '', '/');
  });

  it('renders login page even when user is authorized', async () => {
    useAuthSessionMock.mockReturnValue({
      status: 'authorized',
      isChecking: false,
      isAuthorized: true,
      isUnauthorized: false,
    });
    window.history.replaceState(null, '', '/login');

    render(<AppRouter />);

    expect(await screen.findByText('login-page')).toBeInTheDocument();
  });

  it('redirects signup page to dashboard when user is authorized', async () => {
    useAuthSessionMock.mockReturnValue({
      status: 'authorized',
      isChecking: false,
      isAuthorized: true,
      isUnauthorized: false,
    });
    window.history.replaceState(null, '', '/signup');

    render(<AppRouter />);

    expect(await screen.findByText('home-page')).toBeInTheDocument();
    expect(screen.queryByText('signup-page')).not.toBeInTheDocument();
  });
});
