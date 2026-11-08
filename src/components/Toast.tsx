'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastCtx {
  push: (text: string, kind?: ToastKind) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((text: string, kind: ToastKind = 'info') => {
    const id = ++seq;
    setItems((prev) => [...prev.slice(-4), { id, kind, text }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(
    () => ({
      push,
      success: (t: string) => push(t, 'success'),
      error: (t: string) => push(t, 'error'),
      info: (t: string) => push(t, 'info'),
    }),
    [push]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-md animate-[float_0.35s_ease] ${
              t.kind === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
                : t.kind === 'error'
                  ? 'bg-red-500/15 border-red-500/40 text-red-100'
                  : 'bg-slate-800/90 border-white/10 text-slate-100'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      push: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } as ToastCtx;
  }
  return ctx;
}
