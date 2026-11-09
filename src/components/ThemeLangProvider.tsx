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
      'Choose a plan, claim daily earnings, and earn 20% of friends’ paid-plan daily claims. Start free with Bronze — no deposit required.',
    getStarted: 'Start free — Bronze plan',
    viewPlans: 'View plans',
    changePassword: 'Change password',
    history: 'History',
    profile: 'Profile',
    depositNotes: 'Deposit guide',
    withdrawNotes: 'Withdrawal guide',
    calculator: 'Calculator',
    howItWorks: 'How it works',
    faq: 'FAQ',
    support: 'Support',
    terms: 'Terms',
    privacy: 'Privacy',
    home: 'Home',
    networkBadge: 'USDT TRC-20 · Daily earn',
    signupBonus: 'Free Bronze',
    referralCut: 'Referral cut',
    claimCycle: 'Claim cycle',
    usdtNetwork: 'USDT network',
    plansSub: 'Clear prices. Daily claims. Higher tiers unlock more USDT every day.',
    tryCalculator: 'Try the calculator',
    howTitle: 'How USDT Earn works',
    howSub: 'Four simple steps from signup to daily income',
    step1Title: 'Create free account',
    step1Desc: 'Sign up in seconds and receive the free Bronze plan instantly.',
    step2Title: 'Deposit USDT TRC-20',
    step2Desc: 'Send USDT on TRON. Auto-credit after on-chain confirmation.',
    step3Title: 'Buy an earn plan',
    step3Desc: 'Choose a paid tier. Higher plans unlock bigger daily claims.',
    step4Title: 'Claim every day',
    step4Desc: 'Claim each plan separately. Earnings go to withdrawal balance.',
    featuresTitle: 'Built for daily earners',
    featuresSub: 'Everything you need in one clean dashboard',
    feat1Title: 'Per-plan claims',
    feat1Desc: 'Claim Bronze, Silver, Gold separately each day.',
    feat2Title: '20% referral',
    feat2Desc: 'Earn 20% of friends’ daily claims from paid plans (not Bronze).',
    feat3Title: 'TRC-20 deposits',
    feat3Desc: 'USDT on TRON with automated verification.',
    feat4Title: 'Fast withdrawals',
    feat4Desc: 'Request anytime. Admin review in 2–3 hours.',
    ctaTitle: 'Ready to earn USDT?',
    ctaSub: 'Join USDT Earn today. Free Bronze plan on signup.',
    alreadyAccount: 'Already have an account?',
    claimFreePlan: 'Claim free plan',
    getThisPlan: 'Get this plan',
    daysDuration: 'days duration',
    dailyClaim: 'daily claim',
    totalEarn: 'total earn',
    freeOnSignup: 'Free on signup',
    rebuyAfter: 'Rebuy after expire',
    popularChoice: 'Popular choice',
    highDaily: 'High daily earn',
    maxReturns: 'Maximum returns',
    popular: 'Popular',
    bestValue: 'Best value',
    loginTitle: 'Welcome back',
    loginSub: 'Login to USDT Earn',
    emailOrUser: 'Email or username',
    password: 'Password',
    signingIn: 'Signing in…',
    noAccount: 'No account?',
    signUpGet3: 'Sign up & get free Bronze',
    createAccount: 'Create your account',
    get3Free: 'Get free Bronze on USDT Earn',
    username: 'Username',
    email: 'Email',
    passwordMin6: 'Password (min 6)',
    referralOptional: 'Referral code (optional)',
    creating: 'Creating…',
    signUpBtn: 'Sign Up & Get Free Bronze',
    bonus3: 'Free Bronze',
    dailyClaims: 'Daily claims',
    ref20: '20% referral',
    calcTitle: 'Earn calculator',
    calcSub: 'Estimate daily and cycle earnings before you buy a plan.',
    numberOfPlans: 'Number of plans',
    investment: 'Investment',
    dailyClaimLabel: 'Daily claim',
    cycleEarn: 'Cycle earn',
    roiLabel: 'ROI on plan price',
    startEarning: 'Start earning — free Bronze',
    getStartedArrow: 'Get started →',
    faqTitle: 'FAQ',
    faqSub: 'Answers to common questions about USDT Earn.',
    adminConsole: 'Admin Console',
    adminSub: 'USDT Earn control center',
    enterDashboard: 'Enter dashboard',
    backToSite: '← Back to site',
    planLabel: 'Plan',
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
      'Choisissez un plan, réclamez les gains quotidiens et gagnez 20 % des claims des plans payants de vos amis. Bronze gratuit à l’inscription.',
    getStarted: 'Commencer — plan Bronze',
    viewPlans: 'Voir les plans',
    changePassword: 'Changer le mot de passe',
    history: 'Historique',
    profile: 'Profil',
    depositNotes: 'Guide de dépôt',
    withdrawNotes: 'Guide de retrait',
    calculator: 'Calculateur',
    howItWorks: 'Comment ça marche',
    faq: 'FAQ',
    support: 'Assistance',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    home: 'Accueil',
    networkBadge: 'USDT TRC-20 · Gains quotidiens',
    signupBonus: 'Bronze gratuit',
    referralCut: 'Commission parrainage',
    claimCycle: 'Cycle de claim',
    usdtNetwork: 'Réseau USDT',
    plansSub: 'Prix clairs. Claims quotidiens. Les niveaux élevés débloquent plus d’USDT chaque jour.',
    tryCalculator: 'Essayer le calculateur',
    howTitle: 'Comment fonctionne USDT Earn',
    howSub: 'Quatre étapes simples de l’inscription au revenu quotidien',
    step1Title: 'Créer un compte gratuit',
    step1Desc: 'Inscrivez-vous en quelques secondes et recevez le plan Bronze gratuit.',
    step2Title: 'Déposer USDT TRC-20',
    step2Desc: 'Envoyez des USDT sur TRON. Crédit auto après confirmation on-chain.',
    step3Title: 'Acheter un plan',
    step3Desc: 'Choisissez un niveau payant. Les plans élevés offrent de plus grands claims.',
    step4Title: 'Réclamer chaque jour',
    step4Desc: 'Réclamez chaque plan séparément. Les gains vont au solde de retrait.',
    featuresTitle: 'Conçu pour gagner chaque jour',
    featuresSub: 'Tout ce dont vous avez besoin dans un seul tableau de bord',
    feat1Title: 'Claims par plan',
    feat1Desc: 'Réclamez Bronze, Silver, Gold séparément chaque jour.',
    feat2Title: '20 % de parrainage',
    feat2Desc: '20 % des claims quotidiens des plans payants de vos amis (pas le Bronze).',
    feat3Title: 'Dépôts TRC-20',
    feat3Desc: 'USDT sur TRON avec vérification automatisée.',
    feat4Title: 'Retraits rapides',
    feat4Desc: 'Demandez à tout moment. Validation admin en 2–3 heures.',
    ctaTitle: 'Prêt à gagner des USDT ?',
    ctaSub: 'Rejoignez USDT Earn. Plan Bronze gratuit à l’inscription.',
    alreadyAccount: 'Vous avez déjà un compte ?',
    claimFreePlan: 'Obtenir le plan gratuit',
    getThisPlan: 'Prendre ce plan',
    daysDuration: 'jours de durée',
    dailyClaim: 'claim quotidien',
    totalEarn: 'gain total',
    freeOnSignup: 'Gratuit à l’inscription',
    rebuyAfter: 'Racheter après expiration',
    popularChoice: 'Choix populaire',
    highDaily: 'Gain quotidien élevé',
    maxReturns: 'Rendement maximum',
    popular: 'Populaire',
    bestValue: 'Meilleure valeur',
    loginTitle: 'Bon retour',
    loginSub: 'Connexion à USDT Earn',
    emailOrUser: 'E-mail ou nom d’utilisateur',
    password: 'Mot de passe',
    signingIn: 'Connexion…',
    noAccount: 'Pas de compte ?',
    signUpGet3: 'S’inscrire et recevoir Bronze',
    createAccount: 'Créer votre compte',
    get3Free: 'Bronze gratuit sur USDT Earn',
    username: 'Nom d’utilisateur',
    email: 'E-mail',
    passwordMin6: 'Mot de passe (min. 6)',
    referralOptional: 'Code de parrainage (optionnel)',
    creating: 'Création…',
    signUpBtn: 'S’inscrire et recevoir Bronze',
    bonus3: 'Bronze gratuit',
    dailyClaims: 'Claims quotidiens',
    ref20: '20 % parrainage',
    calcTitle: 'Calculateur de gains',
    calcSub: 'Estimez les gains quotidiens et du cycle avant d’acheter un plan.',
    numberOfPlans: 'Nombre de plans',
    investment: 'Investissement',
    dailyClaimLabel: 'Claim quotidien',
    cycleEarn: 'Gain du cycle',
    roiLabel: 'ROI sur le prix du plan',
    startEarning: 'Commencer — Bronze gratuit',
    getStartedArrow: 'Commencer →',
    faqTitle: 'FAQ',
    faqSub: 'Réponses aux questions fréquentes sur USDT Earn.',
    adminConsole: 'Console Admin',
    adminSub: 'Centre de contrôle USDT Earn',
    enterDashboard: 'Entrer au tableau de bord',
    backToSite: '← Retour au site',
    planLabel: 'Plan',
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
