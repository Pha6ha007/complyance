import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
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

const intlMiddleware = createMiddleware(routing);

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
  const localePattern = routing.locales.join('|');
  const match = pathname.match(new RegExp(`^\\/(${localePattern})(\\/|$)`));
  return match ? match[1] : routing.defaultLocale;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for public API
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
    // Run NextAuth ONLY for protected routes
    const session = await auth();

    if (!session) {
      const locale = extractLocale(pathname);
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run intlMiddleware for ALL routes (public AND protected)
  // This ensures next-intl properly resolves locale via headers/cookies
  const response = intlMiddleware(request);

  // Add noindex for protected routes
  if (isProtectedRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|monitoring|.*\\..*).*)'],
};
