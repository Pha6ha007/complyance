# Claude Code: Полный аудит и исправление багов — Complyance

## Контекст проекта

Complyance — self-serve SaaS для AI compliance. Tech stack: Next.js 14+ (App Router), TypeScript, Tailwind + shadcn/ui, tRPC, Prisma + PostgreSQL, NextAuth.js v5, Anthropic Claude API, Paddle, next-intl (7 локалей: en, fr, de, pt, ar, pl, it), BullMQ + Redis, Sentry, PostHog. Деплой на Railway.

Главный конфиг-файл проекта: `CLAUDE.md` в корне репозитория — прочитай его первым.

---

## Задача

Провести полный аудит кодовой базы, прогнать все проверки, найти и исправить все баги. Работай последовательно по шагам.

---

## ШАГ 1: Сборка и линтинг

```bash
# 1. Установи зависимости
pnpm install

# 2. Проверь TypeScript (без эмита)
pnpm tsc --noEmit

# 3. Прогони линтер
pnpm lint

# 4. Попробуй собрать проект
pnpm build
```

**Исправь ВСЕ ошибки** на каждом этапе, прежде чем переходить к следующему. Типичные проблемы:
- Отсутствующие импорты
- Неправильные типы (any, unknown, missing generics)
- Unused variables / imports
- Missing return types
- Next.js specific: missing "use client" директивы, неправильные серверные/клиентские компоненты

---

## ШАГ 2: Prisma Schema

```bash
# Валидация схемы
npx prisma validate

# Генерация клиента
npx prisma generate

# Проверка миграций
npx prisma migrate status
```

**Проверь:**
- [ ] Все модели из CLAUDE.md присутствуют: Organization, User, AISystem, ComplianceGap, Vendor, SystemVendorLink, Document, Evidence, Incident, RegulatoryUpdate, ReferralCode, ReferralReward, Regulation, RiskCategory, RiskException, Obligation, RegulationUpdate
- [ ] Все enum'ы определены: Plan, UserRole, AIType, RiskLevel, GapStatus, Priority, VendorRisk, DocType, DocStatus, Severity, IncidentStatus, ReferralRewardType, ReferralRewardStatus, RegulationStatus, ChangeType
- [ ] Связи между моделями корректны (foreign keys, @@unique constraints)
- [ ] `bonusSystems Int @default(0)` есть в Organization
- [ ] Индексы на часто запрашиваемых полях (organizationId, email, code)

---

## ШАГ 3: Аудит tRPC роутеров

**Проверь что ВСЕ роутеры существуют и подключены к app router:**

```
src/server/routers/
├── system.ts          — CRUD AI-систем + классификация
├── classification.ts  — запуск классификации, получение результатов
├── vendor.ts          — CRUD вендоров + risk assessment
├── document.ts        — генерация PDF документов
├── evidence.ts        — CRUD evidence vault
├── incident.ts        — CRUD инцидентов
├── intelligence.ts    — регуляторные обновления
├── team.ts            — управление командой
├── billing.ts         — Paddle интеграция, план, лимиты
└── referral.ts        — реферальная система
```

**Для каждого роутера проверь:**
- [ ] Импортирован и подключен в главном appRouter
- [ ] Все процедуры имеют input validation (Zod schemas)
- [ ] protectedProcedure используется для аутентифицированных эндпоинтов
- [ ] Plan limits проверяются через `enforcePlanLimit` middleware
- [ ] Ошибки обрабатываются через TRPCError с правильными кодами

---

## ШАГ 4: Аудит аутентификации и middleware

**Проверь:**
- [ ] `src/middleware.ts` — next-intl + auth middleware корректно цепляются
- [ ] Locale detection работает (Accept-Language header)
- [ ] Protected routes (/dashboard/*) редиректят на /login
- [ ] Public routes (/pricing, /blog, /free-classifier) доступны без auth
- [ ] Admin routes (/admin/*) проверяют ADMIN_EMAIL
- [ ] API rate limiting на /api/public/* работает (Redis или in-memory)
- [ ] NextAuth config: providers (email + Google OAuth), callbacks, session strategy (JWT)

---

## ШАГ 5: Аудит Classification Engine

**Файлы:**
```
src/server/services/classification/
├── engine.ts      — главный pipeline
├── rules.ts       — rule-based pre-filter
├── llm.ts         — вызов Claude API
├── validator.ts   — post-LLM validation
└── regulations/
    ├── eu-ai-act.ts
    ├── colorado.ts
    ├── nyc-ll144.ts
    └── uae.ts
```

**Проверь:**
- [ ] Pipeline: Input → Pre-Filter → LLM → Validation → Multi-Reg Mapping → Output
- [ ] Hard rules работают: profilesUsers → HIGH, social scoring → UNACCEPTABLE
- [ ] LLM call: model = claude-sonnet-4-20250514, temperature = 0, structured JSON output
- [ ] System prompt содержит Annex III (8 категорий), Article 6, exceptions
- [ ] Validation: проверка annexIIICategory, override при профилировании, confidence threshold
- [ ] Error handling: retry 3x с exponential backoff, fallback на PENDING_MANUAL_REVIEW
- [ ] Compliance Score calculation: weighted по priority (CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1)

---

## ШАГ 6: Аудит Paddle интеграции

**Проверь:**
- [ ] `src/app/api/webhooks/paddle/route.ts` существует
- [ ] Webhook signature verification (Paddle HMAC)
- [ ] Обработка событий: subscription.created, subscription.updated, subscription.canceled, subscription.past_due
- [ ] План обновляется в Organization при subscription change
- [ ] Referral reward грантится при subscription.created
- [ ] Frontend: Paddle.js checkout с правильным client token
- [ ] PLAN_LIMITS объект соответствует ценообразованию из CLAUDE.md:
  - FREE: systems=1, vendors=0, docs=false
  - STARTER: systems=5, vendors=2, docs=true
  - PROFESSIONAL: systems=20, vendors=10, evidence=true
  - SCALE: systems=50, vendors=unlimited, api=true

---

## ШАГ 7: Аудит i18n

**Проверь:**
- [ ] next-intl middleware в src/middleware.ts
- [ ] 7 файлов локалей в src/i18n/messages/: en.json, fr.json, de.json, pt.json, ar.json, pl.json, it.json
- [ ] en.json — 995 ключей (reference)
- [ ] Все остальные локали имеют те же 995 ключей (проверь парсинг JSON каждого файла)
- [ ] RTL для Arabic: `dir={locale === 'ar' ? 'rtl' : 'ltr'}` в layout.tsx
- [ ] Tailwind logical properties: ms-/me-/ps-/pe-/text-start/text-end (НЕ ml-/mr-/pl-/pr-/text-left/text-right)
- [ ] Locale switcher компонент работает
- [ ] Все user-facing строки используют translation keys, НЕ hardcoded text

**Скрипт проверки ключей (запусти):**
```bash
node -e "
const en = require('./src/i18n/messages/en.json');
const locales = ['fr','de','pt','ar','pl','it'];
function getKeys(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) => 
    typeof v === 'object' && v !== null ? getKeys(v, prefix+k+'.') : [prefix+k]
  );
}
const enKeys = new Set(getKeys(en));
console.log('EN keys:', enKeys.size);
locales.forEach(l => {
  try {
    const loc = require('./src/i18n/messages/'+l+'.json');
    const locKeys = new Set(getKeys(loc));
    const missing = [...enKeys].filter(k => !locKeys.has(k));
    const extra = [...locKeys].filter(k => !enKeys.has(k));
    console.log(l.toUpperCase()+':', locKeys.size, 'keys, missing:', missing.length, 'extra:', extra.length);
    if (missing.length > 0) console.log('  Missing:', missing.slice(0,10).join(', '));
  } catch(e) { console.log(l.toUpperCase()+': PARSE ERROR -', e.message); }
});
"
```

---

## ШАГ 8: Аудит PDF генерации

**Проверь:**
- [ ] PDF pipeline: template → render → upload S3/R2 → save URL в DB
- [ ] Шаблоны существуют: classification-report, annex-iv, roadmap, vendor-assessment, model-card
- [ ] Каждый шаблон принимает locale и рендерит на языке пользователя
- [ ] Arabic PDF: RTL layout, Noto Sans Arabic font
- [ ] Disclaimer присутствует в каждом PDF
- [ ] BullMQ job для async генерации
- [ ] Plan limit check перед генерацией

---

## ШАГ 9: Аудит API routes

**Проверь публичные API:**
- [ ] `GET /api/health` — возвращает { status: 'ok' }
- [ ] `POST /api/webhooks/paddle` — webhook handler
- [ ] `/api/trpc/[trpc]` — tRPC handler
- [ ] `/api/public/v1/classify` — публичный API (если реализован)
- [ ] `/api/public/v1/badge/[id]` — badge verification
- [ ] `/api/cron/regulatory-scan` — cron endpoint с CRON_SECRET
- [ ] `/api/cron/compliance-check` — cron endpoint

**Для каждого:**
- Правильные HTTP методы (GET/POST)
- Error responses с корректными status codes
- CORS headers на badge API

---

## ШАГ 10: Аудит фронтенда

**Проверь страницы существуют и рендерятся:**

```
Marketing (public):
- /[locale]/page.tsx              — лендинг
- /[locale]/pricing/page.tsx      — прайсинг
- /[locale]/blog/page.tsx         — блог
- /[locale]/free-classifier/page.tsx — бесплатный классификатор

Auth:
- /[locale]/login/page.tsx
- /[locale]/register/page.tsx

Dashboard (protected):
- /[locale]/dashboard/page.tsx
- /[locale]/systems/page.tsx
- /[locale]/systems/new/page.tsx   — wizard
- /[locale]/systems/[id]/page.tsx
- /[locale]/vendors/page.tsx
- /[locale]/evidence/page.tsx
- /[locale]/intelligence/page.tsx
- /[locale]/settings/page.tsx
- /[locale]/referrals/page.tsx

Admin:
- /[locale]/admin/page.tsx
```

**Проверь компоненты:**
- [ ] Loading skeletons для dashboard, systems, vendors, evidence, intelligence
- [ ] Error boundaries: global error.tsx, not-found.tsx, dashboard error.tsx
- [ ] Toast notifications (sonner)
- [ ] Sentry provider в layout
- [ ] PostHog provider в layout (conditional на env var)
- [ ] Locale switcher в header/footer

---

## ШАГ 11: Аудит безопасности

**Проверь:**
- [ ] Security headers в next.config (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] CORS ограничен на app domain (кроме badge API)
- [ ] Env vars НЕ в коде (только process.env)
- [ ] Paddle webhook signature verification
- [ ] API key validation на public API
- [ ] Rate limiting на public endpoints
- [ ] No SQL injection (Prisma parameterized queries)
- [ ] Auth middleware на всех protected routes
- [ ] ADMIN_EMAIL check на admin routes
- [ ] CRON_SECRET check на cron endpoints

---

## ШАГ 12: Аудит конфигурации деплоя

**Проверь:**
- [ ] `railway.toml` — healthcheck path, restart policy
- [ ] `Dockerfile` — multi-stage build, non-root user, prisma migrate deploy
- [ ] `.env.example` — все переменные задокументированы
- [ ] `next.config.mjs` — withSentryConfig wrapper, image domains, redirects
- [ ] `package.json` — все scripts: dev, build, start, lint, test
- [ ] `tsconfig.json` — strict mode, paths alias (@/)
- [ ] `tailwind.config.ts` — shadcn/ui preset, RTL поддержка

---

## ШАГ 13: Запуск тестов

```bash
# Если есть тесты
pnpm test

# Если нет тестов — создай минимальные:
# 1. Classification engine: known cases (HR tool → HIGH, chatbot → LIMITED, profiling → HIGH)
# 2. Compliance score calculation
# 3. Vendor risk scoring
# 4. Plan limits enforcement
# 5. API health endpoint
```

---

## ШАГ 14: Финальная сборка

```bash
# Финальная чистая сборка
rm -rf .next node_modules
pnpm install
pnpm build

# Если всё зелёное — коммит
git add -A
git commit -m "audit: Full codebase audit — all issues fixed, build passing"
```

---

## Правила

1. **Исправляй сразу** — не собирай список багов, а фикси каждый по мере нахождения
2. **Коммить по категориям** — отдельный коммит на каждый шаг (audit: Step 1 — TypeScript errors fixed)
3. **Не ломай существующий код** — если неуверен, лучше оставь TODO комментарий
4. **Логируй всё** — после каждого шага выведи summary: что нашёл, что исправил
5. **Температура 0 для LLM** — если редактируешь classification prompts, всегда temperature: 0
6. **RTL** — если добавляешь UI, используй logical properties (ms-/me-/ps-/pe-)
7. **i18n** — если добавляешь строки, добавь ключи в en.json (остальные локали обновим отдельно)
8. **Disclaimer** — каждый сгенерированный документ/отчёт должен содержать юридический disclaimer

---

## Ожидаемый результат

После выполнения всех шагов:
- ✅ `pnpm tsc --noEmit` — 0 ошибок
- ✅ `pnpm lint` — 0 ошибок (warnings допустимы)
- ✅ `pnpm build` — успешный билд
- ✅ `npx prisma validate` — схема валидна
- ✅ Все тесты проходят
- ✅ Все tRPC роутеры подключены
- ✅ Все страницы рендерятся
- ✅ Security headers на месте
- ✅ Деплой-конфиг готов
