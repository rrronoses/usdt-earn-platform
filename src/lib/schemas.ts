import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().trim().min(1).optional(),
  email: z.string().trim().optional(),
  username: z.string().trim().optional(),
  password: z.string().min(1, 'Password required'),
  asAdmin: z.boolean().optional(),
});

export const signupSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(32),
  email: z.string().trim().email('Valid email required').max(120),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  referralCode: z.string().trim().max(32).optional(),
});

export const depositCreateSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive').max(1_000_000),
});

export const depositVerifySchema = z.object({
  depositId: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  all: z.boolean().optional(),
});

export const claimSchema = z.object({
  userPlanId: z.string().trim().min(1, 'userPlanId required'),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  address: z
    .string()
    .trim()
    .regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, 'Invalid TRON TRC-20 address'),
});

export const buyPlanSchema = z.object({
  planId: z.string().trim().min(1),
});

export const adminUserActionSchema = z.object({
  action: z.enum(['ban', 'unban', 'delete', 'adjustBalance']),
  userId: z.string().trim().min(1),
  amount: z.coerce.number().optional(),
  balanceType: z.enum(['deposit', 'withdrawal']).optional(),
});

export const adminWithdrawalActionSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(['approve', 'reject']),
});

export const adminSettingsSchema = z.object({
  minWithdrawalLimit: z.coerce.number().min(0).optional(),
  minDepositLimit: z.coerce.number().min(0).optional(),
  maxDepositLimit: z.coerce.number().min(0).optional(),
  depositExpiryMinutes: z.coerce.number().min(1).max(1440).optional(),
  withdrawalNote: z.string().max(500).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type DepositCreateInput = z.infer<typeof depositCreateSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
