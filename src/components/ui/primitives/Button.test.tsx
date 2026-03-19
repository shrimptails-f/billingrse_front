import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children with primary styles and full width by default', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('w-full');
    expect(button).toHaveClass('bg-emerald-600');
  });

  it('applies secondary variant styles and width override', () => {
    render(
      <Button variant="secondary" fullWidth={false} className="custom-class">
        Secondary
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Secondary' });

    expect(button).not.toHaveClass('w-full');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('custom-class');
  });

  it('renders icons and forwards click handler', () => {
    const handleClick = vi.fn();

    render(
      <Button
        leftIcon={<span data-testid="left-icon">*</span>}
        rightIcon={<span data-testid="right-icon">#</span>}
        onClick={handleClick}
      >
        With icons
      </Button>
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /With icons/ }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not invoke click handler when disabled', () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
