import type { JSX } from 'react';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { EmailSentContent } from '../components/EmailSentContent';

export const SignupEmailSentPage = (): JSX.Element => {
  return (
    <AuthScreenLayout>
      <EmailSentContent />
    </AuthScreenLayout>
  );
};
