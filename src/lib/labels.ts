/** User-facing labels for stored enum values. */

export function txTypeLabel(type: string): string {
  const map: Record<string, string> = {
    deposit: 'deposit',
    withdrawal: 'withdrawal',
    earn: 'earn',
    yield: 'earn', // legacy stored type
    referral: 'referral',
    plan_purchase: 'plan purchase',
    signup_bonus: 'signup bonus',
    admin_add: 'admin add',
    admin_sub: 'admin sub',
  };
  return map[type] || type;
}

/** True if transaction is a daily-claim earn row (new or legacy). */
export function isEarnTxType(type: string): boolean {
  return type === 'earn' || type === 'yield';
}
