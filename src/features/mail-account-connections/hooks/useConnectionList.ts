import { useQuery } from '@tanstack/react-query';
import {
  fetchMailAccountConnections,
  mailAccountConnectionsQueryKey,
} from '../api/mail-account-connections.api';

export const useConnectionList = () => {
  return useQuery({
    queryKey: mailAccountConnectionsQueryKey,
    queryFn: fetchMailAccountConnections,
  });
};
