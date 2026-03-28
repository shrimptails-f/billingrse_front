import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ResendEmailForm } from '@/features/auth/components/ResendEmailForm';
import { ApiError } from '@/shared/api/client';

const navigateMock = vi.fn();
const mutateMock = vi.fn();
let initialEntries: string[] = ['/signup/email-resend'];

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

vi.mock('@/features/auth/hooks/useResendEmail', () => ({
  useResendEmail: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

describe('ResendEmailForm', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    navigateMock.mockReset();
    sessionStorage.clear();
    initialEntries = ['/signup/email-resend'];
  });

  it('prefills email from query params', () => {
    initialEntries = ['/signup/email-resend?email=user@example.com'];

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <ResendEmailForm />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('メールアドレス')).toHaveValue('user@example.com');
  });

  it('shows field validation errors when submitting empty form', async () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <ResendEmailForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '確認メールを再送する' }));

    expect(mutateMock).not.toHaveBeenCalled();
    expect(await screen.findByText('メールアドレスを入力してください。')).toBeInTheDocument();
    expect(await screen.findByText('パスワードを入力してください。')).toBeInTheDocument();
  });

  it('renders invalid credential error from API', async () => {
    mutateMock.mockImplementation((_values, options) => {
      options?.onError?.(
        new ApiError({
          status: 401,
          code: 'invalid_credentials',
          message: 'メールアドレスまたはパスワードが正しくありません。',
          body: {
            error: {
              code: 'invalid_credentials',
              message: 'メールアドレスまたはパスワードが正しくありません。',
            },
          },
        })
      );
    });

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <ResendEmailForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '確認メールを再送する' }));

    expect(
      await screen.findByText('メールアドレスまたはパスワードが正しくありません。')
    ).toBeInTheDocument();
  });

  it('shows success message and stores email when resend succeeds', async () => {
    mutateMock.mockImplementation((values, options) => {
      options?.onSuccess?.({
        message: '確認メールを再送信しました。メールボックスをご確認ください。',
      });
      return values;
    });

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <ResendEmailForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '確認メールを再送する' }));

    await waitFor(() =>
      expect(
        screen.getByText('確認メールを再送信しました。メールボックスをご確認ください。')
      ).toBeInTheDocument()
    );
    expect(sessionStorage.getItem('lastRegisteredEmail')).toBe('user@example.com');
  });
});
