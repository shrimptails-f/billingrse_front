import { apiFetch } from '@/lib/api/client';

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

export const verifyEmail = (token: string): Promise<VerifyEmailResponse> =>
  apiFetch('POST', '/auth/email/verify', {
    body: { token },
    attachAuthToken: false,
    credentials: 'omit',
  });
