import type { JSX } from 'react';
import { Link } from 'react-router-dom';

export const SignupPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900">
      <div className="page-shell flex min-h-screen items-center justify-center py-12">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Auth
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">会員登録</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ここに会員登録フォームを実装します。認証系の screen は `features/auth` 配下に集約します。
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              to="/login"
            >
              ログインへ戻る
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
