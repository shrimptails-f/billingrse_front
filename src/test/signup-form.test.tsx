import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { ApiError } from '@/shared/api/client';

const navigateMock = vi.fn();
const mutateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/auth/hooks/useSignup', () => ({
  useSignup: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

const fillForm = () => {
  fireEvent.change(screen.getByLabelText('氏名'), { target: { value: '山田 太郎' } });
  fireEvent.change(screen.getByLabelText('メールアドレス'), {
    target: { value: 'user@example.com' },
  });
  fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
};

describe('SignupForm', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    navigateMock.mockReset();
    sessionStorage.clear();
  });

  it('shows field validation errors when submitting empty form', async () => {
    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '登録してメールを送る' }));

    expect(mutateMock).not.toHaveBeenCalled();
    expect(await screen.findByText('氏名を入力してください。')).toBeInTheDocument();
    expect(await screen.findByText('メールアドレスを入力してください。')).toBeInTheDocument();
    expect(await screen.findByText('パスワードを入力してください。')).toBeInTheDocument();
  });

  it('renders server error when email already exists', async () => {
    mutateMock.mockImplementation((_values, options) => {
      options?.onError?.(
        new ApiError({
          status: 401,
          code: 'email_already_exists',
          message: 'このメールアドレスは既に登録されています。',
          body: {
            error: {
              code: 'email_already_exists',
              message: 'このメールアドレスは既に登録されています。',
            },
          },
        })
      );
    });

    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>
    );
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: '登録してメールを送る' }));

    await screen.findByText('このメールアドレスは既に登録されています。');
    expect(mutateMock).toHaveBeenCalledWith(
      {
        name: '山田 太郎',
        email: 'user@example.com',
        password: 'password123',
      },
      expect.any(Object)
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('navigates to email-sent page and stores email on success', async () => {
    mutateMock.mockImplementation((values, options) => {
      options?.onSuccess?.({
        message: 'ok',
        user: {
          id: 1,
          name: values.name,
          email: values.email,
          email_verified: false,
          email_verified_at: null,
          created_at: '',
        },
      });
    });

    render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>
    );
    fillForm();

    fireEvent.click(screen.getByRole('button', { name: '登録してメールを送る' }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/signup/email-sent?email=user%40example.com', {
        replace: true,
      })
    );
    expect(sessionStorage.getItem('lastRegisteredEmail')).toBe('user@example.com');
  });
});
