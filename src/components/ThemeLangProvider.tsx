'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'fr';

const dict = {
  en: {
    dashboard: 'Home',
    plans: 'Plans',
    invite: 'Invite',
    account: 'Account',
    totalBalance: 'Total Balance',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    today: 'Today',
    claim: 'Claim earnings',
    login: 'Login',
    signup: 'Sign up',
    logout: 'Logout',
    settings: 'Settings',
    users: 'Users',
    withdrawals: 'Withdrawals',
    transactions: 'Transactions',
    language: 'Language',
    theme: 'Theme',
    welcome: 'Welcome back',
    buyPlan: 'Buy plan',
    activePlans: 'Active plans',
    recentActivity: 'Recent activity',
    fullHistory: 'Full history',
    referralEarnings: 'Referral earnings',
    copyLink: 'Copy link',
    generateAddress: 'Generate deposit address',
    checkChain: 'Check chain now',
    pending: 'Pending',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading…',
    noData: 'No data yet',
    heroTitle: 'Earn USDT every single day',
    heroSub:
      'Choose a plan, claim daily yield, and grow with 20% referral commissions. Start free — no deposit required for your first Bronze plan.',
    getStarted: 'Start free — 3 USDT bonus',
    viewPlans: 'View plans',
  },
  fr: {
    dashboard: 'Accueil',
    plans: 'Plans',
    invite: 'Invitation',
    account: 'Compte',
    totalBalance: 'Solde total',
    deposit: 'Dépôt',
    withdraw: 'Retrait',
    today: "Aujourd'hui",
    claim: 'Réclamer les gains',
    login: 'Connexion',
    signup: "S'inscrire",
    logout: 'Déconnexion',
    settings: 'Paramètres',
    users: 'Utilisateurs',
    withdrawals: 'Retraits',
    transactions: 'Transactions',
    language: 'Langue',
    theme: 'Thème',
    welcome: 'Bon retour',
    buyPlan: 'Acheter un plan',
    activePlans: 'Plans actifs',
    recentActivity: 'Activité récente',
    fullHistory: 'Historique complet',
    referralEarnings: 'Gains de parrainage',
    copyLink: 'Copier le lien',
    generateAddress: 'Générer une adresse de dépôt',
    checkChain: 'Vérifier la chaîne',
    pending: 'En attente',
    completed: 'Terminé',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    save: 'Enregistrer',
    cancel: 'Annuler',
    loading: 'Chargement…',
    noData: 'Aucune donnée',
    heroTitle: 'Gagnez des USDT chaque jour',
    heroSub:
      'Choisissez un plan, réclamez le rendement quotidien et progressez avec 20 % de commission de parrainage. Commencez gratuitement.',
    getStarted: 'Commencer — 3 USDT offerts',
    viewPlans: 'Voir les plans',
  },
} as const;

export type TranslationKey = keyof (typeof dict)['en'];
export type Translations = Record<TranslationKey, string>;

type Ctx = {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  t: Translations;
};

const ThemeLangContext = createContext<Ctx | null>(null);

export function ThemeLangProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const th = (localStorage.getItem('theme') as Theme) || 'dark';
    const lg = (localStorage.getItem('lang') as Lang) || 'en';
    setThemeState(th);
    setLangState(lg);
    document.documentElement.classList.toggle('dark', th === 'dark');
    document.documentElement.classList.toggle('light', th === 'light');
    document.documentElement.lang = lg;
    setReady(true);
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
    () => ({ theme, lang, setTheme, setLang, t: dict[lang] as Translations }),
    [theme, lang]
  );

  return (
    <ThemeLangContext.Provider value={value}>
      <div style={{ visibility: ready ? 'visible' : 'hidden' }} className="min-h-screen">
        {children}
      </div>
    </ThemeLangContext.Provider>
  );
}

export function useThemeLang() {
  const ctx = useContext(ThemeLangContext);
  if (!ctx) throw new Error('useThemeLang outside provider');
  return ctx;
}

export function ThemeLangToggles() {
  const { theme, lang, setTheme, setLang } = useThemeLang();
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 flex items-center justify-center text-base transition"
        title="Theme"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        className="h-9 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-[11px] font-bold uppercase tracking-wide transition"
        title="Language"
        aria-label="Toggle language"
      >
        {lang}
      </button>
    </div>
  );
}
