import { post } from '@/shared/api/http';

export type VerifyEmailResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified: boolean;
    email_verified_at: string | null;
    created_at: string;
  };
};

export const verifyEmail = (token: string): Promise<VerifyEmailResponse> => {
  return post<VerifyEmailResponse, { token: string }>('/auth/email/verify', {
    body: { token },
    attachAuthToken: false,
    credentials: 'omit',
  });
};
