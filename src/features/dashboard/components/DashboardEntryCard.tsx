import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/primitives/Button';

export const DashboardEntryCard = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">ログイン後ホーム</h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          ログイン後に利用する画面への導線をまとめています。請求集計や手動メール取得はここから遷移してください。
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          fullWidth={false}
          className="w-full sm:w-auto"
          onClick={() => navigate('/billing-summary')}
        >
          請求集計を開く
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          className="w-full sm:w-auto"
          onClick={() => navigate('/manual-mail-workflows')}
        >
          手動メール取得を開く
        </Button>
      </div>
    </section>
  );
};
