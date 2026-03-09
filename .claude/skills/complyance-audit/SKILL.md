---
name: complyance-audit
description: "Full-stack audit, testing, and bug-fixing skill for the Complyance AI compliance SaaS platform. Use this skill whenever working on the Complyance codebase — including running builds, fixing TypeScript errors, auditing tRPC routers, validating Prisma schema, checking i18n translations, testing the classification engine, reviewing security headers, verifying Paddle integration, or preparing for Railway deployment. Also trigger when the user asks to 'audit', 'test', 'fix bugs', 'check the build', 'review code', 'prepare for deploy', or mentions any Complyance-specific module (classification, gap analysis, evidence vault, vendor risk, compliance badge, regulatory intelligence, document generation, referral system). This skill ensures files, correct configurations, and validation rules."
---

# Complyance Audit & Fix Skill

## When to use
Trigger this skill for ANY of these: build errors, lint errors, TypeScript errors, Prisma schema issues, tRPC router debugging, i18n translation gaps, classification engine issues, Paddle webhook problems, PDF generation failures, security audit, pre-deployment checks, general "audit"/"test"/"fix" requests.

## First Steps — Always Do These
1. Read CLAUDE.md in project root
2. Run quick health check:
```bash
pnpm tsc --noEmit 2>&1 | tail -20
pnpm lint 2>&1 | tail -20
npx prisma validate
```
3. Based on errors, read relevant reference file from references/

## Project Quick Reference
- Next.js 14+ (App Router), TypeScript strict, Tailwind + shadcn/ui
- tRPC, Prisma + PostgreSQL, NextAuth.js v5
- Anthropic Claude API (Sonnet, temp=0), Paddle (MoR), Resend
- next-intl (7 locales: en, fr, de, pt, ar, pl, it — Arabic RTL)
- BullMQ + Redis, Sentry, PostHog, Railway deploy

## Critical Conventions
- ALL user-facing strings → translation keys, NEVER hardcoded
- Tailwind: logical properties (ms-/me-/ps-/pe-, NOT ml-/mr-/pl-/pr-)
- Classification: temperature=0, structured JSON, always validate
- Every PDF/report → legal disclaimer
- Admin routes → check ADMIN_EMAIL
- Plan limits → enforce server-side via tRPC middleware

## Audit Phases
Phase 1: Build Health → read references/build-checks.md
Phase 2: Data Layer → read references/data-layer.md
Phase 3: API Layer → read references/api-layer.md
Phase 4: Classification Engine → read references/classification.md
Phase 5: Frontend → read references/frontend.md
Phase 6: Security & Deploy → read references/security-deploy.md
Phase 7: Tests → run existing, create missing for critical paths

Commit after each phase: git commit -m "audit(phase-N): description"
