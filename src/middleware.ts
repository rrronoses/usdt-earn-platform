import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('app_auth_token')?.value;
  const adminToken = request.cookies.get('admin_auth_token')?.value;

  if (pathname.startsWith('/administrator') && pathname !== '/administrator') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/administrator', request.url));
    }
  }

  const protectedUserRoutes = ['/dashboard', '/plans', '/invitation', '/account'];
  if (protectedUserRoutes.some((route) => pathname.startsWith(route))) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plans/:path*',
    '/invitation/:path*',
    '/account/:path*',
    '/administrator/:path*',
  ],
};
