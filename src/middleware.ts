import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('app_auth_token')?.value;
  const adminToken = request.cookies.get('admin_auth_token')?.value;

  if (pathname.startsWith('/administrator') && pathname !== '/administrator') {
    if (!adminToken) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL('/administrator', request.url))
      );
    }
  }

  const protectedUserRoutes = ['/dashboard', '/plans', '/invitation', '/account'];
  if (protectedUserRoutes.some((route) => pathname.startsWith(route))) {
    if (!authToken) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
    }
  }

  // API admin surface — cookie presence gate (role verified in route handlers)
  if (pathname.startsWith('/api/admin')) {
    if (!adminToken) {
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, code: 'UNAUTHORIZED', message: 'Admin authentication required' },
          { status: 401 }
        )
      );
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plans/:path*',
    '/invitation/:path*',
    '/account/:path*',
    '/administrator/:path*',
    '/api/admin/:path*',
  ],
};
