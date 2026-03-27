import { fetchMailAccountConnections } from '@/lib/api/mail-account-connections';
import { apiFetch } from '@/shared/api/client';
import type {
  GmailAuthorizeResponse,
  GmailOAuthCallbackPayload,
  GmailOAuthCallbackResponse,
} from './gmail-oauth.types';

export const requestGmailAuthorization = (): Promise<GmailAuthorizeResponse> =>
  apiFetch('POST', '/mail-account-connections/gmail/authorize', {
    retryOnUnauthorized: true,
  });

export const completeGmailOAuth = (
  payload: GmailOAuthCallbackPayload
): Promise<GmailOAuthCallbackResponse> =>
  apiFetch('POST', '/mail-account-connections/gmail/callback', {
    body: payload,
    retryOnUnauthorized: true,
  });

export const fetchConnectionList = () => fetchMailAccountConnections();

export const disconnectConnection = (connectionId: number): Promise<void> =>
  apiFetch('DELETE', `/mail-account-connections/${connectionId}`, {
    retryOnUnauthorized: true,
  });
