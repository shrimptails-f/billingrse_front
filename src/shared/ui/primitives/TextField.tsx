import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { label, error, helperText, id, name, className, ...rest } = props;

  const fieldId = id ?? name ?? undefined;
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;
  const helperId = helperText && fieldId && !error ? `${fieldId}-helper` : undefined;

  const baseClass =
    'min-h-11 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 shadow-inner transition focus:outline-none focus:ring-2';
  const normalStateClass = 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100';
  const errorStateClass = 'border-red-300 focus:border-red-500 focus:ring-red-100';
  const composedClassName = [baseClass, error ? errorStateClass : normalStateClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-semibold text-slate-800" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}

      <input
        {...rest}
        id={fieldId}
        name={name}
        ref={ref}
        className={composedClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId ?? helperId}
      />

      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-sm text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

TextField.displayName = 'TextField';
