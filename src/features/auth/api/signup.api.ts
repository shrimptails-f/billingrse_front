import { post } from '@/shared/api/http';
import type { SignupFormValues } from '../schema/signup.schema';

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

export const registerUser = (payload: SignupFormValues): Promise<SignupResponse> => {
  return post<SignupResponse, SignupFormValues>('/auth/register', {
    body: payload,
  });
};
