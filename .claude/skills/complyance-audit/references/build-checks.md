# Build Checks Reference

## TypeScript: pnpm tsc --noEmit
Common fixes:
- Missing "use client" on components with hooks
- Import paths: use @/ alias (src/)
- tRPC: export AppRouter type
- Prisma: run npx prisma generate after schema changes
- next-intl: useTranslations() needs valid namespace

## Lint: pnpm lint
- Remove unused imports
- Fix React hooks deps
- Replace any with proper types

## Prisma: npx prisma validate → npx prisma generate → npx prisma migrate status

## Build: pnpm build
Common failures:
- Dynamic server in static pages → export const dynamic = 'force-dynamic'
- Missing NEXT_PUBLIC_ prefix for client env vars
- Image remotePatterns in next.config
- Middleware matcher conflicts
