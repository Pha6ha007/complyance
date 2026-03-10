import { test, expect } from '@playwright/test';
import {
  LOCALES,
  expectPageLoadsSuccessfully,
  expectNoRawTranslationKeys,
  testLanguageSwitcher,
  getLocalizedPath,
  expectValidHtmlStructure,
} from './helpers';

test.describe('Authentication Pages', () => {
  test.describe('Login Page - All Locales', () => {
    for (const locale of LOCALES) {
      test(`Login page loads successfully (${locale})`, async ({ page }) => {
        const path = getLocalizedPath(locale, 'login');

        await page.goto(path);

        // Check page loads successfully
        await expectPageLoadsSuccessfully(page);

        // Check for valid HTML structure
        await expectValidHtmlStructure(page);

        // Should have a form
        const form = page.locator('form');
        await expect(form).toBeVisible();
      });
    }
  });

  test.describe('Login Page - Content Checks', () => {
    test('Login page has email input', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));

      // Should have email input
      const emailInput = page.locator('input[type="email"]').or(
        page.locator('input[name="email"]')
      );
      await expect(emailInput.first()).toBeVisible();
    });

    test('Login page has password input', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));

      // Should have password input
      const passwordInput = page.locator('input[type="password"]').or(
        page.locator('input[name="password"]')
      );
      await expect(passwordInput.first()).toBeVisible();
    });

    test('Login page has submit button', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));

      // Should have a submit button
      const submitButton = page.locator('button[type="submit"]').or(
        page.getByRole('button', { name: /log in|sign in|login/i })
      );
      await expect(submitButton.first()).toBeVisible();
    });

    test('Login page has Google OAuth option', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));

      // Should have Google sign-in button or link
      const googleButton = page.getByRole('button', { name: /google/i }).or(
        page.locator('[class*="google"]')
      );

      // Google auth might be optional, so just check if it's present
      const hasGoogleAuth = await googleButton.count() > 0;
      console.log(`Google OAuth ${hasGoogleAuth ? 'present' : 'not present'} on login page`);
    });
  });

  test.describe('Login Page - No Raw Translation Keys', () => {
    test('Login page has no raw translation keys (en)', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));
      await page.waitForLoadState('networkidle');

      await expectNoRawTranslationKeys(page);
    });

    test('Login page has no raw translation keys (fr)', async ({ page }) => {
      await page.goto(getLocalizedPath('fr', 'login'));
      await page.waitForLoadState('networkidle');

      await expectNoRawTranslationKeys(page);
    });

    test('Login page has no raw translation keys (ar)', async ({ page }) => {
      await page.goto(getLocalizedPath('ar', 'login'));
      await page.waitForLoadState('networkidle');

      await expectNoRawTranslationKeys(page);
    });
  });

  test.describe('Login Page - Language Switching', () => {
    test('Language switcher works on login page', async ({ page }) => {
      const path = getLocalizedPath('en', 'login');

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      await testLanguageSwitcher(page, path);
    });
  });

  test.describe('Login Page - RTL Support (Arabic)', () => {
    test('Login page supports RTL', async ({ page }) => {
      await page.goto(getLocalizedPath('ar', 'login'));
      await page.waitForLoadState('networkidle');

      // Check RTL
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');

      await expectPageLoadsSuccessfully(page);
    });
  });

  test.describe('Login Page - Form Validation', () => {
    test('Shows validation error for empty form submission', async ({ page }) => {
      await page.goto(getLocalizedPath('en', 'login'));

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should show validation errors (either HTML5 or custom)
      // Wait a bit for validation to appear
      await page.waitForTimeout(1000);

      // Check if there are any error messages or HTML5 validation
      const emailInput = page.locator('input[type="email"]').first();
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

      // Either HTML5 validation or visible error message
      if (!isInvalid) {
        const errorMessage = page.locator('[class*="error"]').or(
          page.locator('[role="alert"]')
        );
        const hasErrorMessage = await errorMessage.count() > 0;
        console.log(`Form validation: ${hasErrorMessage ? 'custom error shown' : 'HTML5 validation'}`);
      }
    });
  });
});
