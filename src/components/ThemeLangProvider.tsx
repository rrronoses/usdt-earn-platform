'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light';
type Lang = 'en' | 'fr';

const dict = {
  en: {
    dashboard: 'Dashboard',
    plans: 'Plans',
    invite: 'Invite',
    account: 'Account',
    totalBalance: 'Total Balance',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    today: 'Today',
    claim: 'Claim daily earnings',
    login: 'Login',
    signup: 'Sign up',
    logout: 'Logout',
    settings: 'Settings',
    users: 'Users',
    withdrawals: 'Withdrawals',
    transactions: 'Transactions',
    language: 'Language',
    theme: 'Theme',
  },
  fr: {
    dashboard: 'Tableau de bord',
    plans: 'Plans',
    invite: 'Invitation',
    account: 'Compte',
    totalBalance: 'Solde total',
    deposit: 'Dépôt',
    withdraw: 'Retrait',
    today: "Aujourd'hui",
    claim: 'Réclamer les gains du jour',
    login: 'Connexion',
    signup: "S'inscrire",
    logout: 'Déconnexion',
    settings: 'Paramètres',
    users: 'Utilisateurs',
    withdrawals: 'Retraits',
    transactions: 'Transactions',
    language: 'Langue',
    theme: 'Thème',
  },
} as const;

type Ctx = {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  t: (typeof dict)['en'];
};

const ThemeLangContext = createContext<Ctx | null>(null);

export function ThemeLangProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const th = (localStorage.getItem('theme') as Theme) || 'dark';
    const lg = (localStorage.getItem('lang') as Lang) || 'en';
    setThemeState(th);
    setLangState(lg);
    document.documentElement.classList.toggle('dark', th === 'dark');
    document.documentElement.classList.toggle('light', th === 'light');
    document.documentElement.lang = lg;
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.classList.toggle('light', t === 'light');
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  };

  const value = useMemo(
    () => ({ theme, lang, setTheme, setLang, t: dict[lang] }),
    [theme, lang]
  );

  return <ThemeLangContext.Provider value={value}>{children}</ThemeLangContext.Provider>;
}

export function useThemeLang() {
  const ctx = useContext(ThemeLangContext);
  if (!ctx) throw new Error('useThemeLang outside provider');
  return ctx;
}

export function ThemeLangToggles() {
  const { theme, lang, setTheme, setLang } = useThemeLang();
  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="px-2 py-1 rounded-lg border border-slate-600 hover:border-emerald-500/50"
        title="Theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        className="px-2 py-1 rounded-lg border border-slate-600 hover:border-emerald-500/50 uppercase"
        title="Language"
      >
        {lang}
      </button>
    </div>
  );
}
