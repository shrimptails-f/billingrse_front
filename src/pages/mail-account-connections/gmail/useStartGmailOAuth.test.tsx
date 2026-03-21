import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStartGmailOAuth } from './useStartGmailOAuth';

const requestGmailAuthorizationMock = vi.fn();

vi.mock('./gmail-oauth.api', () => ({
  requestGmailAuthorization: () => requestGmailAuthorizationMock(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'QueryClientTestWrapper';

  return Wrapper;
};

describe('useStartGmailOAuth', () => {
  beforeEach(() => {
    requestGmailAuthorizationMock.mockReset();
  });

  it('calls authorize API and exposes success state', async () => {
    requestGmailAuthorizationMock.mockResolvedValueOnce({
      authorization_url: 'https://accounts.google.com/o/oauth2/auth',
      expires_at: '2026-03-20T12:34:56Z',
    });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStartGmailOAuth(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(requestGmailAuthorizationMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('exposes error state when authorize API rejects', async () => {
    const error = new Error('authorize failed');
    requestGmailAuthorizationMock.mockRejectedValueOnce(error);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useStartGmailOAuth(), { wrapper });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow(error);
    });

    expect(requestGmailAuthorizationMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isError).toBe(true));

    consoleErrorSpy.mockRestore();
  });
});
