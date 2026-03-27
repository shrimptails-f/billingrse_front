import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearAuthToken } from '@/lib/auth/token';
import { authSessionQueryKey, logout } from '../api/auth.api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
    },
  });
};
