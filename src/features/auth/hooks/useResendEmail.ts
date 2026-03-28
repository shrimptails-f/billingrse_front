import { useMutation } from '@tanstack/react-query';
import { resendEmail, type ResendEmailResponse } from '../api/resend-email.api';
import type { ResendEmailFormValues } from '../schema/resend-email.schema';

export const useResendEmail = () => {
  return useMutation<ResendEmailResponse, unknown, ResendEmailFormValues>({
    mutationFn: (payload: ResendEmailFormValues) => resendEmail(payload),
  });
};
