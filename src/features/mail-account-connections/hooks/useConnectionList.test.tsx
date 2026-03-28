import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConnectionList } from './useConnectionList';

const fetchMailAccountConnectionsMock = vi.fn();

vi.mock('../api/mail-account-connections.api', () => ({
  fetchMailAccountConnections: () => fetchMailAccountConnectionsMock(),
  mailAccountConnectionsQueryKey: ['mail-account-connections'],
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

describe('useConnectionList', () => {
  beforeEach(() => {
    fetchMailAccountConnectionsMock.mockReset();
  });

  it('returns connection list on success', async () => {
    const mockData = {
      items: [
        {
          id: 1,
          provider: 'gmail',
          account_identifier: 'user@gmail.com',
          created_at: '2026-03-19T12:34:56Z',
          updated_at: '2026-03-19T12:40:12Z',
        },
      ],
    };

    fetchMailAccountConnectionsMock.mockResolvedValueOnce(mockData);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConnectionList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('returns empty items array when no connections exist', async () => {
    fetchMailAccountConnectionsMock.mockResolvedValueOnce({ items: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConnectionList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(0);
  });

  it('exposes error state when fetch fails', async () => {
    fetchMailAccountConnectionsMock.mockRejectedValueOnce(new Error('fetch failed'));

    const wrapper = createWrapper();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useConnectionList(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    consoleErrorSpy.mockRestore();
  });
});
