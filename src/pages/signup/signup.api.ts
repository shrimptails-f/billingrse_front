import { apiFetch } from '@/lib/api/client';
import type { SignupFormValues } from './signup.schema';

export type SignupResponse = {
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

export const registerUser = (payload: SignupFormValues): Promise<SignupResponse> =>
  apiFetch('POST', '/auth/register', {
    body: payload,
  });
