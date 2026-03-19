'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = (props: Props): JSX.Element => {
  const {
    children,
    className,
    variant = 'primary',
    fullWidth = true,
    leftIcon,
    rightIcon,
    ...rest
  } = props;

  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  const variantClass =
    variant === 'primary'
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 focus-visible:outline-emerald-500'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-300';
  const widthClass = fullWidth ? 'w-full' : '';

  const composedClass = [baseClass, variantClass, widthClass, className].filter(Boolean).join(' ');

  return (
    <button {...rest} className={composedClass}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

Button.displayName = 'Button';
