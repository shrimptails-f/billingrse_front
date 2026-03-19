import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/primitives/Button';

const HomePage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-slate-900">ログイン後ホーム</h1>
            <p className="text-base leading-7 text-slate-600">
              ログイン後に表示する画面だけを残した構成です。追加機能を戻す場合は、この画面を起点に再構成できます。
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-700">Gmail OAuth</p>
              <h2 className="text-xl font-bold text-slate-900">Gmail 連携を開始する</h2>
              <p className="text-sm leading-6 text-slate-600">
                Google の認可画面へ移動して Gmail
                を連携します。完了後はこのアプリに戻って結果を確認できます。
              </p>
              <Button
                type="button"
                fullWidth={false}
                onClick={() => navigate('/mail-account-connections/gmail', { replace: true })}
              >
                Gmail 連携へ進む
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
