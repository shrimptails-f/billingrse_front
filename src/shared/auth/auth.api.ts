import { get, post } from '@/shared/api/http';
import type { AuthSessionResponse } from '@/lib/auth/token';

export const authRefreshEndpoint = '/auth/refresh';

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

export const refreshAuthSession = (): Promise<AuthSessionResponse> => {
  return post<AuthSessionResponse>(authRefreshEndpoint, {
    attachAuthToken: false,
    retryOnUnauthorized: false,
  });
};
