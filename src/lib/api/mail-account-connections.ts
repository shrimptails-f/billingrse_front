import { apiFetch } from '@/shared/api/client';

export type MailAccountConnectionItem = {
  id: number;
  provider: string;
  account_identifier: string;
  created_at: string;
  updated_at: string;
};

export type MailAccountConnectionListResponse = {
  items: MailAccountConnectionItem[];
};

export const mailAccountConnectionsQueryKey = ['mail-account-connections'] as const;

export const fetchMailAccountConnections = (): Promise<MailAccountConnectionListResponse> =>
  apiFetch('GET', '/mail-account-connections', {
    retryOnUnauthorized: true,
  });
