import type { JSX } from 'react';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { ResendEmailForm } from '../components/ResendEmailForm';

export const ResendEmailPage = (): JSX.Element => {
  return (
    <AuthScreenLayout>
      <ResendEmailForm />
    </AuthScreenLayout>
  );
};
