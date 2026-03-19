import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size and label', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status', { name: '読み込み中' });

    expect(spinner).toHaveAttribute('width', '16px');
    expect(spinner).toHaveAttribute('height', '16px');
    expect(spinner).toHaveAttribute('aria-label', '読み込み中');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('applies custom size, label and className', () => {
    render(<Spinner size={24} label="Loading" className="text-emerald-500" />);

    const spinner = screen.getByRole('status', { name: 'Loading' });

    expect(spinner).toHaveAttribute('width', '24px');
    expect(spinner).toHaveAttribute('height', '24px');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('text-emerald-500');
  });
});
