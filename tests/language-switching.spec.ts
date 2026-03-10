import { test, expect } from '@playwright/test';
import {
  LOCALES,
  expectPageLoadsSuccessfully,
  getLocalizedPath,
} from './helpers';

test.describe('Language Switching - All Locales', () => {
  const TEST_PAGES = [
    { path: '', name: 'Home' },
    { path: 'pricing', name: 'Pricing' },
    { path: 'about', name: 'About' },
    { path: 'login', name: 'Login' },
  ];

  for (const pageInfo of TEST_PAGES) {
    test.describe(`${pageInfo.name} page`, () => {
      for (const locale of LOCALES) {
        test(`loads successfully in ${locale}`, async ({ page }) => {
          const path = getLocalizedPath(locale, pageInfo.path);

          const response = await page.goto(path);
          await page.waitForLoadState('networkidle');

          // Check successful load
          expect(response?.status()).toBe(200);

          // Check page loads without errors
          await expectPageLoadsSuccessfully(page);

          // Check correct locale in URL
          // Note: Default locale (en) may be stripped from URL with localePrefix: 'as-needed'
          if (locale === 'en') {
            // English URLs may not have /en/ prefix
            const hasEnPrefix = page.url().includes('/en/');
            const isRootWithoutPrefix = page.url().endsWith(':3001/') || page.url().match(/localhost:3001\/[a-z-]+$/);
            expect(hasEnPrefix || isRootWithoutPrefix).toBeTruthy();
          } else {
            expect(page.url()).toContain(`/${locale}/`);
          }

          // Check html lang attribute matches locale
          const htmlLang = await page.locator('html').getAttribute('lang');
          expect(htmlLang).toBe(locale);

          // For Arabic, check RTL
          if (locale === 'ar') {
            const htmlDir = await page.locator('html').getAttribute('dir');
            expect(htmlDir).toBe('rtl');
          } else {
            // Other languages should be LTR or not set
            const htmlDir = await page.locator('html').getAttribute('dir');
            expect(htmlDir === 'ltr' || htmlDir === null).toBeTruthy();
          }
        });
      }
    });
  }
});

test.describe('Language Switching - Locale Persistence', () => {
  test('Switching to French persists across navigation', async ({ page }) => {
    // Start on English home page
    await page.goto(getLocalizedPath('en', ''));
    await page.waitForLoadState('networkidle');

    // English (default locale) may not have /en/ in URL
    const hasEnPrefix = page.url().includes('/en/');
    const isEnglishHome = page.url().endsWith(':3001/');
    expect(hasEnPrefix || isEnglishHome).toBeTruthy();

    // Navigate to French
    await page.goto(getLocalizedPath('fr', ''));
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/fr/');

    // Navigate to pricing
    await page.click('a[href*="/pricing"]', { timeout: 5000 }).catch(() => {
      // If link not found, navigate directly
      return page.goto(getLocalizedPath('fr', 'pricing'));
    });

    await page.waitForLoadState('networkidle');

    // Should still be in French
    expect(page.url()).toContain('/fr/');
  });

  test('Direct access to locale URL works', async ({ page }) => {
    // Directly access German pricing page
    const response = await page.goto(getLocalizedPath('de', 'pricing'));
    await page.waitForLoadState('networkidle');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/de/');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('de');
  });
});

test.describe('Language Switching - RTL/LTR Toggle', () => {
  test('Switching from LTR to RTL changes direction', async ({ page }) => {
    // Start with English (LTR)
    await page.goto(getLocalizedPath('en', 'pricing'));
    await page.waitForLoadState('networkidle');

    const ltrDir = await page.locator('html').getAttribute('dir');
    expect(ltrDir === 'ltr' || ltrDir === null).toBeTruthy();

    // Switch to Arabic (RTL)
    await page.goto(getLocalizedPath('ar', 'pricing'));
    await page.waitForLoadState('networkidle');

    const rtlDir = await page.locator('html').getAttribute('dir');
    expect(rtlDir).toBe('rtl');

    // Page should load without errors
    await expectPageLoadsSuccessfully(page);
  });

  test('Switching from RTL to LTR changes direction', async ({ page }) => {
    // Start with Arabic (RTL)
    await page.goto(getLocalizedPath('ar', 'about'));
    await page.waitForLoadState('networkidle');

    const rtlDir = await page.locator('html').getAttribute('dir');
    expect(rtlDir).toBe('rtl');

    // Switch to French (LTR)
    await page.goto(getLocalizedPath('fr', 'about'));
    await page.waitForLoadState('networkidle');

    const ltrDir = await page.locator('html').getAttribute('dir');
    expect(ltrDir === 'ltr' || ltrDir === null).toBeTruthy();

    // Page should load without errors
    await expectPageLoadsSuccessfully(page);
  });
});

test.describe('Language Switching - All 7 Locales Load', () => {
  test('All locales are accessible', async ({ page }) => {
    for (const locale of LOCALES) {
      const path = getLocalizedPath(locale, '');
      const response = await page.goto(path);

      expect(
        response?.status(),
        `Locale ${locale} should return 200 status`
      ).toBe(200);

      await page.waitForLoadState('networkidle');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang, `HTML lang should be ${locale}`).toBe(locale);
    }
  });
});
