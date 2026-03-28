import type { JSX } from 'react';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { SignupForm } from '../components/SignupForm';

export const SignupPage = (): JSX.Element => {
  return (
    <AuthScreenLayout>
      <SignupForm />
    </AuthScreenLayout>
  );
};
