import { useMutation } from '@tanstack/react-query';
import { verifyEmail, type VerifyEmailResponse } from '../api/verify-email.api';

export const useVerifyEmail = () => {
  return useMutation<VerifyEmailResponse, unknown, string>({
    mutationFn: (token: string) => verifyEmail(token),
  });
};
