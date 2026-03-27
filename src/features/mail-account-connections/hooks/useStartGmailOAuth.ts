import { useMutation } from '@tanstack/react-query';
import { requestGmailAuthorization } from '../api/gmail-oauth.api';
import type { GmailAuthorizeResponse } from '../types/gmail-oauth.types';

export const useStartGmailOAuth = () => {
  return useMutation<GmailAuthorizeResponse, unknown, void>({
    mutationFn: () => requestGmailAuthorization(),
  });
};
