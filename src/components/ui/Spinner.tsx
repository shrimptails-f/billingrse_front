type SpinnerProps = {
  size?: number;
  label?: string;
  className?: string;
};

export const Spinner = ({
  size = 16,
  label = '読み込み中',
  className = '',
}: SpinnerProps): JSX.Element => {
  const dimension = `${size}px`;
  return (
    <svg
      role="status"
      aria-label={label}
      className={`animate-spin ${className}`}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};
