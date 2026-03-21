import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disconnectConnection } from './gmail-oauth.api';

export const useDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) => disconnectConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-account-connections'] });
    },
  });
};
