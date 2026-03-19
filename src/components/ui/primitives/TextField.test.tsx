import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('renders label and helper text and links them via aria attributes', () => {
    render(
      <TextField
        label="メール"
        name="email"
        placeholder="you@example.com"
        helperText="半角英数字で入力してください"
      />
    );

    const input = screen.getByLabelText('メール');

    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'email-helper');
    expect(input).toHaveClass('border-slate-200');
    expect(screen.getByText('半角英数字で入力してください')).toHaveAttribute('id', 'email-helper');
  });

  it('shows error message with error styling and overrides helper text', () => {
    render(
      <TextField
        label="パスワード"
        name="password"
        error="8文字以上で入力してください"
        helperText="これは表示されないはず"
      />
    );

    const input = screen.getByLabelText('パスワード');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'password-error');
    expect(input).toHaveClass('border-red-300');
    expect(input).not.toHaveClass('border-slate-200');
    expect(screen.getByText('8文字以上で入力してください')).toHaveAttribute('id', 'password-error');
    expect(screen.queryByText('これは表示されないはず')).toBeNull();
  });

  it('forwards ref and merges custom className', () => {
    const ref = createRef<HTMLInputElement>();

    render(<TextField id="custom" ref={ref} className="custom-class" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('id', 'custom');
    expect(ref.current).toHaveClass('custom-class');
  });
});
