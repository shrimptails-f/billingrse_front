import type { ReactNode } from 'react';
import { useAuthGuard } from '@/components/hooks/useAuthGuard';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  children: ReactNode;
};

export const DashboardGuard = ({ children }: Props): JSX.Element => {
  const { status } = useAuthGuard({
    redirectIfUnauthorized: '/login',
  });

  if (status === 'checking') {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Spinner />
          認証を確認しています...
        </div>
      </div>
    );
  }

  if (status === 'authorized') {
    return <>{children}</>;
  }

  // unauthorized はリダイレクト待ち。画面チラつきを避けて何も描画しない
  return <></>;
};
