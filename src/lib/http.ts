import { NextResponse } from 'next/server';
import type { ZodError, ZodSchema } from 'zod';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'INTERNAL';

const statusByCode: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  CONFLICT: 409,
  INTERNAL: 500,
};

export function jsonOk<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true as const, ...data }, init);
}

export function jsonError(
  code: ErrorCode,
  message: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { ok: false as const, code, message, ...extra },
    { status: statusByCode[code] }
  );
}

export function fromZodError(err: ZodError) {
  const message = err.errors.map((e) => e.message).join('; ') || 'Validation failed';
  return jsonError('BAD_REQUEST', message, {
    issues: err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: jsonError('BAD_REQUEST', 'Invalid JSON body') };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: fromZodError(parsed.error) };
  }
  return { ok: true, data: parsed.data };
}

/** Apply common security headers to API responses. */
export function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
