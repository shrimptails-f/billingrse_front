'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { authSessionQueryKey } from '@/lib/api/auth';
import { setAuthSession, type AuthSessionResponse } from '@/lib/auth/token';
import type { LoginFormValues } from './login.schema';
import { login } from './login.api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthSessionResponse, unknown, LoginFormValues>({
    mutationFn: (payload: LoginFormValues) => login(payload),
    onSuccess: (session) => {
      setAuthSession(session);
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
    },
  });
};
