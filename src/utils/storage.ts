import type { AppState } from '../types';
import { DEFAULT_PLANS } from '../data/plans';

const LOCAL_KEY = 'usdt_earn_app_v3';
const API_URL = '/api/state';

export const defaultState: Omit<AppState, 'currentUserId' | 'isAdmin'> = {
  users: [],
  plans: DEFAULT_PLANS,
  depositAddresses: [
    {
      id: '1',
      network: 'TRC20',
      address: 'TXyz1234567890abcdefghijklmnopqrstuv',
      active: true,
    },
  ],
  depositRequests: [],
  withdrawals: [],
  settings: {
    minWithdrawal: 7,
    depositExpiryMinutes: 30,
    withdrawalNote: 'Withdrawal is processed in 2-3 hours after admin approval.',
  },
  admin: {
    username: 'admin',
    password: 'admin123',
  },
};

export async function loadStateFromKV(): Promise<Omit<AppState, 'currentUserId' | 'isAdmin'>> {
  try {
    const res = await fetch(API_URL, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        return normalize(data);
      }
    }
  } catch (e) {
    console.warn('KV fetch failed, using localStorage', e);
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {}
  return { ...defaultState };
}

function normalize(data: any): Omit<AppState, 'currentUserId' | 'isAdmin'> {
  return {
    users: data.users || [],
    plans: data.plans?.length ? data.plans : DEFAULT_PLANS,
    depositAddresses: data.depositAddresses?.length ? data.depositAddresses : defaultState.depositAddresses,
    depositRequests: data.depositRequests || [],
    withdrawals: data.withdrawals || [],
    settings: {
      minWithdrawal: data.settings?.minWithdrawal ?? 7,
      depositExpiryMinutes: data.settings?.depositExpiryMinutes ?? 30,
      withdrawalNote: data.settings?.withdrawalNote ?? defaultState.settings.withdrawalNote,
    },
    admin: data.admin || defaultState.admin,
  };
}

export async function saveStateToKV(state: Omit<AppState, 'currentUserId' | 'isAdmin'>) {
  const toSave = {
    users: state.users,
    plans: state.plans,
    depositAddresses: state.depositAddresses,
    depositRequests: state.depositRequests,
    withdrawals: state.withdrawals,
    settings: state.settings,
    admin: state.admin,
  };
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(toSave));
  } catch {}

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    });
    if (!res.ok) console.warn('KV save failed', await res.text());
  } catch (e) {
    console.warn('KV save network error', e);
  }
}

export function generateUserId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `U${num}`;
}

export function generateId(prefix = 'tx'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatUSDT(amount: number): string {
  return Number(amount).toFixed(2);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function isSameDay(d1: string | null, d2: string): boolean {
  if (!d1) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getTodayISO(): string {
  return new Date().toISOString();
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
