import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  JSX,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
} from 'react';
import { Link, type To } from 'react-router-dom';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'lg';
type ElementType = 'button' | 'a' | 'link';

export type ButtonProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'className' | 'onClick'
> & {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  href?: string;
  to?: To;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  onClick?: MouseEventHandler<HTMLElement>;
};

const baseClassName =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantClassNames: Record<Variant, string> = {
  primary:
    'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 focus-visible:outline-emerald-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-300',
};

const sizeClassNames: Record<Size, string> = {
  md: 'min-h-11 px-4 py-3 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
};

const joinClassNames = (...classNames: Array<string | undefined | false>): string => {
  return classNames.filter(Boolean).join(' ');
};

const LoadingIndicator = (): JSX.Element => {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
};

type ButtonContentProps = Pick<ButtonProps, 'children' | 'leftIcon' | 'rightIcon' | 'loading'>;

const ButtonContent = ({
  children,
  leftIcon,
  rightIcon,
  loading = false,
}: ButtonContentProps): JSX.Element => {
  return (
    <>
      {loading ? <LoadingIndicator /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </>
  );
};

const handleClick = <T extends HTMLElement>(
  event: MouseEvent<T>,
  isInactive: boolean,
  onClick?: MouseEventHandler<HTMLElement>
): void => {
  if (isInactive) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  (onClick as MouseEventHandler<T> | undefined)?.(event);
};

export const Button = ({
  as = 'button',
  children,
  className,
  disabled = false,
  fullWidth = true,
  leftIcon,
  loading = false,
  onClick,
  rightIcon,
  size = 'md',
  variant = 'primary',
  type = 'button',
  href,
  to,
  target,
  rel,
  tabIndex,
  ...rest
}: ButtonProps): JSX.Element => {
  const isInactive = disabled || loading;
  const composedClassName = joinClassNames(
    baseClassName,
    variantClassNames[variant],
    sizeClassNames[size],
    fullWidth ? 'w-full' : undefined,
    loading ? 'pointer-events-none' : undefined,
    as !== 'button' && isInactive ? 'opacity-60' : undefined,
    as === 'a' && isInactive ? 'cursor-not-allowed' : undefined,
    as === 'link' && isInactive ? 'pointer-events-none' : undefined,
    className
  );

  if (as === 'a') {
    return (
      <a
        {...rest}
        aria-disabled={isInactive}
        className={composedClassName}
        href={href}
        onClick={(event) => handleClick(event, isInactive, onClick)}
        rel={rel}
        tabIndex={isInactive ? -1 : tabIndex}
        target={target}
      >
        <ButtonContent
          loading={loading}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          children={children}
        />
      </a>
    );
  }

  if (as === 'link') {
    return (
      <Link
        {...rest}
        aria-disabled={isInactive}
        className={composedClassName}
        onClick={(event) => handleClick(event, isInactive, onClick)}
        tabIndex={isInactive ? -1 : tabIndex}
        to={to ?? '#'}
      >
        <ButtonContent
          loading={loading}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          children={children}
        />
      </Link>
    );
  }

  return (
    <button
      {...rest}
      className={composedClassName}
      disabled={isInactive}
      onClick={(event) => handleClick(event, isInactive, onClick)}
      type={type}
    >
      <ButtonContent
        loading={loading}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        children={children}
      />
    </button>
  );
};
