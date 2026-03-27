import { get } from '@/shared/api/http';

export const authSessionQueryKey = ['auth', 'session'] as const;

export const checkAuth = (signal?: AbortSignal): Promise<void> => {
  return get<void>('/auth/check', {
    signal,
    retryOnUnauthorized: true,
  });
};
