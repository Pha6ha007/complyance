# S03: Contact & Partner Email Sending

**Goal:** Contact and partner form submissions deliver emails via Resend. No console.log in either route.
**Demo:** POST to `/api/contact` sends email to support@complyance.io + confirmation to submitter. POST to `/api/partners` sends email to partnerships@complyance.io + confirmation to applicant. Zero console.log in both files.

## Must-Haves

- Contact form sends internal notification + user confirmation via `sendEmail` from `@/server/services/email`
- Partner form sends internal notification + applicant confirmation via same
- Both routes gracefully handle missing RESEND_API_KEY (the service already does this)
- Zero console.log in either route file

## Verification

- `npx tsc --noEmit` — zero TypeScript errors
- `rg 'console\.log' src/app/api/contact/route.ts src/app/api/partners/route.ts` — zero matches
- `rg 'TODO' src/app/api/contact/route.ts src/app/api/partners/route.ts` — zero matches

## Tasks

- [x] **T01: Wire contact form to sendEmail** `est:15m`
  - Why: Route returns 200 but silently drops submissions — the Resend code is commented out and uses inline `require('resend')` instead of the existing service
  - Files: `src/app/api/contact/route.ts`
  - Do:
    - Import `sendEmail` from `@/server/services/email`
    - Replace the commented-out block and `console.log` with two `sendEmail` calls: internal notification to support@complyance.io and confirmation to submitter
    - Remove `console.log('Contact form submission:', data)`
    - Keep the existing Zod validation and error handling
  - Verify: `npx tsc --noEmit`, `rg 'console\.log\|TODO' src/app/api/contact/route.ts` returns nothing
  - Done when: Contact route uses sendEmail, no console.log, no TODO

- [x] **T02: Wire partner form to sendEmail** `est:15m`
  - Why: Same issue — partner applications silently dropped
  - Files: `src/app/api/partners/route.ts`
  - Do:
    - Import `sendEmail` from `@/server/services/email`
    - Replace commented-out block and `console.log` with two `sendEmail` calls: internal to partnerships@complyance.io and confirmation to applicant
    - Remove `console.log('Partnership application:', data)`
  - Verify: `npx tsc --noEmit`, `rg 'console\.log\|TODO' src/app/api/partners/route.ts` returns nothing
  - Done when: Partner route uses sendEmail, no console.log, no TODO

## Files Likely Touched

- `src/app/api/contact/route.ts`
- `src/app/api/partners/route.ts`
