export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  balance: {
    total: number;
    deposit: number;
    withdrawal: number;
    earnings: number;
  };
  todayEarnings: number;
  lastClaimDate: string | null;
  plans: PurchasedPlan[];
  referrals: string[];
  referralEarnings: number;
  referredBy: string | null;
  transactions: Transaction[];
  banned: boolean;
  createdAt: string;
  avatarSeed: string;
}

export interface PurchasedPlan {
  id: string;
  planId: string;
  name: string;
  price: number;
  durationDays: number;
  dailyEarn: number;
  purchasedAt: string;
  expiresAt: string;
  lastClaimAt: string | null;
  claimedDays: number;
  active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  dailyEarn: number;
  oneTime: boolean;
  color: string;
  badge?: string;
  active?: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'earn' | 'plan_purchase' | 'referral' | 'admin_add' | 'admin_sub' | 'signup_bonus';
  amount: number;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  description: string;
  createdAt: string;
  address?: string;
  relatedUserId?: string;
  txHash?: string;
}

export interface DepositAddress {
  id: string;
  network: string;
  address: string;
  active: boolean;
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
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface PlatformSettings {
  minWithdrawal: number;
  depositExpiryMinutes: number;
  withdrawalNote: string;
}

export interface AppState {
  users: User[];
  plans: Plan[];
  depositAddresses: DepositAddress[];
  depositRequests: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  settings: PlatformSettings;
  admin: { username: string; password: string };
  currentUserId: string | null;
  isAdmin: boolean;
}
