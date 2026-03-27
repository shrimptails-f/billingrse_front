import { useEffect, useRef, useState, type JSX } from 'react';

type Props = {
  title?: string;
};

const APP_NAME = import.meta.env.VITE_APP_NAME || 'アプリケーション';

export const AppHeader = ({ title = APP_NAME }: Props): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="relative z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="page-shell flex h-14 items-center justify-between">
        <div className="text-base font-semibold tracking-wide text-emerald-700">{title}</div>

        <div className="flex items-center gap-3">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="メニュー"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="app-header-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="flex flex-col items-center gap-1">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            {isMenuOpen ? (
              <div
                id="app-header-menu"
                role="menu"
                aria-label="ヘッダーメニュー"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full flex-col rounded-xl px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm font-semibold text-slate-900">メールサービス連携</span>
                  <span className="text-xs leading-5 text-slate-500">
                    遷移先は未接続のプレースホルダーです
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログアウト
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
