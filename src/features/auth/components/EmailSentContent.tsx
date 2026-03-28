import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/primitives/Button';
import { useLastRegisteredEmail } from '../hooks/useLastRegisteredEmail';

export const EmailSentContent = (): JSX.Element => {
  const navigate = useNavigate();
  const { email } = useLastRegisteredEmail();

  return (
    <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
      <div className="mb-6 space-y-3">
        <p className="text-sm font-semibold text-emerald-600">メールを送信しました</p>
        <h1 className="text-2xl font-bold text-slate-900">確認メールをチェックしてください</h1>
        <p className="text-sm text-slate-600">
          ご登録のメールアドレス宛に確認メールをお送りしました。メール内のリンクをクリックして認証を完了してください。
        </p>
      </div>

      {email ? (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {email}
        </div>
      ) : null}

      <div className="mb-8 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p>メールが届かない場合は、以下をご確認ください：</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>迷惑メールフォルダに振り分けられていないか</li>
          <li>受信まで数分かかる場合があります</li>
          <li>メール再送は現在非対応です。お手数ですが時間をおいて再度お試しください。</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Button type="button" onClick={() => navigate('/login', { replace: true })}>
          ログイン画面へ戻る
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/signup', { replace: true })}
        >
          会員登録に戻る
        </Button>
      </div>
    </section>
  );
};
