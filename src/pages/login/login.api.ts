import { apiFetch } from '@/lib/api/client';
import type { AuthSessionResponse } from '@/lib/auth/token';
import type { LoginFormValues } from './login.schema';

export const login = (payload: LoginFormValues): Promise<AuthSessionResponse> =>
  apiFetch('POST', '/auth/login', {
    body: payload,
    attachAuthToken: false,
    retryOnUnauthorized: false,
  });
