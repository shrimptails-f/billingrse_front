import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authSessionQueryKey, logout } from '@/lib/api/auth';
import { clearAuthToken } from '@/lib/auth/token';

type Props = {
  title?: string;
};

const APP_NAME = import.meta.env.VITE_APP_NAME || 'アプリケーション';

export const AppHeader = ({ title = APP_NAME }: Props): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="relative border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="page-shell flex h-14 items-center justify-between">
        <div className="text-base font-semibold tracking-wide text-emerald-700">{title}</div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          onClick={handleLogout}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};
