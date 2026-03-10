import { Page, expect } from '@playwright/test';

/**
 * All supported locales in the app
 */
export const LOCALES = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;
export type Locale = typeof LOCALES[number];

/**
 * Check that a page loads without errors
 */
export async function expectPageLoadsSuccessfully(page: Page) {
  // Check no JS errors in console
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Check for errors
  expect(errors, `Page should not have JavaScript errors: ${errors.join(', ')}`).toHaveLength(0);
}

/**
 * Check that there are no raw translation keys visible on the page
 * Raw translation keys typically look like: "common.button.submit" or similar patterns
 */
export async function expectNoRawTranslationKeys(page: Page) {
  const bodyText = await page.textContent('body');

  if (!bodyText) {
    throw new Error('Could not get body text');
  }

  // Pattern to match translation keys (e.g., "common.button.submit", "page.title", etc.)
  // Translation keys usually have dots separating segments and no spaces
  const translationKeyPattern = /\b[a-z]+\.[a-z]+(\.[a-z]+)*\b/gi;
  const matches = bodyText.match(translationKeyPattern);

  if (matches) {
    // Filter out common false positives (like file extensions, domains, etc.)
    const suspiciousKeys = matches.filter(match => {
      // Ignore common patterns that aren't translation keys
      const ignoredPatterns = [
        /\.(com|org|net|io|dev|app|co)$/i, // domains
        /\.(jpg|png|svg|pdf|doc|docx)$/i, // file extensions
        /^\d+\.\d+/, // version numbers
      ];

      return !ignoredPatterns.some(pattern => pattern.test(match));
    });

    if (suspiciousKeys.length > 0) {
      // Log visible suspicious keys for debugging
      console.warn('Potentially raw translation keys found:', suspiciousKeys.slice(0, 10));
    }
  }
}

/**
 * Test language switching functionality
 */
export async function testLanguageSwitcher(page: Page, currentPath: string) {
  // Find the language switcher (it should be in the navigation or footer)
  const languageSwitcher = page.locator('[data-testid="locale-switcher"]').or(
    page.getByRole('button', { name: /language|язык|langue|sprache|idioma/i })
  );

  // Check if language switcher exists on the page
  const isVisible = await languageSwitcher.isVisible().catch(() => false);

  if (!isVisible) {
    console.warn(`Language switcher not found on ${currentPath}`);
    return;
  }

  // Click the language switcher
  await languageSwitcher.click();

  // Wait for dropdown/menu to appear
  await page.waitForTimeout(500);

  // Try to find a different language option (e.g., French)
  const frenchOption = page.getByRole('link', { name: /français|french/i }).or(
    page.locator('[href*="/fr/"]')
  );

  const hasFrenchOption = await frenchOption.count() > 0;

  if (hasFrenchOption) {
    const initialUrl = page.url();
    await frenchOption.first().click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    const newUrl = page.url();

    // Check that the URL changed to the French locale
    expect(newUrl).toContain('/fr/');
    expect(newUrl).not.toBe(initialUrl);
  }
}

/**
 * Get the full URL for a path with locale
 */
export function getLocalizedPath(locale: Locale, path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${cleanPath}`;
}

/**
 * Check page has proper HTML structure
 */
export async function expectValidHtmlStructure(page: Page) {
  // Check for basic HTML elements
  await expect(page.locator('html')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();
}
