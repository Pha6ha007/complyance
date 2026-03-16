# S02: Settings Page & Pricing i18n

**Goal:** Settings page loads real user/org data from the database and persists changes via tRPC. Pricing page renders translated feature text correctly in all 7 locales (no raw keys or broken plural formatting).
**Demo:** Settings page shows the logged-in user's actual name/email/org from DB. Clicking save persists changes. Pricing page shows "Vendor Risk Assessments" (not raw ICU syntax or blank) for features that use plural formatting.

## Must-Haves

- Settings page fetches user name, email, and org name from DB via tRPC query on mount
- Save Profile and Save Organization buttons call tRPC mutations that persist to DB
- Success/error feedback via toast after save
- Pricing page passes `count` param to all ICU plural messages (vendors, biasTesting on excluded features)
- Subscription section on settings shows real org plan from DB (not hardcoded "Free")

## Proof Level

- This slice proves: integration (tRPC round-trip to DB, i18n plural rendering)
- Real runtime required: yes (dev server)
- Human/UAT required: yes (verify settings save round-trip, pricing text in non-en locale)

## Verification

- `npx tsc --noEmit` — zero TypeScript errors
- `rg 'TODO.*tRPC' src/app/\[locale\]/(dashboard)/settings/page.tsx` — zero matches
- `rg "useState\('Pavel'\)" src/` — zero matches (no hardcoded user data)
- Every `t('features.*')` call in pricing page that uses a plural message passes `{ count }` param

## Tasks

- [x] **T01: Add settings tRPC procedures** `est:30m`
  - Why: No tRPC procedures exist for reading or updating user profile or organization settings. Need `getSettings` query and `updateProfile`/`updateOrganization` mutations.
  - Files: `src/server/routers/system.ts` (add to existing router to avoid touching `_app.ts`)
  - Do:
    - Add `getSettings` query on `systemRouter` — returns `{ user: { name, email }, organization: { name, plan, locale } }` from `ctx.user` and `ctx.organization` (already loaded by `protectedProcedure`)
    - Add `updateProfile` mutation — accepts `{ name: string, email: string }`, updates `User` record, validates email uniqueness
    - Add `updateOrganization` mutation — accepts `{ name: string }`, updates `Organization` record
    - All three use `protectedProcedure`
    - Zod validation on inputs with sensible limits
  - Verify: `npx tsc --noEmit`
  - Done when: Three new procedures on systemRouter compile and have proper Zod schemas

- [x] **T02: Wire settings page to tRPC** `est:45m`
  - Why: Settings page has hardcoded `useState('Pavel')` etc. and TODO stubs for save handlers. Needs to load real data and persist changes.
  - Files: `src/app/[locale]/(dashboard)/settings/page.tsx`
  - Do:
    - Import `trpc` client and `toast` (sonner)
    - Replace hardcoded `useState` values with empty defaults
    - Add `trpc.system.getSettings.useQuery()` — populate state from data on load
    - Wire `handleSaveProfile` to `trpc.system.updateProfile.useMutation()` with success/error toast
    - Wire `handleSaveOrganization` to `trpc.system.updateOrganization.useMutation()` with success/error toast
    - Show real plan from query data in the Subscription section instead of hardcoded "Free Plan" / "Free"
    - Add loading state (disable save button while mutating)
  - Verify: `npx tsc --noEmit`, `rg 'TODO.*tRPC' src/app/\[locale\]/(dashboard)/settings/page.tsx` returns nothing
  - Done when: Settings page compiles, no TODO stubs, no hardcoded user data

- [x] **T03: Fix pricing page plural i18n calls** `est:15m`
  - Why: `t('features.vendors')` and `t('features.biasTesting')` are called without `{ count }` param on plans where the feature is excluded. The ICU plural messages require `count` — without it, `next-intl` may render raw syntax or blank text.
  - Files: `src/app/[locale]/(marketing)/pricing/page.tsx`
  - Do:
    - Free plan: change `t('features.vendors')` → `t('features.vendors', { count: 0 })`
    - Free plan: change `t('features.alerts')` — check if it uses plural (it doesn't — simple string, skip)
    - Starter plan: change `t('features.biasTesting')` → `t('features.biasTesting', { count: 0 })`
    - Audit all other `t('features.*')` calls to ensure plural messages always receive `count`
  - Verify: `npx tsc --noEmit`, no `t('features.vendors')` or `t('features.biasTesting')` calls without count param
  - Done when: All ICU plural feature messages have their required params

## Files Likely Touched

- `src/server/routers/system.ts`
- `src/app/[locale]/(dashboard)/settings/page.tsx`
- `src/app/[locale]/(marketing)/pricing/page.tsx`
