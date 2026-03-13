# Testing Patterns

**Analysis Date:** 2026-03-13

## Test Framework

**Runner:**
- Playwright v1.58.2 (E2E testing)
- Config: `playwright.config.ts` (root level)

**Assertion Library:**
- Playwright assertions: `expect(element).toBeVisible()`, `expect(page).toContainText()`
- No unit test framework detected (Jest/Vitest not in dependencies)
- Focus is exclusively on E2E testing

**Run Commands:**
```bash
npm run test:e2e              # Run all Playwright tests
npm run test:e2e:ui          # Interactive UI mode
npm run test:e2e:report      # View HTML test report
```

**Playwright Configuration:**
- Base URL: `http://localhost:3001`
- Parallel execution enabled: `fullyParallel: true`
- Retries: 0 locally, 2 on CI
- Workers: unlimited locally, 1 on CI
- Screenshot on failure: enabled
- Trace on first retry: enabled
- Browsers: Chromium only (Firefox/Safari commented out)
- Web server: Starts Next.js dev server before tests with custom env vars

## Test File Organization

**Location:**
- All tests in `tests/` directory at project root
- Separate from `src/` directory (not co-located)
- Helper utilities in `tests/helpers.ts`

**Naming:**
- Pattern: `*.spec.ts` (Playwright convention)
- Current test files:
  - `auth-pages.spec.ts` - authentication flow tests
  - `dashboard-pages.spec.ts` - dashboard feature tests
  - `marketing-pages.spec.ts` - public marketing pages
  - `language-switching.spec.ts` - i18n/locale switching tests
  - `helpers.ts` - shared test utilities

**Structure:**
```
tests/
├── helpers.ts                    # Test utilities and helper functions
├── auth-pages.spec.ts            # Auth flow tests (all 7 locales)
├── dashboard-pages.spec.ts       # Dashboard page availability tests
├── language-switching.spec.ts    # Language switching functionality
└── marketing-pages.spec.ts       # Marketing site tests
```

## Test Structure

**Suite Organization:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test.describe('Login Page - All Locales', () => {
    for (const locale of LOCALES) {
      test(`Login page loads successfully (${locale})`, async ({ page }) => {
        const path = getLocalizedPath(locale, 'login');
        await page.goto(path);

        await expectPageLoadsSuccessfully(page);
        await expectValidHtmlStructure(page);

        const form = page.locator('form');
        await expect(form).toBeVisible();
      });
    }
  });

  test.describe('Login Page - Content Checks', () => {
    test('Login page has email input', async ({ page }) => {
      // ...
    });
  });
});
```

**Patterns:**
- Nested `test.describe()` blocks for logical organization
- Parametrized tests using `for...of` loops over locales (LOCALES array)
- Single test per assertion/responsibility
- Clear test names describing what is tested and for which locale
- Helper functions for repeated checks

**Assertions:**
- `.toBeVisible()` - element is in viewport and visible
- `.toBeDefined()` - value exists and not null/undefined
- `.toHaveLength(0)` - array/string length check
- `.toContain()` - substring/element in array
- `.not.toBe()` - inequality assertion
- Custom expectation messages: `expect(errors, 'Page should not have JavaScript errors...').toHaveLength(0)`

## Helper Functions

**Location:** `tests/helpers.ts`

**Available Helpers:**

```typescript
// Page load validation
export async function expectPageLoadsSuccessfully(page: Page): Promise<void>
// Checks for JS console errors, waits for network idle

export async function expectValidHtmlStructure(page: Page): Promise<void>
// Verifies html and body elements exist

// Translation verification
export async function expectNoRawTranslationKeys(page: Page): Promise<void>
// Scans page text for untranslated keys matching pattern: "namespace.key.path"
// Filters false positives (domains, file extensions, version numbers)

// i18n testing
export async function testLanguageSwitcher(page: Page, currentPath: string): Promise<void>
// Tests locale switcher functionality, navigates to French, verifies URL changed

export function getLocalizedPath(locale: Locale, path: string): string
// Converts path to locale-prefixed URL: '/en/login', '/fr/login', etc.

// Locale constants
export const LOCALES = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;
export type Locale = typeof LOCALES[number];
```

**Test Data:**
- Uses real application endpoints (no mocks)
- Environment: `NEXTAUTH_URL=http://localhost:3001`, `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- Port 3001 dedicated to test environment to avoid conflicts with dev server on 3000

## Mocking

**Framework:** None - Playwright tests run against live application

**Approach:**
- Full E2E testing: all requests against actual running Next.js server
- No API mocking or component isolation
- Database state not managed within tests (tests verify presence of UI elements, not state)
- Real form submissions tested when possible (auth flow, page loads)

**What to Mock (if adding unit tests):**
- External API calls (Anthropic Claude, Paddle, AWS S3, Resend)
- Database queries (Prisma client)
- Authentication sessions (NextAuth)
- File I/O operations

**What NOT to Mock:**
- Page navigation and routing
- DOM rendering (test actual rendered output)
- Event handlers (test side effects)
- i18n translation system (verify actual translations load)

## Test Coverage

**Current Status:** No unit test coverage configured
- No Jest/Vitest in dependencies
- No test coverage metrics or targets enforced
- Coverage focused on E2E flows only

**Gap Analysis:**
- Unit tests missing for:
  - Classification engine logic (`src/server/services/classification/`)
  - Validation schemas and Zod validators
  - Utility functions in `src/lib/`
  - Service layer functions (gaps, scoring, assessment)
  - tRPC procedures input validation

- E2E tests cover basic page loads but lack:
  - Form submission flows (classification wizard, vendor creation)
  - Error scenarios and validation feedback
  - Multi-step workflows
  - Protected route authorization
  - Payment/Paddle integration flows

**Recommendation for Future Coverage:**
- Add unit test framework (Vitest recommended for Next.js)
- Write unit tests for classification engine (business logic critical path)
- Write tests for Zod schemas and validation
- Expand E2E tests for critical user workflows
- Aim for 80%+ coverage on `src/server/services/` (business logic)

## Test Types

**Unit Tests:**
- Not currently implemented
- Would test: utility functions, validation logic, business rule engines
- Location would be: co-located with source or `src/**/__tests__/`

**Integration Tests:**
- Not currently implemented
- Would test: tRPC procedures, router-to-service layer interactions
- Would verify Prisma queries with test database

**E2E Tests:**
- Implemented with Playwright
- Test files: `tests/**/*.spec.ts`
- Scope: Full user workflows across all 7 locales
- Current coverage:
  - Authentication pages (login page for all locales)
  - Marketing pages (pricing, about, blog, privacy, terms, refund, partners, contact)
  - Dashboard pages (system list, vendors, evidence, intelligence)
  - Language switching functionality
  - Page load correctness and HTML structure

## Common Patterns in E2E Tests

**Async Testing:**
All test functions are async:
```typescript
test('Login page loads successfully', async ({ page }) => {
  await page.goto(path);
  await expectPageLoadsSuccessfully(page);
  // Playwright automatically waits for promises
});
```
- Page navigation waits for network idle
- Element assertions wait with implicit timeout (30s default)
- Custom timeouts: `await page.waitForTimeout(500)`

**Page Navigation Pattern:**
```typescript
await page.goto(getLocalizedPath(locale, 'login'));
await page.waitForLoadState('networkidle');
// Continue with assertions
```

**Error Testing:**
Limited error scenario testing in current suite. Example pattern for adding error tests:
```typescript
// Collect JS errors during test
const errors: string[] = [];
page.on('pageerror', (error) => {
  errors.push(error.message);
});

// Assert no errors occurred
expect(errors).toHaveLength(0);
```

**Locale-Parametrized Tests:**
```typescript
const LOCALES = ['en', 'fr', 'de', 'pt', 'ar', 'pl', 'it'] as const;

for (const locale of LOCALES) {
  test(`Feature works in ${locale}`, async ({ page }) => {
    await page.goto(getLocalizedPath(locale, 'path'));
    // Test same flow for each locale
  });
}
```

## Configuration Details

**Playwright Config Location:** `playwright.config.ts`

**Key Settings:**
```typescript
// Parallel execution
fullyParallel: true
retries: process.env.CI ? 2 : 0  // Retry only on CI
workers: process.env.CI ? 1 : undefined  // Single worker on CI

// Artifacts
screenshot: 'only-on-failure'
trace: 'on-first-retry'
reporter: ['html', 'list']  // HTML report + console list

// Web server auto-start
webServer: {
  command: 'PORT=3001 NEXTAUTH_URL=http://localhost:3001 npm run dev',
  url: 'http://localhost:3001',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}

// Browsers
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  // Firefox and webkit commented out
]
```

## Console.log Management

**Current State:** Console.log statements found in:
- `src/app/api/contact/route.ts` - form submission logging
- `src/app/api/partners/route.ts` - partnership application logging
- `src/app/api/webhooks/paddle/route.ts` - webhook event logging (5 instances)
- `src/server/services/classification/engine.ts` - classification steps logging (3 instances)

**Task Requirement:** No console.log left in production code per Definition of Done

**Cleanup Needed:**
These console.log statements must be removed or replaced with proper logging (Sentry):
- `src/app/api/contact/route.ts:    console.log('Contact form submission:', data);`
- `src/app/api/partners/route.ts:    console.log('Partnership application:', data);`
- `src/app/api/webhooks/paddle/route.ts:    console.log('Paddle webhook received:', eventType);`
- `src/app/api/webhooks/paddle/route.ts:    console.log('Payment succeeded for subscription:', ...);`
- `src/app/api/webhooks/paddle/route.ts:    console.log('Payment failed for subscription:', ...);`
- `src/server/services/classification/engine.ts` - multiple classification step logs starting with `[Classification Engine]`

---

*Testing analysis: 2026-03-13*
