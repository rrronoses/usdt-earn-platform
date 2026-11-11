/** Transaction types. `yield` kept only for reading legacy KV rows; new writes use `earn`. */
export type TxType =
  | 'deposit'
  | 'withdrawal'
  | 'earn'
  | 'yield' // legacy
  | 'referral'
  | 'plan_purchase'
  | 'signup_bonus'
  | 'admin_add'
  | 'admin_sub';
export type TxStatus = 'pending' | 'completed' | 'rejected' | 'approved';
export type UserStatus = 'active' | 'banned';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  depositBalance: number;
  withdrawalBalance: number;
  todayEarnings: number;
  lastClaimDate: string | null;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  referralEarnings: number;
  status: UserStatus;
  createdAt: string;
  avatarSeed: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  dailyEarn: number;
  dailyYield?: number;
  isOneTime: boolean;
  active: boolean;
  color: string;
  badge?: string;
}

export interface UserPlan {
  userPlanId: string;
  planId: string;
  name: string;
  price: number;
  dailyEarn: number;
  dailyYield?: number;
  durationDays: number;
  purchaseDate: string;
  expiryDate: string;
  lastClaimedAt: string | null;
  claimedDays: number;
  status: 'active' | 'expired';
}

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  description: string;
  timestamp: string;
  txHash?: string;
  address?: string;
  relatedUserId?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  address: string;
  network: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  txHash?: string;
  note?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  destinationAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface SystemConfig {
  minWithdrawalLimit: number;
  minDepositLimit: number;
  maxDepositLimit: number;
  depositAddress: string;
  depositNetwork: string;
  depositExpiryMinutes: number;
  depositPollSeconds: number;
  withdrawalNote: string;
  supportTelegram: string;
  supportEmail: string;
  adminUsername: string;
  adminPasswordHash: string;
}

export interface Analytics {
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnPaid: number;
  totalYieldPaid?: number;
  totalUsers: number;
  paidUsersCount: number;
}

export const DEFAULT_PLANS: Plan[] = [
  { id: 'bronze', name: 'Bronze', price: 3, durationDays: 7, dailyEarn: 1, isOneTime: true, active: true, color: 'from-amber-700 to-amber-500', badge: 'Starter' },
  { id: 'silver', name: 'Silver', price: 10, durationDays: 28, dailyEarn: 1, isOneTime: false, active: true, color: 'from-slate-400 to-slate-200', badge: 'Popular' },
  { id: 'gold', name: 'Gold', price: 25, durationDays: 28, dailyEarn: 2, isOneTime: false, active: true, color: 'from-yellow-500 to-amber-400' },
  { id: 'gold-plus', name: 'Gold Plus', price: 40, durationDays: 28, dailyEarn: 5, isOneTime: false, active: true, color: 'from-yellow-600 to-orange-400' },
  { id: 'platinum', name: 'Platinum', price: 60, durationDays: 28, dailyEarn: 7, isOneTime: false, active: true, color: 'from-cyan-400 to-blue-500', badge: 'Best Value' },
];

export const DEFAULT_CONFIG: SystemConfig = {
  minWithdrawalLimit: 25,
  minDepositLimit: 1,
  maxDepositLimit: 10000,
  depositAddress: '',
  depositNetwork: 'TRC20',
  depositExpiryMinutes: 30,
  depositPollSeconds: 60,
  withdrawalNote: 'Withdrawals are processed within 2-3 hours following administrative review.',
  supportTelegram: 'https://t.me/',
  supportEmail: 'support@usdtearn.pages.dev',
  adminUsername: 'admin',
  adminPasswordHash: 'admin1234',
};

export const DEFAULT_ANALYTICS: Analytics = {
  totalDeposits: 0,
  totalWithdrawals: 0,
  totalEarnPaid: 0,
  totalUsers: 0,
  paidUsersCount: 0,
};

export interface DepositAddress {
  id: string;
  network: 'TRC20';
  address: string;
  label?: string;
  active: boolean;
  createdAt: string;
}

export interface DepositWatch {
  depositId: string;
  userId: string;
  address: string;
  expectedAmount: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  matchedTxId?: string;
  creditedAmount?: number;
}

export function planDailyEarn(p: { dailyEarn?: number; dailyYield?: number }): number {
  return Number(p.dailyEarn ?? p.dailyYield ?? 0) || 0;
}

export function analyticsEarnPaid(a: { totalEarnPaid?: number; totalYieldPaid?: number }): number {
  return Number(a.totalEarnPaid ?? a.totalYieldPaid ?? 0) || 0;
}
