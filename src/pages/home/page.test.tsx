import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './page';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('navigates to the billing summary page from the action button', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '請求集計を開く' }));

    expect(navigateMock).toHaveBeenCalledWith('/billing-summary');
  });

  it('navigates to the manual mail workflow page from the action button', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '手動メール取得を開く' }));

    expect(navigateMock).toHaveBeenCalledWith('/manual-mail-workflows');
  });

  it('shows the dashboard entry points', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'ログイン後ホーム' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '請求集計を開く' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '手動メール取得を開く' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'ログイン後に利用する画面への導線をまとめています。請求集計や手動メール取得はここから遷移してください。'
      )
    ).toBeInTheDocument();
  });
});
