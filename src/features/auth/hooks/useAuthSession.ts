// src/features/auth/hooks/useAuthSession.ts
import { useQuery } from '@tanstack/react-query';
import { isMockModeEnabled } from '@/shared/lib/mock-mode';
import { authSessionQueryKey, checkAuth } from '../api/auth.api';

export type AuthStatus = 'checking' | 'authorized' | 'unauthorized';

export const useAuthSession = () => {
  const query = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: ({ signal }) => checkAuth(signal),
    enabled: !isMockModeEnabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const status: AuthStatus = isMockModeEnabled
    ? 'authorized'
    : query.status === 'pending'
      ? 'checking'
      : query.status === 'error'
        ? 'unauthorized'
        : 'authorized';

  return {
    status,
    isChecking: status === 'checking',
    isAuthorized: status === 'authorized',
    isUnauthorized: status === 'unauthorized',
  };
};
