import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectionItem } from './gmail-oauth.types';

const mutateMock = vi.fn();
let listData: { items: ConnectionItem[] } | undefined;
let isLoading = false;
let isError = false;

vi.mock('./useConnectionList', () => ({
  useConnectionList: () => ({
    data: listData,
    isLoading,
    isError,
  }),
}));

vi.mock('./useDisconnect', () => ({
  useDisconnect: () => ({
    mutate: mutateMock,
    isPending: false,
  }),
}));

import { ConnectionList } from './ConnectionList';

describe('ConnectionList', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    listData = undefined;
    isLoading = false;
    isError = false;
  });

  it('shows spinner while loading', () => {
    isLoading = true;
    render(<ConnectionList />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message on fetch failure', () => {
    isError = true;
    render(<ConnectionList />);
    expect(
      screen.getByText('連携情報の取得に失敗しました。時間をおいて再度お試しください。')
    ).toBeInTheDocument();
  });

  it('shows empty state when no connections', () => {
    listData = { items: [] };
    render(<ConnectionList />);
    expect(screen.getByText('連携済みのアカウントはありません')).toBeInTheDocument();
  });

  it('renders connection rows', () => {
    listData = {
      items: [
        {
          id: 1,
          provider: 'gmail',
          account_identifier: 'user@gmail.com',
          created_at: '2026-03-19T12:34:56Z',
          updated_at: '2026-03-19T12:40:12Z',
        },
        {
          id: 2,
          provider: 'gmail',
          account_identifier: 'work@gmail.com',
          created_at: '2026-03-19T13:00:00Z',
          updated_at: '2026-03-19T13:00:00Z',
        },
      ],
    };
    render(<ConnectionList />);
    expect(screen.getByText('user@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('work@gmail.com')).toBeInTheDocument();
    expect(screen.getAllByText('解除')).toHaveLength(2);
  });

  it('calls disconnect with confirm dialog', () => {
    const confirmMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal('confirm', confirmMock);

    listData = {
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
    render(<ConnectionList />);
    fireEvent.click(screen.getByText('解除'));

    expect(confirmMock).toHaveBeenCalledWith('user@gmail.com の連携を解除しますか？');
    expect(mutateMock).toHaveBeenCalledWith(1, expect.any(Object));

    vi.unstubAllGlobals();
  });

  it('does not call disconnect when confirm is cancelled', () => {
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal('confirm', confirmMock);

    listData = {
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
    render(<ConnectionList />);
    fireEvent.click(screen.getByText('解除'));

    expect(mutateMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
