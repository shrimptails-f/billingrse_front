import type { JSX, ReactNode } from 'react';

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const baseClassName =
  'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8';

export const PageIntroCard = (props: Props): JSX.Element => {
  const { eyebrow, title, description, children, className } = props;
  const composedClassName = [baseClassName, className].filter(Boolean).join(' ');

  return (
    <section className={composedClassName}>
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
        ) : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
};
