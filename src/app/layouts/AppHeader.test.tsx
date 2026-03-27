import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppHeader } from './AppHeader';

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/auth', () => ({
  useLogout: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mutateAsyncMock.mockReset();
  });

  it('opens the hamburger menu and navigates to the Gmail connection page', () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'メニュー' }));
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'メールサービス連携 Gmail 連携画面へ移動します' })
    );

    expect(navigateMock).toHaveBeenCalledWith('/mail-account-connections/gmail');
  });
});
