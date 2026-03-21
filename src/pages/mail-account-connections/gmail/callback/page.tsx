import type { JSX } from 'react';
import { GmailOAuthCallbackContent } from './GmailOAuthCallbackContent';

const GmailOAuthCallbackPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <div className="page-shell flex min-h-screen items-center justify-center py-12">
        <GmailOAuthCallbackContent />
      </div>
    </div>
  );
};

export default GmailOAuthCallbackPage;
