import { post } from '@/shared/api/http';
import type { ResendEmailFormValues } from '../schema/resend-email.schema';

export type ResendEmailResponse = {
  message: string;
};

export const resendEmail = (payload: ResendEmailFormValues): Promise<ResendEmailResponse> => {
  return post<ResendEmailResponse, ResendEmailFormValues>('/auth/email/resend', {
    body: payload,
    attachAuthToken: false,
    retryOnUnauthorized: false,
  });
};
