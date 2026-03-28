import { post } from '@/shared/api/http';
import type {
  GmailAuthorizeResponse,
  GmailOAuthCallbackPayload,
  GmailOAuthCallbackResponse,
} from '../types/gmail-oauth.types';

export const requestGmailAuthorization = (): Promise<GmailAuthorizeResponse> => {
  return post<GmailAuthorizeResponse>('/mail-account-connections/gmail/authorize', {
    retryOnUnauthorized: true,
  });
};

export const completeGmailOAuth = (
  payload: GmailOAuthCallbackPayload
): Promise<GmailOAuthCallbackResponse> => {
  return post<GmailOAuthCallbackResponse, GmailOAuthCallbackPayload>(
    '/mail-account-connections/gmail/callback',
    {
      body: payload,
      retryOnUnauthorized: true,
    }
  );
};
