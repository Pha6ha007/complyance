# Complyance — AI Compliance Management Platform

Self-serve SaaS platform for AI compliance management, targeting SMB and SaaS companies selling into EU, US, and UAE markets.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js v5 (Email + Google OAuth)
- **i18n**: next-intl (7 languages: en, fr, de, pt, ar, pl, it)
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Railway (monorepo)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Locales

The app supports 7 languages out of the box:
- English (en) — default
- French (fr)
- German (de)
- Portuguese (pt)
- Arabic (ar) — RTL layout
- Polish (pl)
- Italian (it)

Access localized pages: `/en`, `/fr`, `/de`, `/pt`, `/ar`, `/pl`, `/it`

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for complete project documentation and architecture.

## Phase 1: Foundation ✅

- [x] Next.js 14 + TypeScript + Tailwind CSS
- [x] Prisma schema with PostgreSQL
- [x] next-intl with 7 locales + RTL support
- [x] NextAuth.js (email + Google OAuth)
- [x] Base layout with locale switcher
- [x] Railway deployment config (railway.toml + Dockerfile)

## License

Proprietary — All rights reserved
