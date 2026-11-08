import { getAdminToken, parseToken } from '@/lib/auth';
import { jsonError } from '@/lib/http';

export function requireAdmin() {
  const token = getAdminToken();
  if (!token) {
    return { ok: false as const, response: jsonError('UNAUTHORIZED', 'Admin authentication required') };
  }
  const parsed = parseToken(token);
  if (!parsed || parsed.role !== 'admin') {
    return { ok: false as const, response: jsonError('FORBIDDEN', 'Admin role required') };
  }
  return { ok: true as const, adminId: parsed.userId };
}

export function requireUser() {
  const { getUserToken } = require('@/lib/auth') as typeof import('@/lib/auth');
  const token = getUserToken();
  if (!token) {
    return { ok: false as const, response: jsonError('UNAUTHORIZED', 'Authentication required') };
  }
  const parsed = parseToken(token);
  if (!parsed || parsed.role !== 'user') {
    return { ok: false as const, response: jsonError('UNAUTHORIZED', 'User session required') };
  }
  return { ok: true as const, userId: parsed.userId };
}
