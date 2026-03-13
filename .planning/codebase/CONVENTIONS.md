# Coding Conventions

**Analysis Date:** 2026-03-13

## Naming Patterns

**Files:**
- Utilities and service functions: `kebab-case.ts` (e.g., `classification-engine.ts`, `email-sender.ts`)
- React components: `PascalCase.tsx` (e.g., `ClassificationWizard.tsx`, `LoginForm.tsx`)
- Pages and routes: `kebab-case/page.tsx` or `[dynamic]/page.tsx` in Next.js app router structure
- API routes: `route.ts` in `app/api/[path]/route.ts`

**Functions:**
- Exported functions and methods: camelCase (e.g., `classifyAISystem`, `generateComplianceGaps`, `calculateVendorRiskScore`)
- Async functions prefixed with `async` keyword
- Helper/private functions inside files also use camelCase
- Service functions clearly indicate purpose: `calculate*`, `generate*`, `validate*`, `analyze*`, `create*`, `update*`

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `PLAN_LIMITS`, `RATE_LIMIT_MAX`)
- Variables and parameters: camelCase (e.g., `formData`, `riskLevel`, `systemId`)
- Booleans prefixed with `is`, `has`, or `should` (e.g., `isLoading`, `hasEvidenceVault`, `shouldRunAIAssessment`)

**Types:**
- Interfaces: PascalCase (e.g., `VendorAssessmentInput`, `ClassificationEngineResult`, `FormData`)
- Type aliases: PascalCase (e.g., `ClassificationInput`, `Locale`)
- Enum values from Prisma: PascalCase prefixed (e.g., `AIType`, `RiskLevel`, `Plan`)

## Code Style

**Formatting:**
- Tool: ESLint (Next.js config: `"extends": ["next/core-web-vitals", "next/typescript"]`)
- File: `.eslintrc.json` (root level)
- TypeScript strict mode enabled
- No automatic Prettier config found; relies on ESLint for formatting

**Linting:**
- ESLint configuration extends Next.js recommended rules and TypeScript
- No explicit per-line lint ignore comments in codebase
- Focus on type safety with strict TypeScript

## Import Organization

**Order (observed pattern):**
1. External/third-party imports (`zod`, `react`, `next-*`, `@trpc/server`, `@prisma/client`)
2. Sibling imports from `../` (relative paths)
3. Alias imports with `@/` (from `src/` root)
4. Type imports separated: `import type { ... } from '...'`

**Path Aliases:**
- `@/` resolves to `src/`
- Commonly used:
  - `@/components/` - React components
  - `@/lib/` - Utility functions (trpc, auth, blog, utils, constants)
  - `@/server/` - Backend routers and services
  - `@/i18n/` - Internationalization configuration and routing
  - `@/app/` - Next.js app directory

**Import examples from codebase:**
```typescript
// External first
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { AIType, RiskLevel } from '@prisma/client';

// Aliases after relative
import { getEffectiveSystemLimit } from '@/lib/constants';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc/client';
import { ClassificationWizard } from '@/components/systems/classification-wizard';
```

## Error Handling

**Patterns:**
- **tRPC errors:** Use `TRPCError` with specific error codes (`'FORBIDDEN'`, `'NOT_FOUND'`, `'BAD_REQUEST'`)
  ```typescript
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Evidence Vault is available on Professional plan and above',
  });
  ```
- **Validation:** Zod schemas with `.min()`, `.max()`, `.optional()`, `.nullable()` for schema-level errors
- **Try-catch blocks:** Used in async operations with error propagation
  ```typescript
  try {
    // operation
  } catch (error) {
    setError('An error occurred. Please try again.');
  }
  ```
- **Form validation:** Errors stored in state object `Record<string, string>`
- **Console logging:** Limited to specific cases (see TESTING.md section on console.log removal requirement)

## Logging

**Framework:** `console.log()` in development/debugging contexts (webhook handlers, main operations)

**Patterns observed:**
- Classification engine logs operation steps: `console.log('[Classification Engine] ...')`
- Webhook handlers log received events: `console.log('Paddle webhook received:', eventType)`
- Contact/partnership forms log submissions (should be removed or use Sentry)
- Limited production logging; would benefit from structured logging (Sentry is configured)

**Guidelines:**
- Development debugging: console.log acceptable with prefixes like `[Module Name]`
- Production: Use Sentry integration for error tracking (configured in project)
- Never log sensitive data (passwords, API keys, personal data)

## Comments

**When to Comment:**
- JSDoc comments for exported functions and interfaces explaining purpose and usage
- Step-by-step comments for complex logic (rule engines, classification steps, validation)
- Implementation notes and workarounds for non-obvious decisions

**JSDoc/TSDoc:**
Used for function exports and interfaces:
```typescript
/**
 * Vendor risk assessment input
 */
export interface VendorAssessmentInput {
  // fields...
}

/**
 * Calculate vendor risk score based on vendor attributes and target markets
 *
 * Score starts at 100 and deductions are applied based on risk factors.
 * Lower score = higher risk
 */
export function calculateVendorRiskScore(...): VendorRiskScoreResult {
```

- Block comments: `/** ... */` for descriptions
- Inline comments: `//` for clarifications within logic
- TODOs included: `// TODO: Replace with actual Paddle price ID`, `// TODO: Queue classification job`

## Function Design

**Size:**
- Average 30-100 lines per function
- Larger functions (300+ lines) mainly in page components due to form handling and rendering logic
- Service functions kept modular and composable (gaps, validation, rules, LLM in separate files)

**Parameters:**
- Destructured objects for multiple parameters
- Type-annotated function parameters
- Default parameters used in optional inputs: `.default(50)` in Zod, `= undefined` in function signatures
- ```typescript
  async function middleware(request: NextRequest) {
  .query(async ({ ctx, input }) => {
  ```

**Return Values:**
- Typed return values for all public functions
- Objects returned with clear property naming
- Null/undefined returned for optional data: `.optional().nullable()`
- Type-safe results from services:
  ```typescript
  export type ClassificationEngineResult = {
    riskLevel: RiskLevel;
    annexIIICategory: string | null;
    // ...
  };
  ```

## Module Design

**Exports:**
- Named exports preferred: `export function`, `export const`, `export interface`
- Default exports used for components: `export default function ComponentName`
- Barrel files used in `lib/`: `export { trpc } from './client'` in `lib/trpc/index.ts`

**Barrel Files:**
- `src/lib/trpc/index.ts` - exports trpc client and provider
- `src/components/ui/` - each component exports default
- Service directories use individual file exports: `export async function` from each file

**Service Layer Organization:**
Services organized by domain with internal helper functions:
- `src/server/services/classification/` - engine, rules, llm, validator, gaps
- `src/server/services/documents/` - generator, templates, PDF rendering
- `src/server/services/vendors/` - assessment, ai-assessment
- `src/server/services/evidence/` - integrity checks
- Each file exports specific functions; no directory-level barrel file

## Client vs Server Components

**Server Components (default):**
- Pages in `app/[locale]/` directory are server components by default
- Fetch translations with `await getTranslations()` in server components
- Used for: layouts, page rendering, static content, data fetching

**Client Components:**
- Marked with `'use client'` at top of file
- Used for: interactive forms, state management, event handlers
- Examples: `LoginForm`, `ClassificationWizard`, `ContactForm`
- Use `useTranslations()` hook for i18n in client components
- Use `useRouter()` from `@/i18n/navigation` for locale-aware routing

## Translation Keys

**Pattern:**
- ALL user-facing strings via i18n: `t('keyPath')` or `tModule('key')`
- No hardcoded English text in components (except legal disclaimers or special cases)
- Translation key structure: `namespace.section.key` (e.g., `systems.wizard.step1`, `auth.login`)
- 7 locales: en, fr, de, pt, ar, pl, it
- All locales kept in sync: 1056 keys per locale file in `src/i18n/messages/`

**Usage:**
```typescript
const t = useTranslations('systems.wizard');
const tCommon = useTranslations('common');
// Then: t('step1'), tCommon('button.submit')
```

## RTL Support (Arabic)

**Tailwind Logical Properties:**
- Use logical properties only: `ms-`, `me-`, `ps-`, `pe-` (margin/padding start/end)
- Never use directional properties: avoid `ml-`, `mr-`, `pl-`, `pr-`
- Applies to margin (`m`, `ms`, `me`, `mt`, `mb`) and padding (`p`, `ps`, `pe`, `pt`, `pb`)

## Database & Validation

**Zod Schemas:**
- Input validation for all tRPC procedures
- Schemas defined at router level with clear names: `createSystemSchema`, `updateEvidenceSchema`
- Comprehensive validation: `.min()`, `.max()`, `.enum()`, `.optional()`, `.nullable()`
- Error messages included: `.min(1, 'Name is required')`

**Prisma:**
- `@prisma/client` used for database access
- Queries include proper `.include()` for relations
- Pagination with `take` + `cursor` pattern for cursor-based pagination
- Type-safe queries with Prisma-generated types

## Architecture Patterns

**tRPC Router Organization:**
- Routers in `src/server/routers/`: `system.ts`, `classification.ts`, `vendor.ts`, `evidence.ts`, `document.ts`, `badge.ts`, `intelligence.ts`, `referral.ts`
- `_app.ts` merges all routers
- Procedures use `protectedProcedure` for auth-protected routes
- Input validation with Zod at procedure level

**Service Layer:**
- Business logic separated from routers in `src/server/services/`
- Service functions accept validated inputs from routers
- Database operations isolated in services
- Clear single responsibility per service file

---

*Convention analysis: 2026-03-13*
