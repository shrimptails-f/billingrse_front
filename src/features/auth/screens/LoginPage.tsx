import type { JSX } from 'react';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = (): JSX.Element => {
  return (
    <AuthScreenLayout>
      <LoginForm />
    </AuthScreenLayout>
  );
};
