import { deleteRequest, get } from '@/shared/api/http';
import type { MailAccountConnectionListResponse } from '../types/mail-account-connections.types';

export const mailAccountConnectionsQueryKey = ['mail-account-connections'] as const;

export const fetchMailAccountConnections = (): Promise<MailAccountConnectionListResponse> => {
  return get<MailAccountConnectionListResponse>('/mail-account-connections', {
    retryOnUnauthorized: true,
  });
};

export const disconnectMailAccountConnection = (connectionId: number): Promise<void> => {
  return deleteRequest<void>(`/mail-account-connections/${connectionId}`, {
    retryOnUnauthorized: true,
  });
};
