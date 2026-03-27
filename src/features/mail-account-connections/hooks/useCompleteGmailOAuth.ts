import { useMutation } from '@tanstack/react-query';
import { completeGmailOAuth } from '../api/gmail-oauth.api';
import type {
  GmailOAuthCallbackPayload,
  GmailOAuthCallbackResponse,
} from '../types/gmail-oauth.types';

export const useCompleteGmailOAuth = () => {
  return useMutation<GmailOAuthCallbackResponse, unknown, GmailOAuthCallbackPayload>({
    mutationFn: (payload: GmailOAuthCallbackPayload) => completeGmailOAuth(payload),
  });
};
