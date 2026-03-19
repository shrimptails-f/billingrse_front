import { Suspense, type JSX } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { VerifyEmailContent } from './VerifyEmailContent';

const VerifyEmailPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <div className="page-shell flex min-h-screen items-center justify-center py-12">
        <Suspense fallback={<Spinner size={24} className="text-emerald-600" label="読み込み中" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
