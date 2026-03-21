import { apiFetch } from '@/lib/api/client';
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
