/** User-facing labels for stored enum values (KV types stay stable). */

export function txTypeLabel(type: string): string {
  const map: Record<string, string> = {
    deposit: 'deposit',
    withdrawal: 'withdrawal',
    yield: 'earn',
    referral: 'referral',
    plan_purchase: 'plan purchase',
    signup_bonus: 'signup bonus',
    admin_add: 'admin add',
    admin_sub: 'admin sub',
  };
  return map[type] || type;
}
