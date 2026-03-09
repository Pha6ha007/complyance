# CLAUDE.md — Complyance | AI Compliance Platform

## Project Overview

Complyance is a self-serve SaaS platform for AI compliance management, targeting SMB and SaaS companies selling into EU, US, and UAE markets. The platform helps companies classify AI systems by risk level, identify compliance gaps, generate documentation, and manage ongoing compliance obligations.

**Core value proposition:** "Credo AI for companies that can't afford Credo AI."

**Business context:**
- EU AI Act high-risk deadline: August 2, 2026
- Target markets: US, EU, UAE
- Solo founder, Paddle payments, no sales team
- All features must be self-serve

---

## Tech Stack — FINAL DECISIONS

### Monorepo on Railway (single platform for deploy)

We use **Railway** as the single deployment platform for both frontend and backend. Railway supports monorepo with multiple services, automatic deploys from GitHub, environment variables, and PostgreSQL.

**Why Railway over alternatives:**
- Vercel = great for frontend, but backend/cron jobs require workarounds
- Separate platforms = operational complexity for solo founder
- Railway = one platform, one bill, one dashboard, supports everything

### Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Framework** | Next.js 14+ (App Router) | SSR for SEO landing pages + SPA for dashboard |
| **Language** | TypeScript | Type safety across full stack |
| **Frontend UI** | Tailwind CSS + shadcn/ui | Fast, consistent, accessible |
| **Backend API** | Next.js Route Handlers + tRPC | End-to-end type safety, no separate API server |
| **Database** | PostgreSQL (Railway native) | Railway provides managed Postgres |
| **ORM** | Prisma | Type-safe queries, migrations, seeding |
| **Auth** | NextAuth.js (Auth.js v5) | Email + Google OAuth, JWT sessions |
| **AI Engine** | Anthropic Claude API (Sonnet) | Classification + document generation |
| **Payments** | Paddle (Billing) | MoR, handles taxes globally, works from Belarus |
| **Email** | Resend | Transactional emails, cheap, good DX |
| **File Storage** | AWS S3 (or Cloudflare R2) | Generated PDFs, uploaded evidence |
| **PDF Generation** | @react-pdf/renderer + puppeteer | Branded compliance reports |
| **i18n** | next-intl | Multi-language support |
| **Cron Jobs** | Railway cron service | Regulatory intelligence, scheduled tasks |
| **Queue** | BullMQ + Redis (Railway) | Async doc generation, AI classification |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | PostHog (self-hosted or cloud) | Product analytics, funnels |

### Monorepo Structure

```
complyance/
├── CLAUDE.md                          # THIS FILE — primary project guide
├── docs/                              # Project documentation
│   ├── ARCHITECTURE.md                # System architecture
│   ├── DATABASE.md                    # Database schema & migrations
│   ├── API.md                         # API endpoints reference
│   ├── AI_ENGINE.md                   # Classification logic & prompts
│   ├── I18N.md                        # Internationalization guide
│   ├── DEPLOYMENT.md                  # Railway deployment guide
│   ├── COMPLIANCE_LOGIC.md            # EU AI Act rules engine
│   └── PADDLE_INTEGRATION.md         # Payment integration guide
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── seed.ts                        # Seed data (regulations, categories)
│   └── migrations/                    # Migration history
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── [locale]/                  # Locale-prefixed routes
│   │   │   ├── (marketing)/           # Public pages (landing, pricing, blog)
│   │   │   │   ├── page.tsx           # Landing page
│   │   │   │   ├── pricing/
│   │   │   │   ├── blog/
│   │   │   │   └── free-classifier/   # Free AI Act Risk Classifier tool
│   │   │   ├── (auth)/                # Auth pages
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   └── (dashboard)/           # Protected app
│   │   │       ├── dashboard/
│   │   │       ├── systems/           # AI System inventory
│   │   │       │   ├── page.tsx       # List all systems
│   │   │       │   ├── new/           # Add new AI system wizard
│   │   │       │   └── [id]/          # System detail
│   │   │       │       ├── page.tsx
│   │   │       │       ├── classification/
│   │   │       │       ├── gaps/
│   │   │       │       └── documents/
│   │   │       ├── vendors/           # AI Vendor risk assessment
│   │   │       ├── evidence/          # Evidence vault
│   │   │       ├── incidents/         # Incident & risk register
│   │   │       ├── reports/           # Generated reports
│   │   │       ├── intelligence/      # Regulatory intelligence feed
│   │   │       ├── settings/
│   │   │       ├── referrals/         # Referral program dashboard
│   │   │       └── team/              # Team management
│   │   └── api/                       # API routes
│   │       ├── trpc/[trpc]/           # tRPC handler
│   │       ├── webhooks/
│   │       │   ├── paddle/            # Paddle webhook
│   │       │   └── stripe/            # (future)
│   │       ├── public/                # Public API (CI/CD)
│   │       │   └── v1/
│   │       │       ├── classify/
│   │       │       ├── status/
│   │       │       └── badge/
│   │       └── cron/                  # Cron endpoints
│   │           ├── regulatory-scan/
│   │           └── compliance-check/
│   ├── server/                        # Server-side logic
│   │   ├── routers/                   # tRPC routers
│   │   │   ├── system.ts
│   │   │   ├── classification.ts
│   │   │   ├── vendor.ts
│   │   │   ├── document.ts
│   │   │   ├── evidence.ts
│   │   │   ├── incident.ts
│   │   │   ├── intelligence.ts
│   │   │   ├── team.ts
│   │   │   ├── billing.ts
│   │   │   └── referral.ts
│   │   ├── services/                  # Business logic
│   │   │   ├── classification/
│   │   │   │   ├── engine.ts          # Main classification engine
│   │   │   │   ├── rules.ts           # Rule-based pre-filter
│   │   │   │   ├── llm.ts            # LLM classification
│   │   │   │   ├── validator.ts       # Post-LLM validation
│   │   │   │   └── regulations/       # Regulation-specific logic
│   │   │   │       ├── eu-ai-act.ts
│   │   │   │       ├── colorado.ts
│   │   │   │       ├── nyc-ll144.ts
│   │   │   │       └── uae.ts
│   │   │   ├── documents/
│   │   │   │   ├── generator.ts       # PDF generation orchestrator
│   │   │   │   ├── templates/         # Document templates
│   │   │   │   │   ├── classification-report.tsx
│   │   │   │   │   ├── annex-iv.tsx
│   │   │   │   │   ├── roadmap.tsx
│   │   │   │   │   ├── vendor-assessment.tsx
│   │   │   │   │   └── model-card.tsx
│   │   │   │   └── pdf.ts            # PDF rendering
│   │   │   ├── vendors/
│   │   │   │   ├── assessment.ts      # Vendor risk scoring
│   │   │   │   └── questionnaire.ts   # Questionnaire generator
│   │   │   ├── evidence/
│   │   │   ├── intelligence/
│   │   │   │   ├── scanner.ts         # Regulatory change scanner
│   │   │   │   └── notifier.ts        # Alert system
│   │   │   ├── badge/
│   │   │   │   ├── generator.ts       # SVG/HTML badge generation
│   │   │   │   └── verifier.ts        # Public verification page
│   │   │   └── billing/
│   │   │       └── paddle.ts          # Paddle integration
│   │   │   ├── referral/
│   │   │   │   ├── code.ts            # Code generation & validation
│   │   │   │   ├── rewards.ts         # Reward granting logic
│   │   │   │   └── tracking.ts        # Referral analytics
│   │   ├── ai/                        # AI/LLM layer
│   │   │   ├── client.ts             # Anthropic client wrapper
│   │   │   ├── prompts/              # System prompts
│   │   │   │   ├── classification.ts
│   │   │   │   ├── gap-analysis.ts
│   │   │   │   ├── document-gen.ts
│   │   │   │   └── vendor-risk.ts
│   │   │   └── schemas/              # Structured output schemas
│   │   │       ├── classification-result.ts
│   │   │       └── vendor-risk-result.ts
│   │   └── db/                        # Database utilities
│   │       └── client.ts             # Prisma client
│   ├── lib/                           # Shared utilities
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── dashboard/
│   │   ├── systems/
│   │   ├── vendors/
│   │   ├── documents/
│   │   ├── marketing/
│   │   └── shared/
│   │       ├── locale-switcher.tsx
│   │       └── compliance-badge.tsx
│   ├── hooks/                         # Custom React hooks
│   ├── i18n/                          # Internationalization
│   │   ├── config.ts                  # i18n configuration
│   │   ├── request.ts                # next-intl request config
│   │   └── messages/                  # Translation files
│   │       ├── en.json               # English (primary)
│   │       ├── fr.json               # French
│   │       ├── de.json               # German
│   │       ├── pt.json               # Portuguese
│   │       ├── ar.json               # Arabic
│   │       ├── pl.json               # Polish
│   │       └── it.json               # Italian
│   └── styles/
│       └── globals.css
├── public/
│   ├── locales/                       # Static locale assets
│   └── badges/                        # Badge templates
├── scripts/
│   ├── seed-regulations.ts            # Seed EU AI Act, NIST, etc.
│   └── generate-translations.ts       # AI-assisted translation helper
├── tests/
│   ├── classification/                # Classification engine tests
│   ├── api/                           # API endpoint tests
│   └── e2e/                           # Playwright E2E tests
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── railway.toml                       # Railway deployment config
└── Dockerfile                         # Container build
```

---

## Internationalization (i18n) Strategy

### Supported Languages (Launch)

| Code | Language | Direction | Primary Market |
|------|----------|-----------|---------------|
| `en` | English | LTR | US, UK, Global |
| `fr` | French | LTR | France, Belgium, Quebec, Africa |
| `de` | German | LTR | Germany, Austria, Switzerland |
| `pt` | Portuguese | LTR | Portugal, Brazil |
| `ar` | Arabic | **RTL** | UAE, Saudi Arabia, MENA |
| `pl` | Polish | LTR | Poland |
| `it` | Italian | LTR | Italy |

### i18n Architecture (next-intl)

**URL structure:** `/{locale}/path` — e.g., `/en/dashboard`, `/de/pricing`, `/ar/systems`

**Default locale:** `en` (English)

**Key rules for Claude Code:**
1. ALL user-facing strings must use translation keys, NEVER hardcoded text
2. Translation files are JSON in `src/i18n/messages/{locale}.json`
3. Use nested keys: `dashboard.complianceScore`, `systems.wizard.step1.title`
4. Arabic requires RTL layout — use Tailwind `rtl:` variants
5. Legal/regulatory terms must be accurate per locale — EU AI Act has official translations
6. Numbers, dates, currency formatting via `next-intl` formatters
7. PDF documents must be generated in the user's selected language
8. Email notifications in user's preferred language

**Translation workflow:**
1. Developer writes English strings in `en.json`
2. Run `scripts/generate-translations.ts` — uses Claude API to translate to all locales
3. Human review for legal/regulatory terms accuracy
4. Commit translations

**RTL Support (Arabic):**
```tsx
// In layout.tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>

// In Tailwind — use logical properties
// Instead of: ml-4 → use: ms-4 (margin-start)
// Instead of: pl-4 → use: ps-4 (padding-start)
// Instead of: text-left → use: text-start
```

**Translation file structure:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "nav": {
    "dashboard": "Dashboard",
    "systems": "AI Systems",
    "vendors": "Vendor Risk",
    "evidence": "Evidence Vault",
    "reports": "Reports",
    "intelligence": "Regulatory Updates",
    "settings": "Settings"
  },
  "dashboard": {
    "title": "Compliance Dashboard",
    "complianceScore": "Compliance Score",
    "systemsOverview": "AI Systems Overview",
    "criticalGaps": "Critical Gaps",
    "deadlineCountdown": "Days until EU AI Act deadline",
    "riskDistribution": "Risk Distribution"
  },
  "classification": {
    "unacceptable": "Unacceptable Risk",
    "high": "High Risk",
    "limited": "Limited Risk",
    "minimal": "Minimal Risk"
  },
  "wizard": {
    "step1": { "title": "Basic Information", "description": "Describe your AI system" },
    "step2": { "title": "Use Case", "description": "How is this AI system used?" },
    "step3": { "title": "Data & Impact", "description": "What data does it process?" },
    "step4": { "title": "Markets", "description": "Where do you sell?" },
    "step5": { "title": "Results", "description": "Your risk classification" }
  }
}
```

---

## Database Schema (Prisma)

```prisma
// Key models — full schema in docs/DATABASE.md

model Organization {
  id            String   @id @default(cuid())
  name          String
  paddleCustomerId String? @unique
  plan          Plan     @default(FREE)
  locale        String   @default("en")
  markets       String[] // ["EU", "US", "UAE"]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  users         User[]
  aiSystems     AISystem[]
  vendors       Vendor[]
  evidence      Evidence[]
  incidents     Incident[]
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  passwordHash   String?
  role           UserRole @default(ADMIN)
  locale         String   @default("en")
  referredByCode String?  // Referral code used at signup
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  // Referral relations
  referralCode      ReferralCode?    @relation("ReferralOwner")
  referrerRewards   ReferralReward[] @relation("ReferrerRewards")
  referredRewards   ReferralReward[] @relation("ReferredRewards")

  createdAt      DateTime @default(now())
}

model AISystem {
  id              String   @id @default(cuid())
  name            String
  description     String
  aiType          AIType   // ML_MODEL, LLM, RULE_BASED, HYBRID
  domain          String   // HR, FINANCE, HEALTHCARE, etc.
  makesDecisions  Boolean
  processesPersonalData Boolean
  profilesUsers   Boolean
  endUsers        String[] // ["B2C", "B2B", "EMPLOYEES", "GOVERNMENT"]
  markets         String[] // ["EU", "US", "UAE"]

  // Classification results
  riskLevel       RiskLevel? // UNACCEPTABLE, HIGH, LIMITED, MINIMAL
  annexIIICategory String?   // Which Annex III category matched
  classificationReasoning String? // LLM explanation
  providerOrDeployer String? // PROVIDER, DEPLOYER, BOTH
  classifiedAt    DateTime?

  // Compliance
  complianceScore Int?      // 0-100
  gaps            ComplianceGap[]
  documents       Document[]
  evidence        Evidence[]
  incidents       Incident[]

  // Relations
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  vendorLinks     SystemVendorLink[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ComplianceGap {
  id          String   @id @default(cuid())
  article     String   // "Article 9", "Article 10", etc.
  requirement String   // Human-readable requirement
  status      GapStatus // NOT_STARTED, IN_PROGRESS, COMPLETED
  priority    Priority  // CRITICAL, HIGH, MEDIUM, LOW
  notes       String?
  dueDate     DateTime?

  systemId    String
  system      AISystem @relation(fields: [systemId], references: [id])
}

model Vendor {
  id                String   @id @default(cuid())
  name              String   // "OpenAI", "Anthropic", etc.
  vendorType        String   // API_PROVIDER, SAAS_WITH_AI, MODEL_HOST
  dataUsedForTraining Boolean?
  dataProcessingLocation String? // "EU", "US", "GLOBAL"
  hasDPA            Boolean @default(false)
  hasModelCard      Boolean @default(false)
  supportsAIAct     Boolean?
  riskScore         Int?    // 0-100
  riskLevel         VendorRisk? // LOW, MEDIUM, HIGH, CRITICAL
  assessmentData    Json?   // Full assessment questionnaire results
  lastAssessedAt    DateTime?

  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  systemLinks       SystemVendorLink[]
}

model SystemVendorLink {
  id        String   @id @default(cuid())
  systemId  String
  vendorId  String
  system    AISystem @relation(fields: [systemId], references: [id])
  vendor    Vendor   @relation(fields: [vendorId], references: [id])

  @@unique([systemId, vendorId])
}

model Document {
  id          String   @id @default(cuid())
  type        DocType  // CLASSIFICATION_REPORT, ANNEX_IV, ROADMAP, VENDOR_ASSESSMENT, MODEL_CARD
  title       String
  locale      String   @default("en")
  fileUrl     String?  // S3/R2 URL
  status      DocStatus @default(DRAFT) // DRAFT, FINAL, ARCHIVED
  version     Int      @default(1)
  generatedAt DateTime @default(now())

  systemId    String?
  system      AISystem? @relation(fields: [systemId], references: [id])
  organizationId String
}

model Evidence {
  id          String   @id @default(cuid())
  title       String
  description String?
  fileUrl     String?
  evidenceType String  // DOCUMENT, SCREENSHOT, LOG, TEST_RESULT
  article     String?  // Which article this relates to
  integrityHash String? // SHA-256 hash for authenticity

  systemId    String?
  system      AISystem? @relation(fields: [systemId], references: [id])
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id])

  createdAt   DateTime @default(now())
}

model Incident {
  id          String   @id @default(cuid())
  title       String
  description String
  severity    Severity // CRITICAL, HIGH, MEDIUM, LOW
  status      IncidentStatus @default(OPEN) // OPEN, INVESTIGATING, RESOLVED, CLOSED
  correctiveAction String?
  reportedToRegulator Boolean @default(false)

  systemId    String?
  system      AISystem? @relation(fields: [systemId], references: [id])
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id])

  occurredAt  DateTime
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
}

model RegulatoryUpdate {
  id          String   @id @default(cuid())
  title       String
  summary     String
  source      String   // URL
  regulation  String   // "EU_AI_ACT", "COLORADO", "NIST_RMF", etc.
  impact      String?  // How this affects users
  publishedAt DateTime
  createdAt   DateTime @default(now())
}

model ReferralCode {
  id            String   @id @default(cuid())
  code          String   @unique // 8-char alphanumeric, e.g. "COMP-A7X2"
  usesCount     Int      @default(0)
  maxUses       Int?     // null = unlimited
  rewardType    ReferralRewardType @default(EXTRA_SYSTEMS)
  rewardAmount  Int      @default(2) // e.g. 2 extra AI systems
  isActive      Boolean  @default(true)

  userId        String   @unique // One code per user
  user          User     @relation("ReferralOwner", fields: [userId], references: [id])
  rewards       ReferralReward[] @relation("ReferralCodeRewards")

  createdAt     DateTime @default(now())
}

model ReferralReward {
  id            String   @id @default(cuid())
  rewardType    ReferralRewardType
  amount        Int      // What was granted
  status        ReferralRewardStatus @default(PENDING)

  referrerId    String   // User who shared the code
  referrer      User     @relation("ReferrerRewards", fields: [referrerId], references: [id])
  referredId    String   // User who used the code
  referred      User     @relation("ReferredRewards", fields: [referredId], references: [id])
  codeId        String
  code          ReferralCode @relation("ReferralCodeRewards", fields: [codeId], references: [id])

  // Paddle subscription link — reward granted only after first payment
  paddleSubscriptionId String?
  grantedAt     DateTime?
  createdAt     DateTime @default(now())

  @@unique([referrerId, referredId]) // One reward per pair
}

// Enums
enum Plan { FREE, STARTER, PROFESSIONAL, SCALE, ENTERPRISE }
enum UserRole { ADMIN, COMPLIANCE_MANAGER, DEVELOPER, VIEWER }
enum AIType { ML_MODEL, LLM, RULE_BASED, HYBRID }
enum RiskLevel { UNACCEPTABLE, HIGH, LIMITED, MINIMAL }
enum GapStatus { NOT_STARTED, IN_PROGRESS, COMPLETED }
enum Priority { CRITICAL, HIGH, MEDIUM, LOW }
enum VendorRisk { LOW, MEDIUM, HIGH, CRITICAL }
enum DocType { CLASSIFICATION_REPORT, ANNEX_IV, ROADMAP, VENDOR_ASSESSMENT, MODEL_CARD, BIAS_REPORT }
enum DocStatus { DRAFT, FINAL, ARCHIVED }
enum Severity { CRITICAL, HIGH, MEDIUM, LOW }
enum IncidentStatus { OPEN, INVESTIGATING, RESOLVED, CLOSED }
enum ReferralRewardType { EXTRA_SYSTEMS, EXTRA_VENDORS, FREE_MONTH, PLAN_DISCOUNT }
enum ReferralRewardStatus { PENDING, GRANTED, EXPIRED, REVOKED }
```

---

## Regulation Database & Admin Panel

### Why Regulations Live in DB, Not Code

AI regulation changes every 1-3 months (new guidelines, interpretations, enforcement actions). If rules are hardcoded, every update requires a developer deploy. With rules in the database, the founder updates them via admin panel in 30 minutes — zero code changes.

### Regulation Data Models

```prisma
model Regulation {
  id            String   @id @default(cuid())
  code          String   @unique // "EU_AI_ACT", "COLORADO_AI", "NYC_LL144", "NIST_RMF", "ISO_42001", "UAE_AI"
  name          String   // "EU AI Act (Regulation 2024/1689)"
  jurisdiction  String   // "EU", "US_CO", "US_NY", "US_FED", "UAE", "INTL"
  status        RegulationStatus @default(ACTIVE) // DRAFT, ACTIVE, AMENDED, REPEALED
  effectiveDate DateTime?
  version       String   @default("1.0")
  sourceUrl     String?  // Official legal text URL
  lastReviewedAt DateTime?
  
  categories    RiskCategory[]
  obligations   Obligation[]
  updates       RegulationUpdate[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model RiskCategory {
  id            String   @id @default(cuid())
  code          String   // "ANNEX_III_1", "ANNEX_III_4", "COLORADO_CONSEQUENTIAL"
  name          String   // "Biometrics", "Employment & Worker Management"
  description   String   // Full description of what falls under this category
  examples      String[] // ["CV screening", "automated hiring", "performance evaluation"]
  keywords      String[] // Keywords for LLM matching: ["recruitment", "hiring", "HR", "candidate"]
  riskLevel     RiskLevel
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  
  regulationId  String
  regulation    Regulation @relation(fields: [regulationId], references: [id])
  
  exceptions    RiskException[]
  
  @@unique([regulationId, code])
}

model RiskException {
  id            String   @id @default(cuid())
  code          String   // "ART_6_3_A", "ART_6_3_B"
  name          String   // "Narrow procedural task"
  description   String   // Full text of exception
  conditions    String[] // Machine-readable conditions
  isActive      Boolean  @default(true)
  
  categoryId    String
  category      RiskCategory @relation(fields: [categoryId], references: [id])
}

model Obligation {
  id            String   @id @default(cuid())
  article       String   // "Article 9", "Article 10"
  title         String   // "Risk Management System"
  description   String   // What must be done
  appliesTo     RiskLevel[] // [HIGH] or [HIGH, LIMITED]
  priority      Priority
  guidance      String?  // Practical guidance for SMBs
  templateUrl   String?  // Link to template document
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  
  regulationId  String
  regulation    Regulation @relation(fields: [regulationId], references: [id])
  
  @@unique([regulationId, article])
}

model RegulationUpdate {
  id            String   @id @default(cuid())
  title         String   // "New EC guidelines on Article 6 classification"
  summary       String   // What changed
  impact        String?  // How this affects users
  sourceUrl     String
  changeType    ChangeType // GUIDELINE, AMENDMENT, ENFORCEMENT, INTERPRETATION
  affectedArticles String[] // ["Article 6", "Annex III"]
  publishedAt   DateTime
  notifiedUsers Boolean  @default(false)
  
  regulationId  String
  regulation    Regulation @relation(fields: [regulationId], references: [id])
  
  createdAt     DateTime @default(now())
}

enum RegulationStatus { DRAFT, ACTIVE, AMENDED, REPEALED }
enum ChangeType { GUIDELINE, AMENDMENT, ENFORCEMENT, INTERPRETATION, NEW_LAW }
```

### Admin Panel (founder-only, route: /admin)

Protected by hardcoded admin email check. NOT a full CMS — minimal UI for regulation management.

**Pages:**

```
/[locale]/(admin)/admin/
├── regulations/           # List all regulations
│   ├── [id]/              # Edit regulation details
│   ├── [id]/categories/   # Manage risk categories
│   ├── [id]/obligations/  # Manage obligations
│   └── [id]/exceptions/   # Manage exceptions
├── updates/               # Add regulatory updates
│   └── new/               # Create new update + trigger notifications
├── users/                 # View all users, organizations, plans
├── analytics/             # Key metrics dashboard
│   ├── signups            # Daily/weekly signups
│   ├── classifications    # Classifications performed
│   ├── conversions        # Free → paid
│   └── referrals          # Referral performance
└── seed/                  # Re-seed / import regulation data
```

**Admin middleware:**
```ts
// Simple check — no need for full RBAC for solo founder
const ADMIN_EMAILS = [process.env.ADMIN_EMAIL]; // Your email

export const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ADMIN_EMAILS.includes(ctx.user.email)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});
```

**Workflow for updating regulations:**
```
1. EC publishes new guideline → You read it
2. Open /admin/regulations/EU_AI_ACT/categories
3. Update affected categories (edit description, add examples, modify keywords)
4. Open /admin/updates/new → Create update with summary + impact
5. Check "Notify affected users" → System sends personalized alerts
6. Done — no code deploy, no PR, no CI/CD
```

### Seed Data (prisma/seed.ts)

On first deploy, seed all regulation data:
- EU AI Act: 8 Annex III categories, 3 exceptions, 10+ obligations
- Colorado AI Act: consequential decision categories
- NYC LL144: employment decision rules
- NIST AI RMF: risk mapping categories
- ISO 42001: AI management system requirements
- UAE AI Ethics: principles and guidelines

Seed script reads from JSON files in `prisma/seed-data/`:
```
prisma/seed-data/
├── eu-ai-act.json           # Full Annex III categories, obligations, exceptions
├── colorado-ai-act.json
├── nyc-ll144.json
├── nist-ai-rmf.json
├── iso-42001.json
└── uae-ai-ethics.json
```

### How Classification Engine Uses DB Rules

```ts
// Instead of hardcoded categories, fetch from DB
async function classifySystem(system: AISystemInput): Promise<ClassificationResult> {
  const applicableRegulations = await prisma.regulation.findMany({
    where: {
      jurisdiction: { in: getJurisdictions(system.markets) },
      status: 'ACTIVE'
    },
    include: {
      categories: { where: { isActive: true }, include: { exceptions: true } },
      obligations: { where: { isActive: true } }
    }
  });
  
  // Pass DB categories + exceptions to LLM as context
  const llmContext = buildLLMContext(applicableRegulations);
  
  // Rule-based pre-filter uses DB categories
  const preFilterResult = preFilter(system, applicableRegulations);
  
  // LLM classifies with DB-sourced rules
  const llmResult = await llmClassify(system, llmContext);
  
  // Validate against DB categories
  return validate(llmResult, applicableRegulations);
}
```

### Architecture

```
User Input → Rule-Based Pre-Filter → LLM Classification → Rule-Based Validation → Result
```

### Step 1: Rule-Based Pre-Filter

Hard rules that don't need LLM:
- `profilesUsers === true` → ALWAYS high-risk (AI Act Article 6.3)
- Domain in ["BIOMETRICS", "LAW_ENFORCEMENT", "MIGRATION"] → likely high-risk
- `makesDecisions === false && processesPersonalData === false` → likely minimal
- Markets don't include EU → skip EU AI Act (but still assess US/UAE)

### Step 2: LLM Classification

System prompt includes:
- Full text of Annex III (8 categories with subcategories)
- Article 6 classification rules
- Article 6.3 exceptions (narrow procedural task, pattern detection, preparatory task)
- Examples of high-risk and not-high-risk systems

Temperature: 0 (deterministic)
Model: claude-sonnet-4-20250514
Output: structured JSON

### Step 3: Rule-Based Validation

- Verify LLM output contains valid Annex III category
- Cross-check: if LLM says "minimal" but profilesUsers is true → override to high
- Ensure reasoning references specific articles/annexes
- If confidence < threshold → flag for manual review

**Full classification logic documented in docs/AI_ENGINE.md**

---

## Deployment (Railway)

### railway.toml

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://app.complyance.io

# AI
ANTHROPIC_API_KEY=

# Payments
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_ENV=production

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Email
RESEND_API_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

### Railway Services

```
Project: complyance
├── web (Next.js app) — main service
├── postgres (Railway managed)
├── redis (Railway managed)
└── worker (BullMQ worker for async jobs)
```

### Deploy Process

1. Push to `main` branch on GitHub
2. Railway auto-detects, builds via Dockerfile
3. Runs Prisma migrations on deploy
4. Health check on `/api/health`
5. Zero-downtime deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Coding Conventions for Claude Code

### General

- **Language:** TypeScript everywhere, strict mode
- **Package manager:** pnpm
- **Formatting:** Prettier with defaults
- **Linting:** ESLint with Next.js config
- **Imports:** Use `@/` alias for `src/`

### Naming

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Variables/functions: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database enums: `SCREAMING_SNAKE_CASE`
- Translation keys: `dot.separated.camelCase`

### Component Patterns

```tsx
// Always use server components by default
// Add "use client" only when needed (interactivity, hooks)

// Translation usage in server components:
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  return <h1>{t('title')}</h1>;
}
```

### API Patterns

```ts
// Use tRPC for authenticated endpoints
// Use Next.js Route Handlers for webhooks and public API
// Always validate input with Zod schemas
// Always check plan limits before operations
```

### Error Handling

```ts
// Use custom error classes
class ComplianceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Always return typed errors from tRPC
// Log to Sentry for server errors
// Show user-friendly messages via toast (i18n keys)
```

---

## Plan Limits (enforced server-side)

| Feature | Free | Starter ($99) | Professional ($249) | Scale ($499) |
|---------|------|-----------|-------------|-------|
| AI Systems | 1 | 5 | 20 | 50 |
| Regulations | EU only | 1 | All | All |
| Vendor Assessments | 0 | 2 | 10 | Unlimited |
| Doc Generation | No | Yes | Yes | Yes |
| Evidence Vault | No | No | Yes | Yes |
| Bias Testing | No | No | 3/mo | Unlimited |
| CI/CD API | No | No | No | Yes |
| Team Members | 1 | 1 | 3 | 10 |
| Compliance Badge | Aware | Ready | Compliant | Compliant |
| Regulatory Alerts | No | Email weekly | Real-time | Real-time |
| Incident Register | No | No | No | Yes |
| GDPR-AI Module | No | No | No | Yes |

---

## Key Workflows

### 1. New User Onboarding

```
Register → Select language → Select markets (EU/US/UAE) →
Select plan (or start free) → Add first AI system via wizard →
See classification result → View gaps → (upgrade prompt for docs)
```

### 2. AI System Classification

```
Wizard input → Save to DB → Queue classification job →
Rule-based pre-filter → LLM classification → Validation →
Save results → Generate gaps → Calculate compliance score →
Notify user (email + in-app)
```

### 3. Document Generation

```
User clicks "Generate Report" → Check plan limits →
Queue generation job → Fetch system data → Fetch gaps →
Render template in user's locale → Generate PDF →
Upload to S3/R2 → Save URL to DB → Notify user
```

### 4. Vendor Assessment

```
User adds vendor → Fill questionnaire (or import from known vendors DB) →
LLM analyzes responses → Calculate risk score →
Link to AI systems → Update system compliance score →
Generate Vendor Assessment Report
```

### 5. Document-Assisted Classification

```
User clicks "Add AI System" → Option: "Fill manually" OR "Upload documents" →
User uploads 1-5 files → Files stored in S3/R2 (encrypted at rest) →
Claude API extracts AI-relevant information from documents →
Platform pre-fills wizard steps 1-4 with extracted data →
User reviews, corrects if needed, confirms →
Classification runs as normal (rules → LLM → validation)
```

**Why this matters:** Users can upload product documentation (technical docs, README, API docs, privacy policy, terms of service, model cards, architecture docs) and the platform automatically extracts AI-relevant information to pre-fill the classification wizard. This reduces human error and catches risks the founder might not recognize.

**Supported file types:**
- PDF (.pdf) — privacy policies, legal docs, compliance reports
- Word (.docx) — technical documentation
- Markdown (.md) — README, API docs, architecture docs
- Plain text (.txt) — any text documentation
- Max file size: 10MB per file, up to 5 files per classification

**Document Analysis with Claude API:**

The system analyzes uploaded documents to extract:
1. System name and description
2. AI type (ML_MODEL, LLM, RULE_BASED, HYBRID)
3. Domain (HR, FINANCE, HEALTHCARE, etc.)
4. Whether system makes decisions affecting people
5. Whether personal data is processed
6. Whether users are profiled
7. End user types (B2C, B2B, EMPLOYEES, GOVERNMENT)
8. Target markets (EU, US, UAE)
9. Hidden compliance risks (profiling, automated decisions, biometrics)
10. Exact quotes from documents as evidence

**Critical risk detection:**
- "personalized experience" or "recommendations" = likely profiling
- "automated scoring" or "ranking" = likely automated decisions
- "user behavior" or "analytics" = likely personal data processing
- "screening" or "filtering candidates" = employment AI (high-risk)
- Any mention of biometrics, facial recognition, emotion detection

**Security & Data Handling:**
- Files encrypted at rest (AES-256) and in transit (TLS)
- Stored in EU region (eu-central-1) for GDPR alignment
- Server-side encryption, presigned URLs (expire in 15 min for upload, 1 hour for download)
- Never publicly accessible
- Retained as long as subscription is active
- 30-day grace period after cancellation before deletion
- SHA-256 integrity hashes for authenticity
- Full GDPR rights: export and delete at any time

**Plan limits:**

| Feature | Free | Starter | Professional | Scale |
|---------|------|---------|-------------|-------|
| Document Upload | No | 2 files/system | 5 files/system | 5 files/system |
| AI Document Analysis | No | Yes | Yes | Yes |

**Legal Disclaimer (shown before upload):**
"Your documents are encrypted and stored securely. They are used only to analyze your AI system for compliance purposes. Documents are never shared with third parties. You can delete them at any time. See our Privacy Policy for details."

**Important:** Complyance is a tool that helps organize and analyze compliance information, NOT a legal advisor or certified auditor. All outputs include disclaimer that classifications should be verified by qualified legal professionals.

---

## Known AI Vendors Database (pre-seeded)

Pre-populate common AI vendors so users don't start from scratch:

| Vendor | Type | Data Training Default | Location |
|--------|------|----------------------|----------|
| OpenAI | API Provider | Opt-out available (API) | US |
| Anthropic | API Provider | No training on API data | US |
| Google (Vertex AI) | API Provider | Configurable | US/EU |
| AWS Bedrock | API Provider | No training | US/EU |
| Hugging Face | Model Host | Depends on model | EU |
| Mistral AI | API Provider | Configurable | EU (France) |
| Cohere | API Provider | Opt-out available | Canada |
| Stability AI | API Provider | Varies | UK |
| Midjourney | SaaS with AI | Yes (ToS) | US |
| Jasper | SaaS with AI | Varies | US |

---

## Development Order (for Claude Code)

### Phase 1: Foundation (Week 1-2)
1. Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
2. Set up Prisma with PostgreSQL schema
3. Configure next-intl with all 7 locales
4. Set up NextAuth.js (email + Google)
5. Create base layout with locale switcher and RTL support
6. Build marketing pages (landing, pricing)
7. Set up railway.toml and Dockerfile

### Phase 2: Core Features (Week 3-4)
1. AI System Inventory (CRUD)
2. Classification Wizard (5-step form)
3. Classification Engine (rules + LLM + validation)
4. Gap Analysis module
5. Dashboard with compliance score

### Phase 3: Documents & Payments (Week 5-6)
1. PDF generation pipeline
2. Classification Report template
3. Annex IV template
4. Compliance Roadmap template
5. Paddle integration (subscriptions, webhooks)
6. Plan limit enforcement

### Phase 4: Competitive Features (Week 7-8)
1. Vendor Risk Assessment module
2. Compliance Badge generator
3. Free AI Act Risk Classifier (public tool)
4. Evidence Vault
5. Regulatory Intelligence feed (basic)

### Phase 5: Launch Prep (Week 8)
1. SEO meta tags (per locale)
2. Error handling & edge cases
3. E2E tests (critical paths)
4. Production environment setup
5. Monitoring (Sentry + PostHog)

---

## Referral System

### Overview

Referral program incentivizes users to invite other SaaS founders. Compliance products spread through trust networks — a recommendation from a peer is the strongest acquisition channel.

### Reward Structure

| Who | Reward | When Granted |
|-----|--------|-------------|
| **Referrer** (existing user) | +2 extra AI systems on their plan | When referred user starts any paid plan |
| **Referred** (new user) | +1 extra AI system on Free tier OR 14-day trial of Starter | At signup with valid code |

**Why extra AI systems, not discounts:**
- Discounts reduce revenue. Extra systems cost near-zero (LLM calls are pennies).
- Extra systems increase engagement → higher retention → more organic referrals.
- For compliance product: more systems classified = more value realized = stickier user.

### Referral Code Format

```
COMP-XXXX (e.g. COMP-A7X2, COMP-K9M3)
```
- Prefix `COMP-` for brand recognition
- 4 alphanumeric chars (uppercase, no ambiguous chars: 0/O, 1/I/L removed)
- ~450,000 unique combinations — enough for years

### User Flow

**Referrer (sharing):**
```
Dashboard sidebar: "Invite & Earn" badge with gift icon →
Referral page: unique link + code displayed →
Copy button (copies: complyance.io/signup?ref=COMP-A7X2) →
Stats: invited count, rewards earned, pending rewards
```

**Referred (joining):**
```
Clicks referral link → Signup page pre-fills ref code →
OR manually enters code in "Referral code (optional)" field →
Completes registration → Gets bonus (extra system / trial extension) →
When converts to paid → Referrer gets reward
```

### Backend Logic

```ts
// src/server/services/referral/code.ts

// Generate unique code on user creation (lazy — created on first visit to referral page)
function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No 0,O,1,I,L
  let code: string;
  do {
    code = 'COMP-' + Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (await prisma.referralCode.findUnique({ where: { code } }));
  
  return prisma.referralCode.create({
    data: { code, userId, rewardType: 'EXTRA_SYSTEMS', rewardAmount: 2 }
  });
}

// Apply referral at signup
async function applyReferralCode(newUserId: string, code: string): Promise<boolean> {
  const referralCode = await prisma.referralCode.findUnique({
    where: { code, isActive: true },
    include: { user: true }
  });

  if (!referralCode) return false;
  if (referralCode.maxUses && referralCode.usesCount >= referralCode.maxUses) return false;
  if (referralCode.userId === newUserId) return false; // Can't refer yourself

  // Create pending reward for referrer (granted when referred user pays)
  await prisma.referralReward.create({
    data: {
      referrerId: referralCode.userId,
      referredId: newUserId,
      codeId: referralCode.id,
      rewardType: referralCode.rewardType,
      amount: referralCode.rewardAmount,
      status: 'PENDING'
    }
  });

  // Grant immediate reward to referred user (extra system or trial)
  await grantReferredBonus(newUserId);

  // Increment uses count
  await prisma.referralCode.update({
    where: { id: referralCode.id },
    data: { usesCount: { increment: 1 } }
  });

  // Save referral code on user record
  await prisma.user.update({
    where: { id: newUserId },
    data: { referredByCode: code }
  });

  return true;
}
```

```ts
// src/server/services/referral/rewards.ts

// Called from Paddle webhook when subscription.created
async function grantReferrerReward(paddleSubscriptionId: string, referredUserId: string) {
  const pendingReward = await prisma.referralReward.findFirst({
    where: { referredId: referredUserId, status: 'PENDING' }
  });

  if (!pendingReward) return;

  // Grant reward to referrer
  await prisma.referralReward.update({
    where: { id: pendingReward.id },
    data: {
      status: 'GRANTED',
      grantedAt: new Date(),
      paddleSubscriptionId
    }
  });

  // Apply bonus to referrer's organization (e.g. +2 systems)
  await applyBonusSystems(pendingReward.referrerId, pendingReward.amount);

  // Notify referrer
  await sendReferralRewardEmail(pendingReward.referrerId, pendingReward.amount);
}

// Bonus systems are tracked separately from plan limits
async function applyBonusSystems(userId: string, extraSystems: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true }
  });

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: { bonusSystems: { increment: extraSystems } }
  });
}
```

### API Endpoints (tRPC)

```ts
// src/server/routers/referral.ts

referralRouter = router({
  // Get or create referral code for current user
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    let code = await prisma.referralCode.findUnique({
      where: { userId: ctx.user.id }
    });
    if (!code) {
      code = await generateReferralCode(ctx.user.id);
    }
    return code;
  }),

  // Get referral stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: ctx.user.id }
    });
    return {
      totalInvited: rewards.length,
      converted: rewards.filter(r => r.status === 'GRANTED').length,
      pending: rewards.filter(r => r.status === 'PENDING').length,
      totalExtraSystems: rewards
        .filter(r => r.status === 'GRANTED')
        .reduce((sum, r) => sum + r.amount, 0)
    };
  }),

  // Apply referral code (called during signup, public)
  applyCode: publicProcedure
    .input(z.object({ userId: z.string(), code: z.string() }))
    .mutation(async ({ input }) => {
      return applyReferralCode(input.userId, input.code);
    }),
});
```

### Frontend Components

**Referral Dashboard Page** (`/[locale]/dashboard/referrals`)
```
┌─────────────────────────────────────────────┐
│  🎁 Invite Friends, Get Extra AI Systems    │
│                                              │
│  Your referral link:                         │
│  ┌────────────────────────────────┐ [Copy]   │
│  │ complyance.io/signup?ref=COMP-A7X2 │      │
│  └────────────────────────────────┘          │
│                                              │
│  Your code: COMP-A7X2            [Copy]      │
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────────┐           │
│  │  5   │  │  3   │  │  +6      │           │
│  │Invited│  │Paid  │  │Extra     │           │
│  │      │  │      │  │Systems   │           │
│  └──────┘  └──────┘  └──────────┘           │
│                                              │
│  How it works:                               │
│  1. Share your link with other SaaS founders │
│  2. They get a bonus when they sign up       │
│  3. You get +2 AI systems when they upgrade  │
│                                              │
│  Recent referrals:                           │
│  ✅ alex@acme.io — Paid (Starter) — +2 sys  │
│  ⏳ maria@xyz.io — Free tier — pending       │
│  ✅ john@co.uk — Paid (Pro) — +2 systems    │
└─────────────────────────────────────────────┘
```

**Sidebar badge** (in main navigation)
```tsx
// Small badge in sidebar nav, between Settings and Team
<NavItem href="/referrals" icon={Gift}>
  {t('nav.referrals')}
  {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
</NavItem>
```

**Signup page** (referral code field)
```tsx
// On signup page, pre-fill from URL param
const searchParams = useSearchParams();
const refCode = searchParams.get('ref') || '';

<Input
  label={t('auth.referralCode')}
  placeholder="COMP-XXXX"
  defaultValue={refCode}
  optional
/>
```

### Plan Limit Integration

```ts
// Updated limit check — includes bonus systems from referrals
async function getEffectiveSystemLimit(orgId: string): number {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const planLimit = PLAN_LIMITS[org.plan].systems;
  const bonusSystems = org.bonusSystems || 0;
  return planLimit + bonusSystems;
}
```

### Organization Model Update

Add `bonusSystems` field to Organization:
```prisma
model Organization {
  // ... existing fields ...
  bonusSystems  Int      @default(0) // Extra systems from referrals
}
```

### Paddle Webhook Integration

In the existing Paddle webhook handler, add referral reward granting:
```ts
case 'subscription.created':
  await handleSubscriptionCreated(event.data);
  // NEW: Grant referral reward to referrer
  const referredUser = await getUserByPaddleCustomer(event.data.customer_id);
  if (referredUser?.referredByCode) {
    await grantReferrerReward(event.data.id, referredUser.id);
  }
  break;
```

### i18n Keys

```json
{
  "referrals": {
    "title": "Invite Friends",
    "subtitle": "Share Complyance and earn extra AI systems",
    "yourLink": "Your referral link",
    "yourCode": "Your code",
    "copy": "Copy",
    "copied": "Copied!",
    "stats": {
      "invited": "Invited",
      "converted": "Paid",
      "extraSystems": "Extra Systems"
    },
    "howItWorks": {
      "title": "How it works",
      "step1": "Share your link with other SaaS founders",
      "step2": "They get a bonus when they sign up",
      "step3": "You get +2 AI systems when they upgrade"
    },
    "recent": "Recent referrals",
    "status": {
      "pending": "Pending",
      "granted": "Reward granted",
      "expired": "Expired"
    },
    "reward": "+{count} extra AI systems"
  }
}
```

### Anti-Fraud Rules

- Cannot refer yourself (same email domain check optional, same user ID mandatory)
- Reward only after first PAID subscription (not free tier)
- If referred user cancels within 7 days → revoke referrer's reward
- Rate limit: max 50 referral code applications per day per code
- Duplicate email prevention: one reward per referred email, ever

### Development Phase

Referral system is part of **Phase 4 (Week 7-8)** — after core features and payments are working. It's a growth lever, not a core feature, so it ships alongside Compliance Badge and Evidence Vault.

---

## Important Context for Claude Code

1. **Solo founder** — code must be maintainable by one person. Prefer simplicity over cleverness.
2. **No network for npm in sandbox** — when generating code, assume packages will be installed separately.
3. **Paddle, not Stripe** — Paddle is MoR (Merchant of Record). Integration pattern is different from Stripe.
4. **RTL for Arabic** — every UI component must work in both LTR and RTL. Use Tailwind logical properties.
5. **Legal disclaimer** — every classification result and generated document must include a disclaimer that this is not legal advice.
6. **EU AI Act is the PRIMARY regulation** — other regulations are secondary. Prioritize EU AI Act accuracy.
7. **Classification must be deterministic** — same input should produce same output. Use temperature 0, seed prompts.
8. **PDF generation must support all 7 languages** — including Arabic (RTL in PDF).
9. **All dates use ISO 8601** — display formatted per locale.
10. **Compliance Score formula must be documented** — auditable and explainable.