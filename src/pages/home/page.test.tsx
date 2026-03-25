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
});
