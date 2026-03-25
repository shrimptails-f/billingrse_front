import { useQuery } from '@tanstack/react-query';
import {
  fetchMailAccountConnections,
  mailAccountConnectionsQueryKey,
  type MailAccountConnectionItem,
} from '@/lib/api/mail-account-connections';

export type ConnectionOption = {
  value: string;
  label: string;
  provider: string;
  accountIdentifier: string;
};

const toConnectionOption = (item: MailAccountConnectionItem): ConnectionOption => ({
  value: String(item.id),
  label: `${item.provider.toUpperCase()} / ${item.account_identifier}`,
  provider: item.provider,
  accountIdentifier: item.account_identifier,
});

export const useConnectionOptions = () => {
  const query = useQuery({
    queryKey: mailAccountConnectionsQueryKey,
    queryFn: fetchMailAccountConnections,
  });

  return {
    ...query,
    options: query.data?.items.map(toConnectionOption) ?? [],
  };
};
