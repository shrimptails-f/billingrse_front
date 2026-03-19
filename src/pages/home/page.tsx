const HomePage = (): JSX.Element => {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg backdrop-blur">
        <div className="space-y-3">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-slate-900">ログイン後ホーム</h1>
            <p className="text-base leading-7 text-slate-600">
              ログイン後に表示する画面だけを残した構成です。追加機能を戻す場合は、この画面を起点に再構成できます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
