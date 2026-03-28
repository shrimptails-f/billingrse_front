import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VerifyEmailContent } from '@/features/auth/components/VerifyEmailContent';
import { ApiError } from '@/shared/api/client';

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();
let initialEntries: string[] = ['/'];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => {
      const url = new URL(`http://localhost${initialEntries[0]}`);
      const params = new URLSearchParams(url.search);
      return [params];
    },
  };
});

vi.mock('@/features/auth/hooks/useVerifyEmail', () => ({
  useVerifyEmail: () => ({
    mutateAsync: (token: string) => mutateAsyncMock(token),
    isPending: false,
  }),
}));

describe('VerifyEmailContent', () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    navigateMock.mockReset();
    initialEntries = ['/'];
  });

  it('shows missing token error when no token is provided', () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <VerifyEmailContent />
      </MemoryRouter>
    );

    expect(screen.getByText('トークンが見つかりません')).toBeInTheDocument();
    expect(screen.getByText('トークンが見つかりませんでした。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認メールを再送する' })).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('navigates to fixed resend page when resend action is clicked', () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <VerifyEmailContent />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '確認メールを再送する' }));

    expect(navigateMock).toHaveBeenCalledWith('/signup/email-resend');
  });

  it('shows invalid token error when API responds with invalid_token', async () => {
    initialEntries = ['/?token=invalid'];
    mutateAsyncMock.mockRejectedValueOnce(
      new ApiError({
        status: 400,
        code: 'invalid_token',
        message: '不正なトークンです。',
        body: {
          error: {
            code: 'invalid_token',
            message: '不正なトークンです。',
          },
        },
      })
    );

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <VerifyEmailContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('メール認証に失敗しました')).toBeInTheDocument());
    expect(screen.getByText('不正なトークンです。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認メールを再送する' })).toBeInTheDocument();
  });

  it('shows success message when verification succeeds', async () => {
    initialEntries = ['/?token=valid-token'];
    mutateAsyncMock.mockResolvedValueOnce({
      message: 'メールアドレスの認証が完了しました。',
      user: {
        id: 1,
        name: 'test',
        email: 'user@example.com',
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    });

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <VerifyEmailContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('メール認証が完了しました')).toBeInTheDocument());
    expect(screen.getByText('メールアドレスの認証が完了しました。')).toBeInTheDocument();
    expect(mutateAsyncMock).toHaveBeenCalledWith('valid-token');
  });
});
