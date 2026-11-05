import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  USDTSTORAGE: KVNamespace;
}

const STATE_KEY = 'app_state';

const DEFAULT_STATE = {
  users: [],
  plans: [
    { id: 'bronze', name: 'Bronze', price: 3, durationDays: 7, dailyEarn: 1, oneTime: true, color: 'from-amber-700 to-amber-500', badge: 'Starter', active: true },
    { id: 'silver', name: 'Silver', price: 10, durationDays: 28, dailyEarn: 1, oneTime: false, color: 'from-slate-400 to-slate-200', badge: 'Popular', active: true },
    { id: 'gold', name: 'Gold', price: 25, durationDays: 28, dailyEarn: 2, oneTime: false, color: 'from-yellow-500 to-amber-400', active: true },
    { id: 'gold-plus', name: 'Gold Plus', price: 40, durationDays: 28, dailyEarn: 5, oneTime: false, color: 'from-yellow-600 to-orange-400', active: true },
    { id: 'platinum', name: 'Platinum', price: 60, durationDays: 28, dailyEarn: 7, oneTime: false, color: 'from-cyan-400 to-blue-500', badge: 'Best Value', active: true },
  ],
  depositAddresses: [
    { id: '1', network: 'TRC20', address: 'TXyz1234567890abcdefghijklmnopqrstuv', active: true },
  ],
  depositRequests: [],
  withdrawals: [],
  settings: {
    minWithdrawal: 7,
    depositExpiryMinutes: 30,
    withdrawalNote: 'Withdrawal is processed in 2-3 hours after admin approval.',
  },
  admin: { username: 'admin', password: 'admin123' },
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const raw = await context.env.USDTSTORAGE.get(STATE_KEY);
    if (!raw) {
      await context.env.USDTSTORAGE.put(STATE_KEY, JSON.stringify(DEFAULT_STATE));
      return Response.json(DEFAULT_STATE, {
        headers: corsHeaders(),
      });
    }
    const state = JSON.parse(raw);
    if (!state.plans || !Array.isArray(state.plans) || state.plans.length === 0) {
      state.plans = DEFAULT_STATE.plans;
    }
    if (!state.depositRequests) state.depositRequests = [];
    if (!state.settings) state.settings = DEFAULT_STATE.settings;
    return Response.json(state, { headers: corsHeaders() });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to load state' }, { status: 500, headers: corsHeaders() });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as any;
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid body' }, { status: 400, headers: corsHeaders() });
    }
    const existingRaw = await context.env.USDTSTORAGE.get(STATE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : DEFAULT_STATE;

    const next = {
      users: body.users ?? existing.users ?? [],
      plans: body.plans ?? existing.plans ?? DEFAULT_STATE.plans,
      depositAddresses: body.depositAddresses ?? existing.depositAddresses ?? DEFAULT_STATE.depositAddresses,
      depositRequests: body.depositRequests ?? existing.depositRequests ?? [],
      withdrawals: body.withdrawals ?? existing.withdrawals ?? [],
      settings: body.settings ?? existing.settings ?? DEFAULT_STATE.settings,
      admin: body.admin ?? existing.admin ?? DEFAULT_STATE.admin,
    };

    await context.env.USDTSTORAGE.put(STATE_KEY, JSON.stringify(next));
    return Response.json({ ok: true }, { headers: corsHeaders() });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Failed to save state' }, { status: 500, headers: corsHeaders() });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
