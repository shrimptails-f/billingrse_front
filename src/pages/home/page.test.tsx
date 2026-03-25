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

  it('navigates to the manual mail workflow page from the action button', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '手動メール取得を開く' }));

    expect(navigateMock).toHaveBeenCalledWith('/manual-mail-workflows');
  });

  it('shows the billing summary mock with JPY selected by default', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '請求サマリ' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'JPY' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('対象期間: 2025年4月 - 2026年3月')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('選択中: 2026年3月 合計 ¥182,400 12件'))
    ).toBeInTheDocument();
  });

  it('switches the billing summary when the currency tab changes', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('tab', { name: 'USD' }));

    expect(screen.getByRole('tab', { name: 'USD' })).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText((content) => content.includes('選択中: 2026年3月 合計 $1,126 9件'))
    ).toBeInTheDocument();
    expect(screen.getByText('$1,126')).toBeInTheDocument();
  });

  it('updates the selected month summary when a bar is clicked', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '2025年11月を選択' }));

    expect(
      screen.getByText((content) => content.includes('選択中: 2025年11月 合計 ¥109,500 9件'))
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '2025年11月の支払先別請求総額' })
    ).toBeInTheDocument();
  });
});
