import type { JSX } from 'react';
import { GmailOAuthCallbackContent } from '../components/GmailOAuthCallbackContent';

export const GmailOAuthCallbackPage = (): JSX.Element => {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-12">
      <GmailOAuthCallbackContent />
    </section>
  );
};
