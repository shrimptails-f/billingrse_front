import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authSessionQueryKey, checkAuth } from '@/lib/api/auth';

export type AuthStatus = 'checking' | 'authorized' | 'unauthorized';

type Options = {
  redirectIfUnauthorized?: string;
  redirectIfAuthorized?: string;
};

export const useAuthGuard = (options: Options = {}) => {
  const { redirectIfUnauthorized, redirectIfAuthorized } = options;
  const navigate = useNavigate();

  const authQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: ({ signal }) => checkAuth(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const status: AuthStatus =
    authQuery.status === 'pending'
      ? 'checking'
      : authQuery.status === 'error'
        ? 'unauthorized'
        : 'authorized';
  const error =
    authQuery.error instanceof Error
      ? authQuery.error.message
      : authQuery.error
        ? '認証に失敗しました'
        : null;

  useEffect(() => {
    if (status === 'authorized' && redirectIfAuthorized) {
      navigate(redirectIfAuthorized, { replace: true });
    }
    if (status === 'unauthorized' && redirectIfUnauthorized) {
      navigate(redirectIfUnauthorized, { replace: true });
    }
  }, [navigate, status, redirectIfAuthorized, redirectIfUnauthorized]);

  return { status, error, refetch: authQuery.refetch };
};
