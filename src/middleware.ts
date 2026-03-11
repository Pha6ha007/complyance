import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth';

// Simple in-memory rate limiter for public API
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10);

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) return false;

  record.count += 1;
  return true;
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'always',
});

const protectedSegments = [
  '/dashboard',
  '/admin',
  '/settings',
  '/systems',
  '/vendors',
  '/evidence',
  '/incidents',
  '/intelligence',
  '/referrals',
  '/reports',
  '/team',
];

function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de|pt|ar|pl|it)(\/|$)/);
  return match ? match[1] : defaultLocale;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for public API (before the matcher excludes /api/*)
  if (pathname.startsWith('/api/public/')) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString() } }
      );
    }
  }

  const isProtectedRoute = protectedSegments.some((seg) => pathname.includes(seg));

  if (isProtectedRoute) {
    // Run NextAuth ONLY for protected routes — avoids refreshing JWT cookie on every public page
    const session = await auth();

    if (!session) {
      const locale = extractLocale(pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protected route is authed — skip intlMiddleware (locale already in URL)
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Public routes: only next-intl handles locale redirect, no NextAuth overhead
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)'],
};
