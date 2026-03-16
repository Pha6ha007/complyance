# Project: Complyance — AI Compliance Platform

Self-serve SaaS for AI compliance management. Target: SMB/SaaS companies selling into EU, US, UAE.

**Core proposition:** "Credo AI for companies that can't afford Credo AI."

## Summary

Complyance is a Next.js 14 App Router monolith (TypeScript, Tailwind CSS, shadcn/ui) deployed on Railway. It provides AI-powered EU AI Act classification, compliance gap analysis, PDF document generation, vendor risk assessment, evidence vault, and regulatory intelligence — all behind a Paddle-powered self-serve billing flow.

**Key highlights:**
- Classification engine: rule-based pre-filter → Claude Sonnet (temp=0) → validation → gap analysis → compliance score
- 7 locales (en, fr, de, pt, ar, pl, it) with full RTL Arabic support
- 4-tier plan (Free / Starter $99 / Professional $249 / Scale $499)
- 4 Railway services: web, postgres, redis, BullMQ worker
- Auth: NextAuth.js v5 (email + Google OAuth, JWT sessions)
- AI: Anthropic Claude API for classification and document analysis
- Payments: Paddle (Merchant of Record)

## Deadline

EU AI Act high-risk compliance deadline: **August 2, 2026**

## Context

Solo founder project. No sales team — all self-serve. Prefer simplicity over cleverness.

## Status

Phases 1–5 complete (foundation, core classification, documents/payments, competitive features, launch prep). Remaining post-launch work: referral system, incident register, team management, additional PDF templates, CI/CD API.
