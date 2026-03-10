import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth';

// Simple in-memory rate limiter for public API
// In production with multiple instances, use Redis-backed limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed',
});

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = (request as any).auth;

  // Apply rate limiting to public API endpoints
  if (pathname.startsWith('/api/public/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
          },
        }
      );
    }
  }

  // Handle API routes (skip i18n)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = [
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

  // Check if current path is a protected route (accounting for locale prefix)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !session) {
    // Extract locale from pathname or use default
    const localeMatch = pathname.match(/^\/(en|fr|de|pt|ar|pl|it)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Apply i18n middleware for all other routes
  const response = intlMiddleware(request);

  // Add noindex headers for dashboard, admin, and settings routes
  if (isProtectedRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
