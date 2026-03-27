import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '@/shared/api/client';
import { GmailOAuthCallbackContent } from './GmailOAuthCallbackContent';

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('./useCompleteGmailOAuth', () => ({
  useCompleteGmailOAuth: () => ({
    mutateAsync: (payload: unknown) => mutateAsyncMock(payload),
  }),
}));

describe('GmailOAuthCallbackContent', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mutateAsyncMock.mockReset();
  });

  it('shows missing message when code and state are absent', () => {
    render(
      <MemoryRouter initialEntries={['/mail-account-connections/gmail/callback']}>
        <GmailOAuthCallbackContent />
      </MemoryRouter>
    );

    expect(screen.getByText('連携に必要な情報が見つかりません')).toBeInTheDocument();
    expect(screen.getByText('連携に必要な情報が見つかりませんでした。')).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('does not call backend callback when Google returns access_denied', () => {
    render(
      <MemoryRouter
        initialEntries={['/mail-account-connections/gmail/callback?error=access_denied']}
      >
        <GmailOAuthCallbackContent />
      </MemoryRouter>
    );

    expect(screen.getByText('Gmail 連携に失敗しました')).toBeInTheDocument();
    expect(screen.getByText('Google 側で連携がキャンセルされました。')).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('calls backend callback only once under StrictMode and shows success message', async () => {
    mutateAsyncMock.mockResolvedValueOnce({
      message: 'Gmail 連携が完了しました。',
    });

    render(
      <React.StrictMode>
        <MemoryRouter
          initialEntries={['/mail-account-connections/gmail/callback?code=abc&state=xyz']}
        >
          <GmailOAuthCallbackContent />
        </MemoryRouter>
      </React.StrictMode>
    );

    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));
    expect(mutateAsyncMock).toHaveBeenCalledWith({ code: 'abc', state: 'xyz' });
    await waitFor(() => expect(screen.getByText('Gmail 連携が完了しました')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '連携ページへ戻る' }));
    expect(navigateMock).toHaveBeenCalledWith('/mail-account-connections/gmail', { replace: true });
  });

  it('shows a friendly message when oauth state is expired', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      new ApiError(409, {
        error: {
          code: 'oauth_state_expired',
          message: 'state expired',
        },
      })
    );

    render(
      <MemoryRouter
        initialEntries={['/mail-account-connections/gmail/callback?code=abc&state=expired']}
      >
        <GmailOAuthCallbackContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Gmail 連携に失敗しました')).toBeInTheDocument());
    expect(
      screen.getByText('連携の有効期限が切れました。もう一度やり直してください。')
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'もう一度やり直す' }));
    });

    expect(navigateMock).toHaveBeenCalledWith('/mail-account-connections/gmail', { replace: true });
  });
});
