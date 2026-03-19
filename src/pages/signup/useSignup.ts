'use client';

import { useMutation } from '@tanstack/react-query';
import type { SignupFormValues } from './signup.schema';
import { registerUser, type SignupResponse } from './signup.api';

export const useSignup = () =>
  useMutation<SignupResponse, unknown, SignupFormValues>({
    mutationFn: (payload: SignupFormValues) => registerUser(payload),
  });
