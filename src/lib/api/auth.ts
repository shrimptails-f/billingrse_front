import { apiFetch } from './client';
import { authRefreshEndpoint, authSessionQueryKey } from './auth.shared';
import type { AuthSessionResponse } from '@/lib/auth/token';

export const checkAuth = (signal?: AbortSignal): Promise<void> =>
  apiFetch('GET', '/auth/check', {
    signal,
    retryOnUnauthorized: true,
  });

export const logout = (): Promise<void> => apiFetch('POST', '/auth/logout');

export const refreshAuthSession = (): Promise<AuthSessionResponse> =>
  apiFetch('POST', authRefreshEndpoint, {
    attachAuthToken: false,
    retryOnUnauthorized: false,
  });

export { authSessionQueryKey };
