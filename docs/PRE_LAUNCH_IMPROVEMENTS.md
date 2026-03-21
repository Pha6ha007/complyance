# Pre-Launch Improvements — March 2026

Complete audit and improvement log for the Complyance platform before public launch.

---

## Summary

- **50+ bugs and issues fixed** across 30+ files
- **TypeScript:** 0 errors (strict mode)
- **i18n:** 7 locales × 1583 keys, 100% synced
- **E2E tests:** 40 smoke tests covering all critical paths
- **SEO:** Full OG/Twitter meta, sitemap, robots.txt, per-page metadata
- **Security:** CSP, HSTS, CSRF, rate limiting, email enumeration protection

---

## 🔴 Critical Bug Fixes

### 1. Missing `/api/referral/apply` endpoint
**Problem:** Login form called `/api/referral/apply` for referral codes, but no REST route existed — returned 404.
**Fix:** Created `src/app/api/referral/apply/route.ts` — validates referral code, returns referrer org name.
**Files:** `src/app/api/referral/apply/route.ts` (new)

### 2. `window.location.reload()` in SPA
**Problem:** System detail page used `window.location.reload()` after reclassification — full page reload breaks SPA navigation, loses client state.
**Fix:** Replaced with `trpc.useUtils().system.get.invalidate()` — granular tRPC query refetch.
**Files:** `src/app/[locale]/(dashboard)/systems/[id]/page.tsx`

### 3. `/register` → 404
**Problem:** "Get Started Free" button linked to `/register` which didn't exist.
**Fix:** Created redirect page `/register` → `/login?mode=register`. Updated login form to handle `?mode=register` query param — auto-toggles to signup mode.
**Files:** `src/app/[locale]/(marketing)/register/page.tsx` (new), `src/app/[locale]/(marketing)/login/login-form.tsx`

### 4. No forgot/reset password flow
**Problem:** Login form had "Forgot password?" link but no pages or API existed.
**Fix:** Full password reset flow:
- `POST /api/auth/forgot-password` — generates secure token (32 bytes hex, 1hr expiry), sends branded HTML email via Resend, prevents email enumeration (always returns success)
- `POST /api/auth/reset-password` — validates token, hashes with bcryptjs, updates user, deletes used token
- `/forgot-password` — email input form with success state
- `/reset-password` — password + confirm form with token/email from URL, Suspense wrapper for searchParams

**Files:**
- `src/app/api/auth/forgot-password/route.ts` (new)
- `src/app/api/auth/reset-password/route.ts` (new)
- `src/app/[locale]/(marketing)/forgot-password/page.tsx` (new)
- `src/app/[locale]/(marketing)/forgot-password/forgot-password-content.tsx` (new)
- `src/app/[locale]/(marketing)/reset-password/page.tsx` (new)
- `src/app/[locale]/(marketing)/reset-password/reset-password-content.tsx` (new)

---

## 🟡 UX & i18n Fixes

### 5. Sidebar hardcoded plan/usage
**Problem:** Dashboard sidebar displayed hardcoded "Free Plan" and "0/1 AI Systems" instead of real data.
**Fix:** Replaced with live tRPC query `system.getCount` — shows actual plan name and usage.
**Files:** `src/components/dashboard/sidebar.tsx`

### 6. Login form hardcoded English strings
**Problem:** 11 strings in login form were hardcoded English — didn't translate.
**Fix:** Replaced all with `t()` calls. Added 22 `auth.*` keys to all 7 locales.
**Files:** `src/app/[locale]/(marketing)/login/login-form.tsx`, `src/i18n/messages/*.json`

### 7. User menu hardcoded strings + dead link
**Problem:** User dropdown had hardcoded "Settings", "Sign out" strings and linked to `/settings/profile` (non-existent).
**Fix:** Replaced with `useTranslations`, fixed link to `/settings`.
**Files:** `src/components/dashboard/user-menu.tsx`

### 8. Reports page `window.location.href`
**Problem:** Reports page used `window.location.href = '/systems'` — breaks SPA.
**Fix:** Replaced with `router.push('/systems')`.
**Files:** `src/app/[locale]/(dashboard)/reports/page.tsx`

### 9. Light-mode colors in dark-theme dashboard (7 pages)
**Problem:** Multiple dashboard pages had light-mode Tailwind classes (`bg-blue-100`, `bg-gray-100`, `bg-yellow-50`, `bg-blue-50`, etc.) that clashed with the dark `bg-[#0F172A]` theme.
**Fix:** Replaced with dark-mode equivalents using opacity modifiers:
| Old | New |
|-----|-----|
| `bg-blue-100 text-blue-800` | `bg-blue-500/10 text-blue-400` |
| `bg-gray-100 text-gray-800` | `bg-white/10 text-white/70` |
| `bg-green-100 text-green-800` | `bg-emerald-500/10 text-emerald-400` |
| `bg-purple-100 text-purple-800` | `bg-purple-500/10 text-purple-400` |
| `bg-yellow-50` | `bg-amber-500/10` |
| `bg-blue-50` | `bg-blue-500/10` |
| `bg-gray-50` (pricing enterprise) | `bg-white/[0.03]` |

**Files:**
- `src/app/[locale]/(dashboard)/evidence/[id]/page.tsx`
- `src/app/[locale]/(dashboard)/evidence/new/page.tsx`
- `src/app/[locale]/(dashboard)/vendors/new/page.tsx`
- `src/app/[locale]/(dashboard)/vendors/[id]/page.tsx`
- `src/app/[locale]/(dashboard)/vendors/loading.tsx`
- `src/app/[locale]/(dashboard)/intelligence/loading.tsx`
- `src/app/[locale]/(marketing)/pricing/page.tsx` (Enterprise section)

### 10. Removed `console.error` from client components
**Problem:** Vendor new and evidence new pages had `console.error()` calls in client code — leaks internal details in browser console.
**Fix:** Removed. Server-side `console.error` in API routes retained for Sentry/logging.
**Files:** `src/app/[locale]/(dashboard)/vendors/new/page.tsx`, `src/app/[locale]/(dashboard)/evidence/new/page.tsx`

---

## 🌐 i18n Improvements

### 11. Footer hardcoded English
**Problem:** Footer description, copyright, and "Built for" text were hardcoded English.
**Fix:** Replaced 3 strings with `t('description')`, `t('allRightsReserved')`, `t('builtFor')`. Added translations to all 7 locales.
**Files:** `src/components/shared/footer.tsx`, `src/i18n/messages/*.json`

### 12. About page 13+ hardcoded English strings
**Problem:** Section badges ("Our Story", "Why we exist", etc.), H1 prefix "About", mission paragraph, blockquote, stat labels/values — all English only.
**Fix:** Extracted 14 strings to i18n keys with translations. Refactored to server+client component pattern for SEO metadata.
**Files:** `src/app/[locale]/(marketing)/about/page.tsx`, `src/app/[locale]/(marketing)/about/about-content.tsx` (new), `src/i18n/messages/*.json`

### 13. Pricing Enterprise badge hardcoded
**Problem:** "Enterprise" section badge was English-only.
**Fix:** Replaced with `t('enterprise.badge')`, added 7 locale translations.
**Files:** `src/app/[locale]/(marketing)/pricing/page.tsx`, `src/i18n/messages/*.json`

### 14. Reset password API error leaking English
**Problem:** Client-side reset-password form displayed raw API error messages ("Invalid or expired reset link") regardless of locale.
**Fix:** Replaced `data.error` with localized `t('invalidOrExpiredResetLink')` keyed by HTTP status.
**Files:** `src/app/[locale]/(marketing)/reset-password/reset-password-content.tsx`, `src/i18n/messages/*.json`

### 15. Locale key drift — 3711 stale keys removed
**Problem:** Non-EN locale files had 52% more keys than EN — stale keys from old translations, legal page arrays, duplicates.
**Fix:** Created `scripts/sync-locale-keys.mjs` — compares all locales against EN source, removes extra keys, reports missing keys. Cleaned all 6 non-EN files.

| Locale | Before | After | Removed |
|--------|--------|-------|---------|
| fr | 2,402 | 1,583 | 819 |
| de | 2,343 | 1,583 | 760 |
| pt | 2,375 | 1,583 | 792 |
| ar | 2,099 | 1,583 | 516 |
| pl | 2,346 | 1,583 | 763 |
| it | 1,644 | 1,583 | 61 |

**Usage:** `pnpm i18n:sync` (dry run), `pnpm i18n:sync:fix` (auto-clean)
**Files:** `scripts/sync-locale-keys.mjs` (new), `src/i18n/messages/*.json`, `package.json`

---

## 🔍 SEO Improvements

### 16. OG & Twitter meta tags added
**Problem:** No OpenGraph or Twitter Card meta tags — shared links showed blank cards in social media/messengers.
**Fix:** Added comprehensive metadata to root layout:
- `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`
- `og:locale:alternate` for all 7 locales
- `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- `metadataBase` for relative URL resolution
- `keywords`, `authors`, `creator`, `robots` with googleBot directives
- `alternates.languages` for hreflang

**Files:** `src/app/[locale]/layout.tsx`

### 17. Dynamic OG image endpoint
**Problem:** No OG image for social media previews.
**Fix:** Created `/api/og` Edge route using `next/og` (ImageResponse). Renders branded 1200×630 PNG with:
- Complyance logo + name
- Dynamic `?title=` and `?description=` params
- Dark gradient background matching brand
- "EU AI Act Ready" badge
- `complyance.io` URL

Per-page metadata uses custom title/description via query params.
**Files:** `src/app/api/og/route.tsx` (new)

### 18. Per-page generateMetadata for 4 pages
**Problem:** About, Partners, Forgot-password, Reset-password pages had no per-page SEO metadata.
**Fix:** Refactored each to server+client component pattern (server page exports `generateMetadata`, renders client component). Each gets localized title + description + custom OG image.
**Files:**
- `src/app/[locale]/(marketing)/about/page.tsx` + `about-content.tsx`
- `src/app/[locale]/(marketing)/partners/page.tsx` + `partners-content.tsx`
- `src/app/[locale]/(marketing)/forgot-password/page.tsx` + `forgot-password-content.tsx`
- `src/app/[locale]/(marketing)/reset-password/page.tsx` + `reset-password-content.tsx`

---

## 🧪 E2E Test Suite

### 19. Playwright smoke test suite
Created `tests/smoke.spec.ts` — 40 parametric tests across 8 groups:

| Group | Tests | Coverage |
|-------|-------|----------|
| Marketing pages | 11 | All public pages load HTTP 200, no JS errors |
| Auth redirects | 10 | All protected routes redirect to `/login` |
| Login form | 3 | Email/password/submit, Google OAuth, register toggle |
| i18n | 7 | All 7 locales render with correct `lang`, Arabic `dir="rtl"` |
| API endpoints | 4 | Health check, register, contact, referral validation |
| Critical path | 1 | Register → Login via API → Dashboard with sidebar |
| Content checks | 3 | Pricing tiers, blog articles, classifier form |
| 404 handling | 1 | Unknown route returns 404 |

**Configuration:** `playwright.config.ts` — 2 workers, 1 retry, `domcontentloaded` wait strategy
**Files:** `tests/smoke.spec.ts`, `playwright.config.ts`

---

## 📁 Complete File Manifest

### New files (14)
```
src/app/api/og/route.tsx                                    # Dynamic OG image
src/app/api/referral/apply/route.ts                         # Referral code API
src/app/api/auth/forgot-password/route.ts                   # Forgot password API
src/app/api/auth/reset-password/route.ts                    # Reset password API
src/app/[locale]/(marketing)/register/page.tsx              # /register redirect
src/app/[locale]/(marketing)/forgot-password/page.tsx       # Server wrapper
src/app/[locale]/(marketing)/forgot-password/forgot-password-content.tsx
src/app/[locale]/(marketing)/reset-password/page.tsx        # Server wrapper
src/app/[locale]/(marketing)/reset-password/reset-password-content.tsx
src/app/[locale]/(marketing)/about/about-content.tsx        # Client component
src/app/[locale]/(marketing)/partners/partners-content.tsx  # Client component
scripts/sync-locale-keys.mjs                                # Locale sync tool
tests/smoke.spec.ts                                         # E2E smoke tests
.gsd/preferences.md                                         # Verification commands
```

### Modified files (19)
```
src/app/[locale]/layout.tsx                                 # OG/Twitter/SEO metadata
src/app/[locale]/(marketing)/about/page.tsx                 # Server wrapper + i18n
src/app/[locale]/(marketing)/pricing/page.tsx               # Enterprise dark-mode + i18n
src/app/[locale]/(marketing)/login/login-form.tsx           # i18n + ?mode=register
src/app/[locale]/(dashboard)/systems/[id]/page.tsx          # trpc invalidation
src/app/[locale]/(dashboard)/reports/page.tsx               # SPA navigation
src/app/[locale]/(dashboard)/evidence/[id]/page.tsx         # Dark-mode colors
src/app/[locale]/(dashboard)/evidence/new/page.tsx          # Dark-mode + console cleanup
src/app/[locale]/(dashboard)/vendors/new/page.tsx           # Dark-mode + console cleanup
src/app/[locale]/(dashboard)/vendors/[id]/page.tsx          # Dark-mode colors
src/app/[locale]/(dashboard)/vendors/loading.tsx            # Dark-mode colors
src/app/[locale]/(dashboard)/intelligence/loading.tsx       # Dark-mode colors
src/components/dashboard/sidebar.tsx                        # Live tRPC plan data
src/components/dashboard/user-menu.tsx                      # i18n + link fix
src/components/shared/footer.tsx                            # i18n (3 strings)
src/i18n/messages/{en,fr,de,pt,ar,pl,it}.json              # +40 keys, -3711 stale keys
package.json                                                # i18n:sync scripts
playwright.config.ts                                        # Test config
```

---

## Post-Launch TODO

These items are tracked but not blocking launch:

1. **Paddle verification** — Required for paid plan checkout to work. Webhooks are implemented.
2. **incidentRouter** — EU AI Act requires incident logging for high-risk systems. Schema exists, router not yet implemented.
3. **teamRouter** — Professional plan promises 3 seats, Scale 10 seats. No team management UI yet.
4. **BullMQ classification queue** — Classification runs inline. For production scale, should use Redis queue to avoid blocking requests.
5. **Branded email templates** — Forgot-password email has basic HTML branding. Other transactional emails (welcome, plan change) need templates.
