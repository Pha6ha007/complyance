# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.5.0 - Entire codebase with strict mode enabled
- JavaScript (Node.js) - Configuration files, scripts, build tooling
- TSX/JSX - React component definitions with TypeScript

**Secondary:**
- SQL - PostgreSQL database queries via Prisma ORM
- HTML/CSS - Generated in Next.js and PDF rendering
- Markdown/MDX - Blog content in `content/blog/`

## Runtime

**Environment:**
- Node.js 20 (Alpine-based Docker image)
- Next.js 14.2.0 - React framework with App Router
- React 18.3.0 - UI library

**Package Manager:**
- pnpm - Dependency management
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack framework with App Router, API routes, middleware
- React 18.3.0 - Component-based UI library
- next-intl 3.17.0 - Internationalization for 7 locales (en, fr, de, pt, ar, pl, it)

**API & Backend:**
- tRPC 10.45.2 - Type-safe RPC with `@trpc/server`, `@trpc/client`, `@trpc/next`
- Zod 3.23.8 - Schema validation for inputs across all tRPC procedures

**Database:**
- Prisma 5.18.0 - ORM for PostgreSQL database management
- @auth/prisma-adapter 2.4.1 - Database adapter for NextAuth.js

**Authentication:**
- NextAuth.js v5.0.0-beta.19 - Session management with email + Google OAuth
- bcryptjs 2.4.3 - Password hashing

**UI Components & Styling:**
- Tailwind CSS 3.4.7 - Utility-first CSS framework
- @tailwindcss/forms 0.5.7 - Form component plugin
- @tailwindcss/typography 0.5.14 - Typography plugin
- shadcn/ui components (via Radix UI)
  - @radix-ui/react-checkbox 1.3.3
  - @radix-ui/react-label 2.1.8
  - @radix-ui/react-progress 1.1.8
  - @radix-ui/react-radio-group 1.3.8
  - @radix-ui/react-select 2.2.6
  - @radix-ui/react-slot 1.2.4
- lucide-react 0.577.0 - Icon library
- clsx 2.1.1 - Conditional classname utility
- tailwind-merge 3.5.0 - Merge Tailwind classes
- sonner 2.0.7 - Toast notifications
- class-variance-authority 0.7.1 - Component variant system

**Document Generation:**
- @react-pdf/renderer 3.4.4 - Server-side PDF generation (7 locales)
- pdf-parse 2.4.5 - PDF text extraction
- mammoth 1.11.1 - DOCX text extraction
- puppeteer 23.0.0 - Headless browser for document rendering (optional)

**Content Management:**
- @next/mdx 16.1.6 - MDX support for Next.js
- @mdx-js/loader 3.1.1 - MDX loader
- @mdx-js/react 3.1.1 - MDX React components
- next-mdx-remote 6.0.0 - Remote MDX rendering
- gray-matter 4.0.3 - Frontmatter parsing
- remark-gfm 4.0.1 - Markdown GFM plugin
- rehype-highlight 7.0.2 - Syntax highlighting

**Analytics & Monitoring:**
- PostHog 1.157.2 - Product analytics (`posthog-js`)
- @sentry/nextjs 8.26.0 - Error tracking (wrapped in `src/instrumentation.ts`)

**Payments:**
- @paddle/paddle-node-sdk 1.5.0 - Paddle payment integration (MoR pattern)

**AI Integration:**
- @anthropic-ai/sdk 0.27.0 - Claude API client for classification

**File Storage:**
- @aws-sdk/client-s3 3.616.0 - AWS S3 client (also supports Cloudflare R2)
- @aws-sdk/s3-request-presigner 3.616.0 - Presigned URL generation

**Email:**
- resend 3.5.0 - Email delivery service

**Data Querying & State:**
- @tanstack/react-query 4.36.1 - Server state management
- superjson 2.2.6 - JSON serialization for tRPC

**Job Queue:**
- bullmq 5.12.0 - Redis-based job queue
- ioredis 5.4.1 - Redis client

**Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting
- reading-time 1.5.0 - Reading time calculation
- react-dropzone 15.0.0 - File upload handler

**Theme:**
- next-themes 0.2.1 - Dark mode support

## Configuration

**Environment:**
- Environment variables in `.env` and `.env.example`
- Key configs: `DATABASE_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`, `PADDLE_API_KEY`, `AWS_ACCESS_KEY_ID`, `RESEND_API_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`
- Node.js process.env for runtime configuration

**Build:**
- `next.config.mjs` - Next.js configuration with:
  - MDX support with remark/rehype plugins
  - next-intl plugin for i18n routing
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Remote image patterns for AWS S3 and Cloudflare R2
  - Sentry integration with build-time configuration
- `tsconfig.json` - TypeScript strict mode with path aliases (`@/*` → `src/*`)
- `tailwind.config.ts` - Tailwind customization with custom colors and fonts
- `postcss.config.mjs` - PostCSS with Tailwind and Autoprefixer
- `auth.config.ts` - NextAuth.js providers (Google OAuth + Credentials)
- `railway.toml` - Railway deployment config with Dockerfile builder
- `playwright.config.ts` - E2E testing configuration

**Development:**
- ESLint 8.57.0 - Code linting (extends `next/core-web-vitals`)
- No Prettier config found (uses Next.js defaults)
- TypeScript strict compilation
- pnpm workspaces (monorepo single platform)

## Platform Requirements

**Development:**
- Node.js 20+
- pnpm 8+
- PostgreSQL 14+ (local or Railway)
- Redis 6+ (for BullMQ job queue)
- Git

**Production:**
- Docker (Node.js 20-Alpine)
- Railway platform (web, postgres, redis, worker services)
- PostgreSQL database
- Redis instance
- AWS S3 or Cloudflare R2 for file storage

## Deployment

**Current:**
- Railway platform with Dockerfile-based builds
- Multi-service deployment: web (Next.js), postgres, redis, worker (BullMQ)
- Health check endpoint: `/api/health`

**Database Migrations:**
- Prisma migrations with `prisma db push` (auto-run on Railway deployment)
- Binary target: `native` and `linux-musl-openssl-3.0.x` for Alpine compatibility

---

*Stack analysis: 2026-03-13*
