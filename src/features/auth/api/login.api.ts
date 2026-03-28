import type { AuthSessionResponse } from '@/shared/auth/token';
import { post } from '@/shared/api/http';
import type { LoginFormValues } from '../schema/login.schema';

export const login = (payload: LoginFormValues): Promise<AuthSessionResponse> => {
  return post<AuthSessionResponse, LoginFormValues>('/auth/login', {
    body: payload,
    attachAuthToken: false,
    retryOnUnauthorized: false,
  });
};
