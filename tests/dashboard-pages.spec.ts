import { test, expect } from '@playwright/test';
import {
  LOCALES,
  expectPageLoadsSuccessfully,
  expectNoRawTranslationKeys,
  getLocalizedPath,
} from './helpers';

/**
 * Dashboard pages (protected routes)
 * These should redirect to login when not authenticated
 */
const DASHBOARD_PAGES = [
  { path: 'dashboard', name: 'Dashboard Home' },
  { path: 'dashboard/systems', name: 'Systems' },
  { path: 'dashboard/vendors', name: 'Vendors' },
  { path: 'dashboard/evidence', name: 'Evidence' },
  { path: 'dashboard/intelligence', name: 'Intelligence' },
  { path: 'dashboard/incidents', name: 'Incidents' },
  { path: 'dashboard/reports', name: 'Reports' },
  { path: 'dashboard/referrals', name: 'Referrals' },
  { path: 'settings', name: 'Settings' },
  { path: 'settings/billing', name: 'Billing Settings' },
  { path: 'settings/badge', name: 'Badge Settings' },
];

test.describe('Dashboard Pages - Authentication Protection', () => {
  test.describe('Redirects to login when not authenticated', () => {
    for (const pageInfo of DASHBOARD_PAGES) {
      test(`${pageInfo.name} redirects unauthenticated users`, async ({ page }) => {
        const path = getLocalizedPath('en', pageInfo.path);

        // Try to access dashboard page without authentication
        const response = await page.goto(path);

        // Wait for any redirects to complete
        await page.waitForLoadState('networkidle');

        const finalUrl = page.url();

        // Should redirect to login or show 401/403
        const isRedirectedToLogin = finalUrl.includes('/login');
        const isErrorPage = response?.status() === 401 || response?.status() === 403;

        expect(
          isRedirectedToLogin || isErrorPage,
          `Expected redirect to login or error status, got: ${finalUrl} (status: ${response?.status()})`
        ).toBeTruthy();
      });
    }
  });
});

test.describe('Dashboard Pages - Page Structure', () => {
  test('Login page loads when accessing protected route', async ({ page }) => {
    // Try to access dashboard
    await page.goto(getLocalizedPath('en', 'dashboard'));
    await page.waitForLoadState('networkidle');

    const finalUrl = page.url();

    if (finalUrl.includes('/login')) {
      // Should be on login page now
      await expectPageLoadsSuccessfully(page);

      // Should have login form
      const form = page.locator('form');
      await expect(form).toBeVisible();
    }
  });
});

test.describe('Dashboard Pages - No Raw Translation Keys on Redirected Page', () => {
  test('Login page (after redirect) has no raw translation keys', async ({ page }) => {
    // Try to access protected route
    await page.goto(getLocalizedPath('en', 'dashboard'));
    await page.waitForLoadState('networkidle');

    const finalUrl = page.url();

    if (finalUrl.includes('/login')) {
      // Check the login page for raw translation keys
      await expectNoRawTranslationKeys(page);
    }
  });
});

test.describe('Dashboard Routes - Locale Support', () => {
  for (const locale of ['en', 'fr', 'de', 'ar']) {
    test(`Dashboard route works with ${locale} locale`, async ({ page }) => {
      const path = getLocalizedPath(locale as any, 'dashboard');

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const finalUrl = page.url();

      // Should either load the dashboard or redirect to login
      // Note: Default locale (en) may be stripped from URL
      const isLoginPage = finalUrl.includes('/login');
      const isDashboard = finalUrl.includes('/dashboard') || finalUrl.includes('/settings');

      if (locale === 'en') {
        // English URLs may not have /en/ prefix
        expect(isLoginPage || isDashboard).toBeTruthy();
      } else {
        expect(finalUrl).toContain(`/${locale}/`);
      }

      // Page should load without errors
      await expectPageLoadsSuccessfully(page);
    });
  }
});

test.describe('Settings Pages - Locale Support', () => {
  for (const locale of ['en', 'fr', 'de', 'ar']) {
    test(`Settings page works with ${locale} locale`, async ({ page }) => {
      const path = getLocalizedPath(locale as any, 'settings');

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const finalUrl = page.url();

      // Should redirect to login
      // Note: Default locale (en) may be stripped from URL
      const isLoginPage = finalUrl.includes('/login');

      if (locale === 'en') {
        // English URLs may not have /en/ prefix
        expect(isLoginPage).toBeTruthy();
      } else {
        expect(finalUrl).toContain(`/${locale}/`);
      }

      // If redirected to login, check it loads properly
      if (finalUrl.includes('/login')) {
        await expectPageLoadsSuccessfully(page);

        // For Arabic, check RTL
        if (locale === 'ar') {
          const htmlDir = await page.locator('html').getAttribute('dir');
          expect(htmlDir).toBe('rtl');
        }
      }
    });
  }
});
