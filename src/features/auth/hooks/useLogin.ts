import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAuthSession, type AuthSessionResponse } from '@/shared/auth/token';
import { authSessionQueryKey } from '../api/auth.api';
import { login } from '../api/login.api';
import type { LoginFormValues } from '../schema/login.schema';

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
