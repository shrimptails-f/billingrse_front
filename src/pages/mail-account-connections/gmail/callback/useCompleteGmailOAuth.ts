'use client';

import { useMutation } from '@tanstack/react-query';
import { completeGmailOAuth } from '../gmail-oauth.api';
import type {
  GmailOAuthCallbackPayload,
  GmailOAuthCallbackResponse,
} from '../gmail-oauth.types';

export const useCompleteGmailOAuth = () =>
  useMutation<GmailOAuthCallbackResponse, unknown, GmailOAuthCallbackPayload>({
    mutationFn: (payload: GmailOAuthCallbackPayload) => completeGmailOAuth(payload),
  });
