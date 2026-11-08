'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
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
      'Choose a plan, claim daily earnings, and grow with 20% referral commissions. Start free — no deposit required for your first Bronze plan.',
    getStarted: 'Start free — 3 USDT bonus',
    viewPlans: 'View plans',
    changePassword: 'Change password',
    history: 'History',
    profile: 'Profile',
    depositNotes: 'Deposit guide',
    withdrawNotes: 'Withdrawal guide',
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
      'Choisissez un plan, réclamez les gains quotidiens et progressez avec 20 % de commission de parrainage. Commencez gratuitement.',
    getStarted: 'Commencer — 3 USDT offerts',
    viewPlans: 'Voir les plans',
    changePassword: 'Changer le mot de passe',
    history: 'Historique',
    profile: 'Profil',
    depositNotes: 'Guide de dépôt',
    withdrawNotes: 'Guide de retrait',
  },
} as const;

export type TranslationKey = keyof (typeof dict)['en'];
export type Translations = Record<TranslationKey, string>;

type Ctx = {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: Translations;
};

const ThemeLangContext = createContext<Ctx | null>(null);

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(t);
  root.setAttribute('data-theme', t);
  root.style.colorScheme = t;
}

export function ThemeLangProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let th: Theme = 'dark';
    let lg: Lang = 'en';
    try {
      const storedTh = localStorage.getItem('theme');
      const storedLg = localStorage.getItem('lang');
      if (storedTh === 'light' || storedTh === 'dark') th = storedTh;
      if (storedLg === 'fr' || storedLg === 'en') lg = storedLg;
    } catch {
      /* ignore */
    }
    setThemeState(th);
    setLangState(lg);
    applyTheme(th);
    document.documentElement.lang = lg;
    setReady(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('theme', t);
    } catch {
      /* ignore */
    }
    applyTheme(t);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* ignore */
      }
      applyTheme(next);
      return next;
    });
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === 'en' ? 'fr' : 'en';
      try {
        localStorage.setItem('lang', next);
      } catch {
        /* ignore */
      }
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      lang,
      setTheme,
      setLang,
      toggleTheme,
      toggleLang,
      t: dict[lang] as Translations,
    }),
    [theme, lang, setTheme, setLang, toggleTheme, toggleLang]
  );

  return (
    <ThemeLangContext.Provider value={value}>
      <div className={ready ? 'min-h-screen app-shell' : 'min-h-screen app-shell opacity-0'}>
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
  const { theme, lang, toggleTheme, toggleLang, t } = useThemeLang();
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleTheme}
        className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/40 flex items-center justify-center text-base transition"
        title={t.theme}
        aria-label={t.theme}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
      <button
        type="button"
        onClick={toggleLang}
        className="h-9 min-w-[2.5rem] px-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/40 text-[11px] font-bold uppercase tracking-wide transition"
        title={t.language}
        aria-label={t.language}
      >
        {lang === 'en' ? 'EN' : 'FR'}
      </button>
    </div>
  );
}
