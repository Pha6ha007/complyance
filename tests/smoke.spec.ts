import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// Dev server compiles pages on first visit — allow time
test.setTimeout(60_000);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('Download the React DevTools') ||
        text.includes('Hydration') ||
        text.includes('ERR_CONNECTION_REFUSED') ||
        text.includes('Failed to load resource') ||
        text.includes('net::ERR_') ||
        text.includes('NEXT_REDIRECT') ||
        text.includes('trpc') ||
        text.includes('PostHog') ||
        text.includes('Sentry') ||
        text.includes('ChunkLoadError') ||
        text.includes('Loading chunk')
      )
        return;
      errors.push(text);
    }
  });
  return errors;
}

async function loadPage(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 40_000 });
  await page.waitForTimeout(300);
  return res?.status() ?? 0;
}

// ─── 1. Marketing Pages — Load & No JS Errors ─────────────────────────────────

const MARKETING_PAGES = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/pricing', 'Pricing'],
  ['/contact', 'Contact'],
  ['/partners', 'Partners'],
  ['/free-classifier', 'Free Classifier'],
  ['/blog', 'Blog'],
  ['/terms', 'Terms'],
  ['/privacy', 'Privacy'],
  ['/refund', 'Refund'],
  ['/login', 'Login'],
] as const;

test.describe('1 — Marketing pages load without errors', () => {
  for (const [path, name] of MARKETING_PAGES) {
    test(`${name} (${path})`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const status = await loadPage(page, path);

      expect(status, `${name} returned HTTP ${status}`).toBe(200);
      await expect(page.locator('body')).toBeVisible();
      expect(errors, `JS errors on ${name}: ${errors.join(' | ')}`).toHaveLength(0);
    });
  }
});

// ─── 2. Auth Redirects — Protected routes redirect to /login ───────────────────

const PROTECTED_ROUTES = [
  '/dashboard',
  '/systems',
  '/vendors',
  '/evidence',
  '/intelligence',
  '/reports',
  '/referrals',
  '/settings',
  '/settings/billing',
  '/settings/badge',
];

test.describe('2 — Protected routes redirect to login', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} → /login`, async ({ page }) => {
      await loadPage(page, route);
      expect(page.url(), `Expected ${route} to redirect to login`).toContain('/login');
    });
  }
});

// ─── 3. Login Page — Form Elements ─────────────────────────────────────────────

test.describe('3 — Login page form', () => {
  test('has email, password, submit', async ({ page }) => {
    await loadPage(page, '/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('has Google OAuth button', async ({ page }) => {
    await loadPage(page, '/login');
    await expect(
      page.locator('button', { hasText: /google/i })
    ).toBeVisible();
  });

  test('can toggle to register mode', async ({ page }) => {
    // Load login page and wait for full network settle
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 40_000 });

    // Use JavaScript click to bypass any Playwright click interception issues
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button[type="button"]');
      for (const btn of btns) {
        if (btn.textContent?.trim() === 'Sign up') {
          (btn as HTMLButtonElement).click();
          return;
        }
      }
    });

    // After clicking, name field should appear (register mode)
    await expect(page.locator('input#name')).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 4. i18n — All 7 Locales ──────────────────────────────────────────────────

const LOCALES = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;

test.describe('4 — All 7 locales render', () => {
  for (const locale of LOCALES) {
    test(`/${locale}/ loads with lang="${locale}"`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const status = await loadPage(page, `/${locale}`);

      expect(status).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);

      if (locale === 'ar') {
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }

      expect(errors, `JS errors on /${locale}`).toHaveLength(0);
    });
  }
});

// ─── 5. API Endpoints ─────────────────────────────────────────────────────────

test.describe('5 — API endpoints', () => {
  test('GET /api/health returns 200 + ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('POST /api/auth/register rejects bad input', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/contact rejects empty body', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/referral/apply rejects bad input', async ({ request }) => {
    const res = await request.post('/api/referral/apply', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });
});

// ─── 6. Critical Path — Register → Login → Dashboard ─────────────────────────

test.describe('6 — Signup → login → dashboard', () => {
  const TEST_EMAIL = `smoke-${Date.now()}@test.example`;
  const TEST_PASSWORD = 'TestPass123!';
  const TEST_NAME = 'Smoke Test';

  test('register, login, and see dashboard with sidebar', async ({ page }) => {
    test.setTimeout(90_000);
    // Register via API
    const regRes = await page.request.post('/api/auth/register', {
      data: { name: TEST_NAME, email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    expect([201, 409]).toContain(regRes.status());

    // Login via form — wait for hydration, then use type() for reliable input
    await loadPage(page, '/login');
    await page.locator('button[type="submit"]').waitFor({ state: 'visible', timeout: 10_000 });
    await page.waitForTimeout(1_000); // wait for React hydration

    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').type(TEST_EMAIL, { delay: 10 });
    await page.locator('input[type="password"]').click();
    await page.locator('input[type="password"]').type(TEST_PASSWORD, { delay: 10 });
    await page.locator('button[type="submit"]').click();

    // Wait for URL to change away from /login (use polling instead of waitForURL to avoid load-event hang)
    await page.waitForFunction(
      () => !window.location.pathname.includes('/login'),
      { timeout: 30_000 }
    );

    // Should be on dashboard
    expect(page.url()).toContain('/dashboard');

    // Sidebar visible with expected nav links (dashboard rendered)
    await expect(page.locator('aside')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('a[href*="/systems"]')).toBeVisible();
    await expect(page.locator('a[href*="/settings"]')).toBeVisible();
    await expect(page.locator('a[href*="/vendors"]')).toBeVisible();

    // Sidebar shows plan info
    await expect(page.getByText('FREE Plan')).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 7. Content Checks ────────────────────────────────────────────────────────

test.describe('7 — Key page content', () => {
  test('Pricing shows all plan tiers', async ({ page }) => {
    await loadPage(page, '/pricing');
    const body = (await page.textContent('body'))?.toLowerCase() ?? '';
    for (const plan of ['free', 'starter', 'professional', 'scale']) {
      expect(body, `"${plan}" missing on pricing`).toContain(plan);
    }
    expect(await page.textContent('body')).toMatch(/\$\d+/);
  });

  test('Blog has article links', async ({ page }) => {
    await loadPage(page, '/blog');
    const count = await page.locator('a[href*="/blog/"]').count();
    expect(count, 'Blog should have article links').toBeGreaterThan(0);
  });

  test('Free classifier has interactive elements', async ({ page }) => {
    await loadPage(page, '/free-classifier');
    const count = await page.locator('input, textarea, select, button[type="submit"]').count();
    expect(count, 'Classifier should have form elements').toBeGreaterThan(0);
  });
});

// ─── 8. 404 ────────────────────────────────────────────────────────────────────

test.describe('8 — 404 handling', () => {
  test('unknown route returns 404', async ({ page }) => {
    const res = await page.goto('/nonexistent-page-xyz-123', {
      waitUntil: 'domcontentloaded',
      timeout: 40_000,
    });
    expect(res?.status()).toBe(404);
  });
});
