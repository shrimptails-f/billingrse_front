import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthToken, getAuthSession } from '@/lib/auth/token';
import { useLogin } from './useLogin';

const loginMock = vi.fn();

vi.mock('./login.api', () => ({
  login: (payload: unknown) => loginMock(payload),
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

beforeEach(() => {
  loginMock.mockReset();
  clearAuthToken();
});

describe('useLogin', () => {
  it('calls login API and marks success on resolve', async () => {
    loginMock.mockResolvedValueOnce({
      access_token: 'access-token',
      token_type: 'Bearer',
      expires_in: 900,
    });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });
    const payload = { email: 'user@example.com', password: 'password123' };

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(loginMock).toHaveBeenCalledWith(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
    expect(getAuthSession()).toMatchObject({
      accessToken: 'access-token',
      tokenType: 'Bearer',
    });
  });

  it('exposes error state when login API rejects', async () => {
    const error = new Error('Unauthorized');
    loginMock.mockRejectedValueOnce(error);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });
    const payload = { email: 'user@example.com', password: 'wrong' };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await expect(result.current.mutateAsync(payload)).rejects.toThrow(error);
    });

    expect(loginMock).toHaveBeenCalledWith(payload);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);

    consoleErrorSpy.mockRestore();
  });
});
