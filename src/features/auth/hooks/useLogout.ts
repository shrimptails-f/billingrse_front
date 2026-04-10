import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isMockModeEnabled } from '@/shared/lib/mock-mode';
import { clearAuthToken } from '@/shared/auth/token';
import { authSessionQueryKey, logout } from '../api/auth.api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => (isMockModeEnabled ? Promise.resolve() : logout()),
    onSettled: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: authSessionQueryKey });
    },
  });
};
