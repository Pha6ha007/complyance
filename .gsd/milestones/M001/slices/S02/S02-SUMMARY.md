---
id: S02
parent: M001
milestone: M001
provides:
  - tRPC getSettings/updateProfile/updateOrganization procedures on systemRouter
  - Settings page wired to real DB data with save round-trip
  - Pricing page plural i18n calls fixed
requires: []
affects: []
key_files:
  - src/server/routers/system.ts
  - src/app/[locale]/(dashboard)/settings/page.tsx
  - src/app/[locale]/(marketing)/pricing/page.tsx
key_decisions:
  - Added settings procedures to existing systemRouter (avoids touching _app.ts)
  - Used ctx.user/ctx.organization from protectedProcedure (no extra DB query for getSettings)
  - Email uniqueness check on updateProfile
patterns_established:
  - Settings-style procedures live on systemRouter until a dedicated settings router is needed
observability_surfaces:
  - Toast feedback on save success/error
drill_down_paths: []
duration: ~25min
verification_result: passed
completed_at: 2026-03-16
---

# S02: Settings Page & Pricing i18n

**Settings page loads real user/org data from DB and persists changes via tRPC. Pricing page ICU plural messages now always receive required params.**

## What Happened

T01: Added three tRPC procedures to `systemRouter`: `getSettings` (returns user name/email + org name/plan/locale from already-loaded context), `updateProfile` (name + email with uniqueness check), and `updateOrganization` (name).

T02: Rewrote the settings page to use `trpc.system.getSettings.useQuery()` for data loading and mutations for saving. Removed all hardcoded state values (`'Pavel'`, `'g.pavel336@gmail.com'`, `'My Organization'`). Added loading/disabled states and toast feedback. Subscription section now shows real plan from DB.

T03: Fixed two `t('features.*')` calls on the pricing page that were missing the `{ count }` param for ICU plural messages: `vendors` on Free plan and `biasTesting` on Starter plan. Both now pass `{ count: 0 }`.

## Verification

- `npx tsc --noEmit` — 0 errors
- No `TODO.*tRPC` in settings page
- No `useState('Pavel')` or other hardcoded user data in src/
- All pricing page plural feature messages receive required params

## Deviations

None — executed as planned.

## Known Limitations

- Language selector on settings page still shows hardcoded "English" — no locale switch from settings yet (uses top nav)
- Notifications toggle is local state only — no DB field for notification preference
- Change Password and Delete Account buttons are not wired (out of M001 scope)

## Follow-ups

- None required for M001 completion

## Files Created/Modified

- `src/server/routers/system.ts` — added getSettings, updateProfile, updateOrganization procedures
- `src/app/[locale]/(dashboard)/settings/page.tsx` — wired to tRPC, real data, save mutations, toast feedback
- `src/app/[locale]/(marketing)/pricing/page.tsx` — fixed 2 plural i18n calls with missing count param

## Forward Intelligence

### What the next slice should know
- system.ts still has a `console.log('📊 Analytics: system_created', ...)` on line ~170 — S04 should clean this up

### What's fragile
- Nothing in this slice is fragile — standard tRPC CRUD pattern

### Authoritative diagnostics
- Settings save failures surface via toast.error with the actual tRPC error message

### What assumptions changed
- None — the pricing i18n issue was confirmed as missing plural params, not a deeper rendering problem
