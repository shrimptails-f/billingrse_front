import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  disconnectMailAccountConnection,
  mailAccountConnectionsQueryKey,
} from '../api/mail-account-connections.api';

export const useDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) => disconnectMailAccountConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mailAccountConnectionsQueryKey });
    },
  });
};
