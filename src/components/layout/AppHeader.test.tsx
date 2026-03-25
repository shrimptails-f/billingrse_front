import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Providers } from '@/providers/Providers';
import { AppHeader } from './AppHeader';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('AppHeader', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('opens the hamburger menu and navigates to the mail connection page', () => {
    render(
      <MemoryRouter>
        <Providers>
          <AppHeader />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'メニュー' }));
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'メールサービス連携 Gmail 連携画面へ移動します' })
    );

    expect(navigateMock).toHaveBeenCalledWith('/mail-account-connections/gmail');
  });

  it('does not show the manual workflow entry in the hamburger menu', () => {
    render(
      <MemoryRouter>
        <Providers>
          <AppHeader />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'メニュー' }));

    expect(screen.queryByRole('menuitem', { name: /手動メール取得/ })).not.toBeInTheDocument();
  });
});
