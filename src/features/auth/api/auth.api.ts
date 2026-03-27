// src/features/auth/api/auth.api.ts
import { apiFetch } from '@/shared/api/client';

export const authSessionQueryKey = ['auth', 'session'] as const;

export const checkAuth = (signal?: AbortSignal): Promise<void> => {
  return apiFetch('GET', '/auth/check', {
    signal,
    retryOnUnauthorized: true,
  });
};
