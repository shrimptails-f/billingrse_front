import { get, post } from '@/shared/api/http';

export const authSessionQueryKey = ['auth', 'session'] as const;

export const checkAuth = (signal?: AbortSignal): Promise<void> => {
  return get<void>('/auth/check', {
    signal,
    retryOnUnauthorized: true,
  });
};

export const logout = (): Promise<void> => {
  return post<void>('/auth/logout');
};
