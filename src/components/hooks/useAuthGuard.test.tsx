import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useAuthGuard } from './useAuthGuard';

const checkAuthMock = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  authSessionQueryKey: ['auth', 'session'],
  checkAuth: (signal?: AbortSignal) => checkAuthMock(signal),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );

  return Wrapper;
};

beforeEach(() => {
  checkAuthMock.mockReset();
  navigateMock.mockReset();
});

describe('useAuthGuard', () => {
  it('returns authorized status and redirects when authorized', async () => {
    checkAuthMock.mockResolvedValueOnce({});
    const wrapper = createWrapper();

    const { result } = renderHook(() => useAuthGuard({ redirectIfAuthorized: '/home' }), {
      wrapper,
    });

    expect(result.current.status).toBe('checking');

    await waitFor(() => expect(result.current.status).toBe('authorized'));
    expect(checkAuthMock).toHaveBeenCalledTimes(1);
    expect(checkAuthMock).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/home', { replace: true }));
  });

  it('returns unauthorized status, exposes error, and redirects on failure', async () => {
    checkAuthMock.mockRejectedValueOnce(new Error('Not authorized'));
    const wrapper = createWrapper();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuthGuard({ redirectIfUnauthorized: '/login' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.status).toBe('unauthorized'));
    expect(result.current.error).toBe('Not authorized');
    expect(typeof result.current.refetch).toBe('function');

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true }));
    consoleErrorSpy.mockRestore();
  });
});
