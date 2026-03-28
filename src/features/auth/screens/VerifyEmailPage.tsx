import type { JSX } from 'react';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { VerifyEmailContent } from '../components/VerifyEmailContent';

export const VerifyEmailPage = (): JSX.Element => {
  return (
    <AuthScreenLayout>
      <VerifyEmailContent />
    </AuthScreenLayout>
  );
};
