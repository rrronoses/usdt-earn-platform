/** Shared API payload contracts — prefer these over `any`. */

export interface ApiOk<T extends Record<string, unknown> = Record<string, unknown>> {
  ok: true;
  message?: string;
  data?: T;
}

export interface ApiErr {
  ok: false;
  message: string;
  code?: string;
}

export type ApiResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | (ApiOk<T> & T)
  | ApiErr;

export interface LoginRequest {
  login?: string;
  email?: string;
  username?: string;
  password: string;
  asAdmin?: boolean;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface DepositCreateRequest {
  amount: number;
}

export interface DepositCreateResponse {
  ok: boolean;
  depositId?: string;
  address?: string;
  network?: string;
  amount?: number;
  message?: string;
  contract?: string;
}

export interface ClaimRequest {
  userPlanId: string;
}

export interface ClaimResponse {
  ok: boolean;
  claimed?: number;
  planName?: string;
  userPlanId?: string;
  withdrawalBalance?: number;
  message?: string;
}

export interface WithdrawRequest {
  amount: number;
  address: string;
}
