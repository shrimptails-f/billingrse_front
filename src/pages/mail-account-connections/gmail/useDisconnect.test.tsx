import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDisconnect } from './useDisconnect';

const disconnectConnectionMock = vi.fn();

vi.mock('./gmail-oauth.api', () => ({
  disconnectConnection: (id: number) => disconnectConnectionMock(id),
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

  return { Wrapper, queryClient };
};

describe('useDisconnect', () => {
  beforeEach(() => {
    disconnectConnectionMock.mockReset();
  });

  it('calls disconnect API with connection ID', async () => {
    disconnectConnectionMock.mockResolvedValueOnce(undefined);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDisconnect(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync(42);
    });

    expect(disconnectConnectionMock).toHaveBeenCalledWith(42);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('exposes error state when disconnect fails', async () => {
    const error = new Error('disconnect failed');
    disconnectConnectionMock.mockRejectedValueOnce(error);
    const { Wrapper } = createWrapper();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useDisconnect(), { wrapper: Wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(1)).rejects.toThrow(error);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    consoleErrorSpy.mockRestore();
  });

  it('invalidates connection list query on success', async () => {
    disconnectConnectionMock.mockResolvedValueOnce(undefined);
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDisconnect(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync(10);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['mail-account-connections'],
    });
  });
});
