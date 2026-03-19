'use client';

import { useMutation } from '@tanstack/react-query';
import { requestGmailAuthorization } from './gmail-oauth.api';
import type { GmailAuthorizeResponse } from './gmail-oauth.types';

export const useStartGmailOAuth = () =>
  useMutation<GmailAuthorizeResponse, unknown, void>({
    mutationFn: () => requestGmailAuthorization(),
  });
