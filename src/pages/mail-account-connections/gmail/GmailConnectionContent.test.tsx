import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { GmailConnectionContent } from './GmailConnectionContent';

const navigateMock = vi.fn();
const mutateMock = vi.fn();
let isPending = false;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('./useStartGmailOAuth', () => ({
  useStartGmailOAuth: () => ({
    mutate: mutateMock,
    isPending,
  }),
}));

describe('GmailConnectionContent', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mutateMock.mockReset();
    isPending = false;
  });

  it('starts Gmail OAuth and redirects to the authorization URL on success', () => {
    const assignMock = vi.fn();
    vi.stubGlobal('location', {
      ...window.location,
      assign: assignMock,
    });

    render(
      <MemoryRouter>
        <GmailConnectionContent />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gmail と連携する' }));
    expect(mutateMock).toHaveBeenCalledTimes(1);

    const options = mutateMock.mock.calls[0][1] as {
      onSuccess: (payload: { authorization_url: string; expires_at: string }) => void;
    };

    act(() => {
      options.onSuccess({
        authorization_url: 'https://accounts.google.com/o/oauth2/auth',
        expires_at: '2026-03-20T12:34:56Z',
      });
    });

    expect(assignMock).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/auth');
    vi.unstubAllGlobals();
  });

  it('shows an authentication error when authorize fails with 401', () => {
    render(
      <MemoryRouter>
        <GmailConnectionContent />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Gmail と連携する' }));
    const options = mutateMock.mock.calls[0][1] as {
      onError: (error: unknown) => void;
    };

    act(() => {
      options.onError(new ApiError(401, { code: 'unauthorized' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '認証エラーが発生しました。再度ログインしてください。'
    );
  });
});
