'use client';

import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { useThemeLang } from '@/components/ThemeLangProvider';

const FAQS_EN = [
  {
    q: 'How do I start?',
    a: 'Create a free account. You receive 3 USDT and a Bronze plan automatically. Claim daily earnings from the dashboard.',
  },
  {
    q: 'Which network is used for deposits?',
    a: 'Only USDT on TRON (TRC-20). Sending on another network may result in permanent loss.',
  },
  {
    q: 'How are deposits credited?',
    a: 'After you generate a deposit address and send the exact USDT amount, our system verifies the transfer on-chain and credits your deposit balance automatically.',
  },
  {
    q: 'How do claims work?',
    a: 'Each active plan can be claimed once every 24 hours. If you hold multiple plans, claim each plan separately.',
  },
  {
    q: 'What is the referral program?',
    a: 'Share your referral link. When a referred user buys a paid plan, you earn 20% commission to your withdrawal balance.',
  },
  {
    q: 'What is the minimum withdrawal?',
    a: 'The minimum is set by the administrator (default 25 USDT). Withdrawals are reviewed and typically processed within a few hours.',
  },
  {
    q: 'Can I buy the same plan more than once?',
    a: 'Bronze is granted once at signup. Paid plans can be purchased again after the previous one expires.',
  },
];

const FAQS_FR = [
  {
    q: 'Comment commencer ?',
    a: 'Créez un compte gratuit. Vous recevez 3 USDT et un plan Bronze automatiquement. Réclamez les gains depuis le tableau de bord.',
  },
  {
    q: 'Quel réseau pour les dépôts ?',
    a: 'Uniquement USDT sur TRON (TRC-20). Un envoi sur un autre réseau peut entraîner une perte définitive.',
  },
  {
    q: 'Comment les dépôts sont-ils crédités ?',
    a: 'Après génération d’une adresse et envoi du montant exact, le système vérifie la transaction on-chain et crédite automatiquement le solde de dépôt.',
  },
  {
    q: 'Comment fonctionnent les claims ?',
    a: 'Chaque plan actif peut être réclamé une fois toutes les 24 heures. Avec plusieurs plans, réclamez chacun séparément.',
  },
  {
    q: 'Qu’est-ce que le programme de parrainage ?',
    a: 'Partagez votre lien. Quand un filleul achète un plan payant, vous gagnez 20 % de commission sur le solde de retrait.',
  },
  {
    q: 'Quel est le retrait minimum ?',
    a: 'Le minimum est défini par l’administrateur (25 USDT par défaut). Les retraits sont traités en quelques heures.',
  },
  {
    q: 'Puis-je racheter le même plan ?',
    a: 'Bronze est accordé une fois à l’inscription. Les plans payants peuvent être rachetés après expiration.',
  },
];

export default function FaqPage() {
  const { t, lang } = useThemeLang();
  const faqs = lang === 'fr' ? FAQS_FR : FAQS_EN;

  return (
    <div className="page-shell">
      <PublicHeader rightLink={{ href: '/support', label: t.support }} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2">{t.faqTitle}</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          {t.faqSub}
        </p>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group panel-card open:border-emerald-500/30"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-semibold flex items-center justify-between gap-3">
                {item.q}
                <span className="group-open:rotate-45 transition text-lg" style={{ color: 'var(--muted)' }}>
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
        <p className="text-center mt-10">
          <Link href="/" className="text-sm text-emerald-500 font-medium">
            ← {t.home}
          </Link>
        </p>
      </main>
    </div>
  );
}
