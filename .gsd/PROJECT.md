# Project: Complyance — AI Compliance Platform

Self-serve SaaS for AI compliance management. Target: SMB/SaaS companies selling into EU, US, UAE.

**Core proposition:** "Credo AI for companies that can't afford Credo AI."

## Summary

Complyance is a Next.js 14 App Router monolith (TypeScript, Tailwind CSS, shadcn/ui) deployed on Railway. It provides AI-powered EU AI Act classification, compliance gap analysis, PDF document generation, vendor risk assessment, evidence vault, regulatory intelligence, bias testing, SDK integration, and cryptographic compliance badges — all behind a Paddle-powered self-serve billing flow.

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

All 6 integration milestones complete:
- M001: Launch Readiness (Paddle billing, settings, email, cleanup)
- M002: Regulatory Intelligence (28 legislation entries, cron sync, browser UI)
- M003: Deep Scan (keyword-based risk detection on free classifier)
- M004: Bias Testing (TypeScript DI/SPD analysis, Evidence integration)
- M005: SDK Integration (webhook endpoint, API key management)
- M006: Cryptographic Badge (W3C Verifiable Credentials, Ed25519)

Remaining post-launch work: referral system, incident register, team management, additional PDF templates.
