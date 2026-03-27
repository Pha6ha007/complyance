/**
 * In-memory rate limiter for API routes.
 *
 * For single-instance Railway deployments this is sufficient.
 * If scaling horizontally, swap to Redis-based implementation.
 *
 * Usage:
 *   const limiter = createRateLimiter({ max: 5, windowMs: 60_000 });
 *   const result = limiter.check(ip);
 *   if (!result.allowed) return NextResponse.json(..., { status: 429 });
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests per window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Max stored IPs before cleanup (default: 10000) */
  maxEntries?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { max, windowMs, maxEntries = 10_000 } = options;
  const store = new Map<string, RateLimitRecord>();

  function cleanup() {
    if (store.size <= maxEntries) return;
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt < now) store.delete(key);
    }
  }

  function check(key: string): RateLimitResult {
    cleanup();
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
    }

    if (record.count >= max) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count += 1;
    return { allowed: true, remaining: max - record.count, resetAt: record.resetAt };
  }

  function headers(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
      ...(result.allowed ? {} : { 'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString() }),
    };
  }

  return { check, headers };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// ─── Pre-configured limiters for specific endpoints ───

/** Auth endpoints: 5 attempts per 15 minutes */
export const authLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

/** Registration: 3 accounts per hour per IP */
export const registerLimiter = createRateLimiter({ max: 3, windowMs: 60 * 60 * 1000 });

/** Password reset: 3 requests per 15 minutes */
export const passwordResetLimiter = createRateLimiter({ max: 3, windowMs: 15 * 60 * 1000 });

/** Contact/partner forms: 5 submissions per hour */
export const formLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

/** Public classify API: 10 requests per hour */
export const classifyLimiter = createRateLimiter({ max: 10, windowMs: 60 * 60 * 1000 });
