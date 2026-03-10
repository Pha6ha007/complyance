import { test, expect } from '@playwright/test';
import {
  LOCALES,
  expectPageLoadsSuccessfully,
  expectNoRawTranslationKeys,
  testLanguageSwitcher,
  getLocalizedPath,
  expectValidHtmlStructure,
} from './helpers';

/**
 * Marketing pages that should be publicly accessible
 */
const MARKETING_PAGES = [
  { path: '', name: 'Home' },
  { path: 'about', name: 'About' },
  { path: 'pricing', name: 'Pricing' },
  { path: 'contact', name: 'Contact' },
  { path: 'partners', name: 'Partners' },
  { path: 'free-classifier', name: 'Free Classifier' },
  { path: 'blog', name: 'Blog' },
  { path: 'terms', name: 'Terms' },
  { path: 'privacy', name: 'Privacy' },
  { path: 'refund', name: 'Refund' },
];

test.describe('Marketing Pages - Load Successfully', () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {
      for (const pageInfo of MARKETING_PAGES) {
        test(`${pageInfo.name} page loads without errors`, async ({ page }) => {
          const path = getLocalizedPath(locale, pageInfo.path);

          // Navigate to the page
          await page.goto(path);

          // Check page loads successfully
          await expectPageLoadsSuccessfully(page);

          // Check for valid HTML structure
          await expectValidHtmlStructure(page);

          // Check status code (should be 200)
          const response = await page.goto(path);
          expect(response?.status()).toBe(200);
        });
      }
    });
  }
});

test.describe('Marketing Pages - No Raw Translation Keys', () => {
  // Test with English locale as primary
  for (const pageInfo of MARKETING_PAGES) {
    test(`${pageInfo.name} page has no raw translation keys`, async ({ page }) => {
      const path = getLocalizedPath('en', pageInfo.path);

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Check for raw translation keys
      await expectNoRawTranslationKeys(page);
    });
  }
});

test.describe('Marketing Pages - Language Switching', () => {
  // Test language switching on key pages
  const KEY_PAGES = ['', 'pricing', 'about', 'free-classifier'];

  for (const pagePath of KEY_PAGES) {
    test(`Language switcher works on ${pagePath || 'home'}`, async ({ page }) => {
      const path = getLocalizedPath('en', pagePath);

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Test language switching
      await testLanguageSwitcher(page, path);
    });
  }
});

test.describe('Marketing Pages - RTL Support (Arabic)', () => {
  const KEY_PAGES = ['', 'pricing', 'about'];

  for (const pagePath of KEY_PAGES) {
    test(`${pagePath || 'home'} page supports RTL (Arabic)`, async ({ page }) => {
      const path = getLocalizedPath('ar', pagePath);

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Check that the HTML has dir="rtl" or similar RTL attributes
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');

      // Page should load without errors
      await expectPageLoadsSuccessfully(page);
    });
  }
});

test.describe('Marketing Pages - Specific Content Checks', () => {
  test('Home page has CTA buttons', async ({ page }) => {
    await page.goto(getLocalizedPath('en', ''));

    // Should have at least one call-to-action button
    const ctaButtons = page.getByRole('link', { name: /get started|start free|sign up/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('Pricing page displays plans', async ({ page }) => {
    await page.goto(getLocalizedPath('en', 'pricing'));

    // Should display pricing information
    // Look for plan names or pricing indicators
    const planElements = page.locator('text=/free|starter|professional|scale/i');
    await expect(planElements.first()).toBeVisible();
  });

  test('Blog page lists articles', async ({ page }) => {
    await page.goto(getLocalizedPath('en', 'blog'));

    // Should have blog article links or headings
    // Check for common blog elements
    const blogContent = page.locator('article, [class*="blog"], [class*="post"]');
    const hasBlogContent = await blogContent.count() > 0;

    // Either has blog posts or a "no posts" message
    expect(hasBlogContent || await page.textContent('body').then(text =>
      text?.includes('No posts') || text?.includes('Coming soon')
    )).toBeTruthy();
  });

  test('Contact page has contact information', async ({ page }) => {
    await page.goto(getLocalizedPath('en', 'contact'));

    await expectPageLoadsSuccessfully(page);

    // Should have some form of contact information
    // This could be a form, email, or other contact method
    const hasForm = await page.locator('form').count() > 0;
    const hasEmail = await page.textContent('body').then(text =>
      text?.includes('@') || text?.includes('email')
    );

    expect(hasForm || hasEmail).toBeTruthy();
  });
});
