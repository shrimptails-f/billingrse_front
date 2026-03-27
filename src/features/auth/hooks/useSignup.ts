import { useMutation } from '@tanstack/react-query';
import { registerUser, type SignupResponse } from '../api/signup.api';
import type { SignupFormValues } from '../schema/signup.schema';

export const useSignup = () => {
  return useMutation<SignupResponse, unknown, SignupFormValues>({
    mutationFn: (payload: SignupFormValues) => registerUser(payload),
  });
};
