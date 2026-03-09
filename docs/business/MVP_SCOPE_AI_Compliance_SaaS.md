# MVP Scope: AI Compliance SaaS для SaaS-компаний

## Название продукта: **Complyance**

---

## Проблема

78% организаций используют ИИ, но только 24% имеют программы управления. Дедлайн EU AI Act для систем высокого риска — **2 августа 2026** (через ~5 месяцев). Штрафы — до €35M или 7% глобального оборота. Существующие решения (Credo AI, Holistic AI, Arthur AI) стоят тысячи долларов в месяц и заточены под enterprise. Тысячи SMB и SaaS-компаний остаются без доступного инструмента.

---

## Целевой клиент

SaaS-фаундеры и небольшие tech-компании (до 50 человек), которые:
- Используют AI/ML в своём продукте (чат-боты, рекомендации, скоринг, генерация контента)
- Продают в ЕС (или планируют)
- Не имеют compliance-команды
- Не могут позволить себе консультанта за €300/час

Вторичная аудитория: компании из США (Colorado AI Act, NYC Local Law 144) и ОАЭ (UAE AI Strategy 2031).

---

## MVP: Что должен делать продукт (v1)

### Модуль 1: AI System Inventory & Risk Classification

**Что делает:** Пользователь описывает свои AI-системы через guided wizard, а платформа автоматически классифицирует их по уровням риска EU AI Act.

**Шаги пользователя:**
1. Создаёт аккаунт (email + password, или OAuth)
2. Добавляет AI-систему через форму-визард:
   - Название системы
   - Описание назначения (свободный текст)
   - Тип AI (ML-модель, LLM, rule-based, hybrid)
   - Область применения (выбор из списка: HR/наём, кредитный скоринг, образование, здравоохранение, безопасность, контент-генерация, чат-бот, рекомендации, другое)
   - Принимает ли система решения, влияющие на людей? (да/нет/частично)
   - Обрабатывает ли персональные данные? (да/нет)
   - Профилирует ли пользователей? (да/нет)
   - Кто конечные пользователи? (сотрудники, клиенты B2B, потребители B2C, госструктуры)
   - Рынки сбыта (ЕС, США, ОАЭ, другие)

3. Платформа использует LLM + rule-based логику для классификации:
   - Маппинг на 8 категорий Annex III (биометрия, критическая инфраструктура, образование, трудоустройство, доступ к услугам, правоохранение, миграция, правосудие)
   - Проверка исключений (Article 6.3): узкая процедурная задача, обнаружение паттернов, подготовительная задача
   - Проверка на профилирование (автоматически = high-risk)
   - Определение роли: provider vs deployer

4. Результат: карточка системы с:
   - Уровнем риска (Unacceptable / High / Limited / Minimal)
   - Объяснением, почему именно этот уровень
   - Списком применимых обязательств
   - Ссылками на конкретные статьи AI Act

### Модуль 2: Compliance Gap Analysis

**Что делает:** Для каждой AI-системы, классифицированной как high-risk, показывает чеклист обязательств и текущий статус выполнения.

**Обязательства для high-risk систем (Articles 9-15):**
- Article 9: Risk Management System — есть/нет/частично
- Article 10: Data Governance — есть/нет/частично
- Article 11: Technical Documentation (Annex IV) — есть/нет/частично
- Article 12: Record-Keeping / Logging — есть/нет/частично
- Article 13: Transparency & Info for Users — есть/нет/частично
- Article 14: Human Oversight — есть/нет/частично
- Article 15: Accuracy, Robustness, Cybersecurity — есть/нет/частично
- Article 47: EU Declaration of Conformity — есть/нет
- Article 49: EU Database Registration — есть/нет

**Для limited-risk систем:**
- Обязательства по прозрачности (Article 50): раскрытие использования AI пользователям

**Результат:** Compliance Score (%) + список gaps с приоритизацией по срочности.

### Модуль 3: Documentation Generator

**Что делает:** Автоматически генерирует шаблоны документов на основе данных из Модулей 1-2.

**Документы v1:**
1. **AI System Risk Classification Report** — обоснование классификации, маппинг на Annex III, analysis of exceptions
2. **Technical Documentation Template (Annex IV)** — преструктурированный шаблон из 9 обязательных секций с подсказками, что заполнить:
   - Общее описание системы
   - Процесс разработки и дизайна
   - Мониторинг, функционирование и контроль
   - Метрики производительности
   - Система управления рисками
   - Изменения в жизненном цикле
   - Применённые стандарты
   - EU Декларация соответствия
   - Plan пост-маркетного мониторинга
3. **Compliance Roadmap** — пошаговый план действий с таймлайном до 2 августа 2026

**Важно:** Документы генерируются в формате PDF/DOCX, готовые для аудитора.

### Модуль 4: Dashboard

**Что делает:** Единый экран со статусом всех AI-систем компании.

- Количество систем по уровням риска (визуальная разбивка)
- Общий Compliance Score
- Критические gaps (red flags)
- Countdown до дедлайна (2 августа 2026)
- Timeline обязательств

---

## Что НЕ входит в MVP (v2+)

- Автоматическое тестирование моделей на bias (требует API-интеграции)
- Мониторинг моделей в реальном времени
- Интеграция с MLOps-платформами (MLflow, W&B)
- Поддержка US-specific законов (Colorado AI Act, NYC LL144) — отдельные модули
- Поддержка UAE-specific регуляции
- Multi-user / team collaboration
- Conformity assessment workflow
- Audit trail / version history документов
- SSO / SAML

---

## Технический стек

### Frontend
- **React** (Next.js) — SSR для SEO лендинга + SPA для дашборда
- **Tailwind CSS** — быстрый UI
- **Shadcn/ui** — компоненты

### Backend
- **Next.js API Routes** или **Node.js + Express**
- **PostgreSQL** (Supabase или Neon) — хранение данных пользователей и AI-систем
- **Anthropic Claude API** (Sonnet) — для классификации и генерации документов
  - System prompt с полным текстом Annex III, Article 6, exceptions
  - Structured output для классификации
  - Температура 0 для детерминистичных результатов

### AI Architecture (классификация)
```
User Input → Rule-based Pre-filter → LLM Classification → Rule-based Validation → Result
```

**Почему гибрид, а не чистый LLM:**
- Rule-based ловит очевидные случаи (профилирование = всегда high-risk)
- LLM разбирает нюансы (является ли "AI-чат-бот для HR" системой найма?)
- Rule-based validation проверяет, что LLM не галлюцинирует категории

### Document Generation
- **@react-pdf/renderer** или **PDFKit** для PDF
- Markdown → PDF pipeline для отчётов
- Шаблоны с переменными, заполняемыми из данных пользователя

### Инфраструктура
- **Vercel** или **Railway** — деплой
- **Paddle** — оплата подписки (Merchant of Record, покрывает налоги)
- **Resend** или **Postmark** — транзакционные email

### Аутентификация
- **Supabase Auth** или **NextAuth.js** — email + OAuth (Google)

---

## Ценообразование

### Free Tier
- 1 AI-система
- Классификация рисков
- Базовый Gap Analysis
- Без генерации документов
- **Цель:** конвертировать в платных через ценность классификации

### Starter — $99/мес
- До 5 AI-систем
- Полный Gap Analysis
- Генерация документов (Classification Report + Compliance Roadmap)
- Email-поддержка
- **Целевой клиент:** инди-фаундер, маленький SaaS

### Professional — $249/мес
- До 20 AI-систем
- Всё из Starter +
- Technical Documentation Template (Annex IV) с предзаполнением
- Dashboard с экспортом для стейкхолдеров
- Priority support
- **Целевой клиент:** SaaS-компания 10-50 человек

### Enterprise — custom
- Неограниченные системы
- Всё из Professional +
- Custom branding отчётов
- Dedicated support
- **Добавить после product-market fit**

---

## Roadmap

### Неделя 1-2: Foundation
- [ ] Лендинг с value proposition + waitlist
- [ ] Бесплатный AI Act Risk Classifier (standalone tool, не требует регистрации)
- [ ] Auth system
- [ ] Database schema
- [ ] AI System Inventory — CRUD формы

### Неделя 3-4: Core Logic
- [ ] Classification Engine (rule-based + LLM)
- [ ] Annex III mapping logic
- [ ] Exception checking (Article 6.3)
- [ ] Gap Analysis checklist
- [ ] Compliance Score calculation

### Неделя 5-6: Documents & Dashboard
- [ ] PDF generation pipeline
- [ ] Classification Report template
- [ ] Compliance Roadmap template
- [ ] Technical Documentation template (Annex IV)
- [ ] Dashboard UI

### Неделя 7: Payment & Polish
- [ ] Paddle integration
- [ ] Free/Starter/Professional tiers
- [ ] Onboarding flow
- [ ] Error handling & edge cases

### Неделя 8: Launch
- [ ] Product Hunt launch
- [ ] 5 SEO-статей (подготовить заранее)
- [ ] LinkedIn launch post
- [ ] IndieHackers / HN анонс

---

## Ключевые метрики (первые 3 месяца)

- **Free signups:** 500+
- **Free → Paid conversion:** 5-8%
- **MRR target:** $2,500-5,000 к концу 3-го месяца
- **Churn:** <5% monthly (compliance = sticky)
- **NPS:** >40

---

## Конкурентное позиционирование

| | Complyance | Credo AI | Holistic AI | Бесплатные чекеры |
|---|---|---|---|---|
| Цена | $99-249/мес | $$$$ enterprise | $$$$ enterprise | $0 |
| Self-serve | ✅ | ❌ (sales-driven) | ❌ (sales-driven) | ✅ |
| SMB-friendly | ✅ | ❌ | ❌ | ✅ |
| Doc generation | ✅ | ✅ | ✅ | ❌ |
| Deep classification | ✅ | ✅ | ✅ | Поверхностно |
| Compliance roadmap | ✅ | ✅ | ✅ | ❌ |

**Твоя ниша:** «Credo AI для тех, кто не может позволить Credo AI.» Self-serve, понятный, доступный. Stripe Atlas для AI compliance.

---

## Риски и митигация

**Риск: Дедлайн сдвинут.**
- Митигация: уже есть обсуждения Digital Omnibus о переносе до декабря 2027 для части систем. Но обязательства по прозрачности и запретам уже в силе. Даже при сдвиге спрос не пропадёт, а растянется.

**Риск: Юридическая точность классификации.**
- Митигация: disclaimer «не является юридической консультацией», рекомендация верификации с юристом. Позиционирование как «первый шаг», а не финальный аудит.

**Риск: LLM-галлюцинации в классификации.**
- Митигация: гибридная архитектура (rule-based + LLM + validation), температура 0, structured output, тесты на известных юзкейсах.

**Риск: Конкуренция от enterprise-игроков, спускающихся вниз.**
- Митигация: скорость, фокус на DX, community-driven рост. К моменту когда Credo AI сделает self-serve, у тебя уже будет база и бренд.

---

## Disclaimer

Этот документ — технический скоуп для MVP. Продукт не предоставляет юридических консультаций. Рекомендуется проконсультироваться с юристом, специализирующимся на AI-регулировании, для верификации логики классификации перед запуском.
