import { useQuery } from '@tanstack/react-query';
import { fetchConnectionList } from './gmail-oauth.api';

export const useConnectionList = () =>
  useQuery({
    queryKey: ['mail-account-connections'],
    queryFn: fetchConnectionList,
  });
