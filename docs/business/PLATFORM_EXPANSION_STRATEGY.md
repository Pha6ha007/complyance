# PLATFORM_EXPANSION_STRATEGY.md — Complyance: Roadmap 2026-2028

## Куда движется рынок

Рынок AI governance растёт с $228M (2024) до $1.4-7.4B (2030) в зависимости от источника. Но ключевой тренд не просто рост — это смена парадигмы:

- 2024-2025: «AI governance = документация и чеклисты»
- 2026: «AI governance = непрерывный мониторинг и автоматизация»
- 2027-2028: «AI governance = управление автономными AI-агентами»

По данным Gartner, к 2028 году 33% корпоративных приложений будут включать агентный AI. Microsoft прогнозирует 1.3 миллиарда AI-агентов к 2028. Это означает: компаниям нужно будет управлять не одной-двумя AI-системами, а десятками и сотнями агентов. Спрос на governance-платформы вырастет кратно.

75% техлидеров называют governance главной проблемой при деплое агентного AI. Gartner предсказывает, что 40% AI-проектов провалятся к 2027 из-за недостаточного управления рисками. Это наш рынок.

---

## Фаза 1: Foundation (Q2 2026) — «Compliance Starter Kit»

**Что делаем:** MVP из CLAUDE.md — классификация, gap analysis, документы, dashboard.

**За что платит пользователь:**
- Понимание: «Мой AI — high-risk или нет?»
- Экономия: альтернатива — юрист за €300/час или Credo AI за $$$$$/мес
- Спокойствие: документы для аудитора готовы до дедлайна
- Время: 30 минут vs 40-80 часов ручной работы на Technical Documentation

**Целевой MRR:** $0 → $5,000

---

## Фаза 2: Defensive Moat (Q3 2026) — «Continuous Compliance»

**Что добавляем:**
- Vendor Risk Assessment
- Evidence Vault
- Compliance Badge
- Referral System
- Regulatory Intelligence (алерты об изменениях)

**За что платит пользователь:**
- Vendor Risk: «Мой вендор (OpenAI) безопасен для EU AI Act?»
- Evidence Vault: «У меня всё задокументировано для аудитора»
- Badge: «Мои клиенты видят, что я compliant»
- Intelligence: «Я первый узнаю об изменениях в законах»

**Почему это sticky:** Compliance — не одноразовая покупка. Evidence Vault + Intelligence создают привычку. Пользователь открывает Complyance каждую неделю. Churn падает с 8-10% до 3-5%.

**Целевой MRR:** $5,000 → $15,000

---

## Фаза 3: Platform Expansion (Q4 2026 - Q1 2027) — «AI Risk Operating System»

### 3.1 Agentic AI Governance Module — ГЛАВНАЯ СТАВКА НА 2027

**Почему:** К 2027 компании будут деплоить не просто «AI-модели», а автономных AI-агентов, которые принимают решения, вызывают инструменты, взаимодействуют с другими агентами. Существующие compliance-фреймворки для этого не приспособлены.

**Что это:**
- Inventory для AI-агентов (не только моделей): какие агенты, что делают, к чему имеют доступ, какие решения принимают автономно
- Mapping агент → инструменты → данные → решения
- Risk assessment для агентных workflows: что случится если агент ошибётся?
- Bounded autonomy framework: определение границ, эскалация к человеку, audit trail действий
- Мониторинг: агент вышел за границы? → алерт

**Позиционирование:** «Complyance — первая self-serve платформа для governance AI-агентов для SMB»

**Рынок:** $7.28B (2025) → $38.94B (2030) для agentic AI governance (Mordor Intelligence, CAGR 39.85%)

### 3.2 CI/CD API + Developer SDK

**Что это:**
- REST API для проверки compliance-статуса перед деплоем
- GitHub Action: `complyance/check-compliance@v1`
- Python SDK: `pip install complyance`
- Node.js SDK: `npm install @complyance/sdk`
- Webhook: уведомления при изменении compliance-статуса

**За что платит пользователь:** Compliance встроен в процесс разработки. Без Complyance — деплой не проходит. Максимальный switching cost.

### 3.3 Model Card Generator + AI Transparency Hub

**Что это:**
- Автогенерация Model Cards (Google format + HuggingFace format)
- Публичная страница transparency для каждой AI-системы
- Формат: complyance.io/transparency/[company]/[system]
- Соответствие Article 13 (transparency) и Article 50 (limited risk obligations)

**Виральность:** Каждая публичная transparency-страница = SEO + бренд awareness

### 3.4 Bias & Fairness Testing (Lightweight)

**Что это:**
- Upload CSV → автоматический bias-анализ
- Demographic Parity, Equalized Odds, Disparate Impact
- Визуализация + отчёт для Annex IV
- Не real-time мониторинг — batch testing для SMB

**За что платит пользователь:** Замыкает цикл: inventory → classification → testing → documentation. Всё в одном месте.

**Целевой MRR:** $15,000 → $50,000

---

## Фаза 4: Network Effects (Q2-Q4 2027) — «Compliance Ecosystem»

### 4.1 AI Vendor Trust Directory

**Что это:**
- Публичный каталог AI-вендоров с compliance-рейтингами
- Каждый вендор: risk score, DPA status, data processing location, AI Act readiness
- Данные агрегируются от пользователей Complyance (анонимизированно)
- Вендоры могут claim свой профиль и добавить информацию
- URL: complyance.io/vendors/openai, complyance.io/vendors/anthropic

**Почему это killer feature:**
- Создаёт network effect: чем больше пользователей → тем точнее данные о вендорах → тем ценнее платформа
- Бесплатный SEO-трафик: каждая страница вендора ранжируется в Google
- Вендоры сами приходят claim свой профиль → awareness
- Покупатели SaaS проверяют вендоров перед покупкой → новые пользователи

**Аналогия:** Это «G2 для AI compliance» или «Trustpilot для AI-вендоров»

### 4.2 Compliance Benchmarking

**Что это:**
- Анонимизированные бенчмарки по индустриям
- «Ваш compliance score 67%. Средний по SaaS-компаниям вашего размера — 74%»
- Breakdown по областям: documentation 80%, testing 40%, vendor management 55%
- Квартальный Compliance Report для отрасли

**За что платит пользователь:** Конкурентный контекст. «Как мы выглядим по сравнению с рынком?»

**Данные собираются автоматически** от всех пользователей (opt-in, анонимизированно).

### 4.3 Consultant Marketplace

**Что это:**
- Каталог юристов и консультантов по AI compliance
- Верифицированные партнёры с рейтингами
- Бронирование консультаций через платформу
- Revenue share: Complyance берёт 15-20% от каждой консультации

**Зачем:** Complyance покрывает 80% compliance-потребностей self-serve. Оставшиеся 20% (conformity assessment, custom legal opinions) требуют юриста. Вместо того чтобы терять этих клиентов, монетизируем переход.

### 4.4 White-Label / Agency Program

**Что это:**
- Юридические фирмы и консалтинги используют Complyance под своим брендом
- Их клиенты работают в платформе, не зная что это Complyance
- Агентство платит $999-2999/мес за white-label лицензию
- Кастомные отчёты с логотипом агентства

**Зачем:** Масштабирование без масштабирования маркетинга. 10 агентств по $1500/мес = +$15K MRR без единого нового direct-клиента.

**Целевой MRR:** $50,000 → $150,000

---

## Фаза 5: Platform Play (2028) — «AI Trust Infrastructure»

### 5.1 Compliance-as-Code

**Что это:**
- Regulation rules как machine-readable формат (OPA/Rego, JSON Policy)
- Компании импортируют rules в свои системы
- Complyance = источник правды для compliance-правил
- API: `GET /api/v2/regulations/eu-ai-act/rules` → JSON с правилами

**Зачем:** Это как «Twilio для compliance» — инфраструктурный слой. Другие SaaS-продукты строят поверх Complyance.

### 5.2 AI Incident Intelligence Network

**Что это:**
- Анонимизированные данные об AI-инцидентах от всех клиентов
- Early warning system: «SaaS-компании в финтехе видят рост bias-инцидентов на 40% этот квартал»
- Рекомендации по предотвращению на основе паттернов
- Annual AI Safety Report от Complyance

**Зачем:** Данные об инцидентах — уникальный актив. Никто другой не собирает их в масштабе от SMB.

### 5.3 Certification Program

**Что это:**
- «Complyance Certified» для SaaS-компаний
- Три уровня: Bronze, Silver, Gold
- Процесс: self-assessment → автоматическая верификация → badge
- Публичный реестр certified компаний
- Годовая ресертификация

**Зачем:** Создаёт индустриальный стандарт. Если покупатели начинают требовать «Complyance Certified» при procurement — это ultimate moat.

### 5.4 Complyance for Regulated Industries (Vertical Expansion)

**Варианты:**
- **Complyance for FinTech** — AI Act + MiFID II + PSD2 + anti-money laundering
- **Complyance for HealthTech** — AI Act + MDR (Medical Device Regulation) + HIPAA
- **Complyance for EdTech** — AI Act + FERPA + children's data protection
- **Complyance for HR Tech** — AI Act + employment law + bias requirements

Каждый вертикал = отдельный pricing tier с industry-specific правилами, шаблонами, и бенчмарками.

**Целевой MRR:** $150,000 → $500,000+

---

## Эволюция ценности для пользователя

| Фаза | Пользователь говорит | Готов платить |
|------|---------------------|--------------|
| 1 | «Мне нужно понять, подпадаю ли я под AI Act» | $99-249/мес |
| 2 | «Мне нужно непрерывно поддерживать compliance» | $249-499/мес |
| 3 | «Мне нужно управлять compliance для AI-агентов» | $499-999/мес |
| 4 | «Мне нужна экосистема: вендоры, консультанты, бенчмарки» | $499-1499/мес |
| 5 | «Мне нужна сертификация и industry-standard» | $999-2999/мес |

Ключевое: пользователь никогда не платит за фичи. Он платит за **уверенность** — уверенность, что его бизнес защищён от штрафов, репутационных потерь и потери клиентов.

---

## Конкурентная эволюция

| Год | Complyance | Credo AI | Vanta | Бесплатные чекеры |
|-----|-----------|----------|-------|-----------------|
| 2026 | SMB compliance platform | Enterprise AI governance | General GRC | Static tools |
| 2027 | AI Trust OS + Agentic governance | Enterprise + agentic | Adding AI modules | Abandoned/outdated |
| 2028 | Compliance infrastructure (API + Marketplace + Certification) | Enterprise platform | Competing on AI features | Dead |

**Твоя стратегическая ставка:** Credo AI и IBM watsonx.governance никогда не спустятся в SMB-сегмент — слишком дорого обслуживать мелких клиентов с их sales-моделью. Vanta добавит AI-модули, но AI governance не будет их core competency. Твоя ниша — self-serve AI compliance для 10,000+ SMB компаний, которые используют AI, но не имеют compliance-команды.

---

## Ключевые метрики по фазам

| Метрика | Фаза 1 (Q2'26) | Фаза 2 (Q3'26) | Фаза 3 (Q1'27) | Фаза 4 (Q4'27) | Фаза 5 (2028) |
|---------|----------------|----------------|----------------|----------------|---------------|
| Users (total) | 500 | 2,000 | 8,000 | 25,000 | 75,000 |
| Paying users | 25-50 | 150-300 | 500-1,000 | 2,000-3,000 | 5,000+ |
| MRR | $5K | $15K | $50K | $150K | $500K |
| ARR | $60K | $180K | $600K | $1.8M | $6M |
| AI Systems classified | 200 | 2,000 | 15,000 | 60,000 | 200,000+ |
| Vendors in directory | — | — | 50 | 500 | 2,000+ |
| Churn (monthly) | 8-10% | 5-7% | 3-5% | 2-4% | 2-3% |

---

## Потенциальные exit-сценарии (если релевантно)

1. **Acquisition by GRC platform** (Vanta, Drata, OneTrust) — они хотят AI compliance module, проще купить чем строить. Timeline: 2027-2028 при $1M+ ARR.

2. **Acquisition by AI platform** (Anthropic, OpenAI ecosystem partners) — они хотят помочь клиентам с compliance. Timeline: 2028+.

3. **Profitable bootstrapped business** — при $500K+ MRR это $6M ARR с ~70% gross margin. Отличный lifestyle business для соло-фаундера.

4. **Raise seed round** — при подтверждённом PMF и $20K+ MRR можно привлечь $1-3M seed для ускорения. Но не обязательно.

---

## Риски на 2-летнем горизонте

| Риск | Вероятность | Митигация |
|------|------------|-----------|
| EU AI Act дедлайн сдвигается | Высокая (Digital Omnibus обсуждается) | Продукт ценен не только из-за дедлайна — compliance нужен для procurement, доверия клиентов, конкурентного преимущества |
| Enterprise-игроки спускаются в SMB | Средняя | К моменту когда они адаптируют pricing, у тебя уже база + бренд + network effects от Vendor Directory |
| AI-регуляция замедляется (особенно US) | Средняя | ЕС — основной рынок, там регуляция только усиливается. US — вторичный рынок |
| LLM-модели становятся настолько хороши, что compliance становится тривиальным | Низкая | Compliance — это процесс, не разовая задача. Даже идеальный LLM не заменит structured workflow + evidence vault + audit trail |
| Копирование (клоны) | Высокая | Network effects (Vendor Directory, Benchmarking) + switching cost (Evidence Vault, CI/CD) + brand (Certification) = защита |
