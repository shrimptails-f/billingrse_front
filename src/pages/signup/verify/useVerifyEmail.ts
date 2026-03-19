'use client';

import { useMutation } from '@tanstack/react-query';
import { verifyEmail, type VerifyEmailResponse } from './verify-email.api';

export const useVerifyEmail = () =>
  useMutation<VerifyEmailResponse, unknown, string>({
    mutationFn: (token: string) => verifyEmail(token),
  });
