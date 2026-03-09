# Полный продуктовый скоуп: Complyance
## AI Compliance Platform — максимальная наполняемость для конкуренции на рынке

---

## Философия продукта

Enterprise-конкуренты (Credo AI, Holistic AI, OneTrust) строят «governance control plane» — тяжёлые платформы для корпораций с procurement-циклами в 6+ месяцев. Твой продукт — **анти-enterprise**: self-serve, быстрый результат за минуты, ценообразование через Paddle, без sales-звонков. Позиционирование: **«Stripe Atlas для AI compliance»** — инструмент, который делает сложное простым для маленьких команд.

---

## УРОВЕНЬ 1: MVP (Недели 1-8) — то, что уже описано

### 1.1 AI System Inventory & Risk Classification
- Guided wizard для описания AI-систем
- Автоклассификация по Annex III (8 категорий)
- Проверка исключений (Article 6.3)
- Определение роли: provider vs deployer
- Карточка системы с уровнем риска и обоснованием

### 1.2 Compliance Gap Analysis
- Чеклист обязательств для high-risk (Articles 9-15)
- Статус выполнения каждого требования
- Compliance Score (%)
- Приоритизированный список gaps

### 1.3 Documentation Generator (v1)
- AI System Risk Classification Report (PDF)
- Technical Documentation Template — Annex IV, 9 секций
- Compliance Roadmap с таймлайном до 2 августа 2026

### 1.4 Dashboard
- Статус всех AI-систем
- Общий Compliance Score
- Countdown до дедлайна
- Critical gaps (red flags)

---

## УРОВЕНЬ 2: Конкурентные рвы (Месяцы 3-6)

### 2.1 AI Vendor Risk Assessment — КЛЮЧЕВОЙ ДИФФЕРЕНЦИАТОР

**Почему это важно:** Большинство SaaS-компаний не создают AI — они используют AI-сервисы третьих сторон (OpenAI, Anthropic, Google, Midjourney, и т.д.). По EU AI Act, deployer тоже несёт ответственность. Но 76% фирм не имеют политик для управления сторонним AI.

**Что делает модуль:**
- Каталог AI-вендоров, которых использует компания (OpenAI API, Claude API, HuggingFace модели, SaaS с встроенным AI)
- Автоматическая оценка рисков каждого вендора:
  - Политика использования данных (используются ли данные клиентов для обучения?)
  - Где обрабатываются данные (EU/US/другое)?
  - Есть ли data processing agreement?
  - Есть ли model card / документация?
  - Поддерживает ли вендор EU AI Act compliance?
- Готовый AI Vendor Assessment Questionnaire (генерируется для отправки вендору)
- Risk scoring: Low / Medium / High / Critical
- Рекомендации по митигации

**Почему это moat:** Ни один SMB-инструмент этого не делает. Enterprise-решения (Vanta, OneTrust) делают для SOC 2 / GDPR, но не специфично для AI-вендоров. Это уникальная ниша.

### 2.2 Multi-Regulation Engine

**Проблема:** Твои клиенты продают в США, ЕС и ОАЭ. Каждый рынок — свои правила.

**Реализация:** Одна AI-система → множественная оценка:
- **EU AI Act** — полная поддержка (Articles 6-72, Annex III, Annex IV)
- **US State Laws:**
  - Colorado AI Act (SB 24-205) — вступает в 2026, фокус на «high-risk AI decisions»
  - NYC Local Law 144 — автоматизированные решения в найме, bias audit
  - Illinois AI Video Interview Act
  - California (CPRA + AI-specific bills)
- **UAE:**
  - UAE AI Ethics Principles
  - DIFC AI regulations
  - Связь с GDPR-подобными требованиями Abu Dhabi
- **Frameworks:**
  - NIST AI Risk Management Framework (RMF 1.0)
  - ISO/IEC 42001 (AI Management System)
  - OECD AI Principles

**UX:** Пользователь выбирает свои рынки → платформа автоматически показывает все применимые требования. Один inventory, мульти-compliance.

**Почему это moat:** Credo AI делает мульти-framework, но за $$$$$. Никто не делает это self-serve за $249/мес.

### 2.3 Compliance Badge / Trust Seal

**Что делает:** Когда компания достигает определённого уровня compliance, она получает верифицируемый badge для своего сайта.

**Механика:**
- Badge с QR-кодом, ведущим на публичную страницу compliance-статуса
- Три уровня: «AI Act Aware» → «AI Act Ready» → «AI Act Compliant»
- Динамический — обновляется при изменении статуса
- Формат: HTML embed для сайта, SVG для email-подписи

**Почему это moat:** Создаёт виральный цикл. Каждый badge на сайте клиента — реклама твоего продукта. Партнёры и клиенты видят badge → хотят такой же → регистрируются. Плюс, B2B-клиенты всё чаще требуют доказательств AI compliance при procurement.

### 2.4 Compliance Evidence Vault

**Проблема:** Compliance — это не одноразовое событие, а continuous process. Аудитору нужны доказательства, что ты следовал своим процедурам.

**Что делает:**
- Хранилище доказательств (evidence), привязанных к конкретным требованиям
- Типы evidence: документы, скриншоты, логи, результаты тестов
- Version history — что когда изменилось
- Audit trail — кто что сделал и когда
- Экспорт полного audit package в PDF для регулятора
- Timestamps + integrity hashes для доказательства подлинности

**Почему это moat:** Превращает продукт из «one-time report generator» в «continuous compliance platform». Это то, что отличает churn 20% от churn 3%.

### 2.5 AI-Powered Regulatory Intelligence

**Проблема:** AI-регуляция меняется каждый месяц. Новые guidelines, interpretations, enforcement actions. Клиенты не могут за этим следить.

**Что делает:**
- Автоматический мониторинг изменений в регуляции (парсинг официальных источников: EUR-Lex, AI Act Service Desk, NIST, state legislatures)
- Персонализированные алерты: «Новый guidance от EC затрагивает 2 из ваших AI-систем»
- Feed обновлений в дашборде
- Влияние изменений на compliance score компании
- Дайджест раз в неделю по email

**Почему это moat:** Создаёт привычку — клиент открывает продукт каждую неделю. Снижает churn. Ни один SMB-инструмент этого не делает. Enterprise-инструменты делают (Credo AI), но за $$$$.

---

## УРОВЕНЬ 3: Масштабирование (Месяцы 6-12)

### 3.1 API для CI/CD Pipeline

**Что делает:** Позволяет интегрировать compliance-проверки в процесс разработки.

**Юзкейсы:**
- Pre-deployment check: перед деплоем новой модели / фичи с AI → API проверяет compliance status
- Webhook при изменении compliance score
- GitHub Action / GitLab CI для автоматических проверок
- SDK (Python, Node.js) для программного доступа

**Пример workflow:**
```
Developer pushes ML model update → CI triggers compliance check → 
API returns: "BLOCKED: Annex IV documentation outdated" → 
Developer updates docs → CI passes → Deploy
```

**Почему это moat:** Встраивает продукт в ежедневный workflow. Переключение на конкурента = переписывание пайплайнов. Максимальный switching cost.

### 3.2 Model Card Generator

**Проблема:** AI Act и NIST RMF требуют прозрачности о моделях. Model cards — стандартный формат.

**Что делает:**
- Пользователь описывает свою модель (тип, данные, метрики, ограничения)
- Платформа генерирует Model Card в стандартном формате (Google's model card format / Hugging Face format)
- Автоматически заполняет секции из данных, уже введённых в inventory
- Публичная и приватная версии (для клиентов vs для аудитора)
- Экспорт в Markdown, PDF, HTML

**Почему это moat:** Model cards становятся де-факто стандартом прозрачности. Генерация из уже существующих данных = zero extra work для пользователя.

### 3.3 Bias & Fairness Testing (Lightweight)

**Проблема:** Articles 10 и 15 AI Act требуют тестирования на accuracy и bias. Но полноценные платформы (Arthur AI, Credo AI) стоят тысячи.

**Что делает (simplified для SMB):**
- Пользователь загружает dataset (CSV) с predictions и demographic attributes
- Платформа считает базовые fairness-метрики:
  - Demographic Parity
  - Equalized Odds
  - Disparate Impact Ratio
- Визуализация результатов в дашборде
- Генерация Bias Testing Report (для Annex IV)
- Рекомендации по митигации

**Ограничения v1:** Не real-time мониторинг, а batch-тестирование. Не нужна интеграция с моделью — только данные.

**Почему это moat:** Замыкает цикл. Inventory → Classification → Gap Analysis → Testing → Documentation → Evidence. Полный lifecycle без выхода из платформы.

### 3.4 Incident & Risk Register

**Что делает:**
- Реестр инцидентов с AI-системами (баги, bias-случаи, жалобы клиентов, security-инциденты)
- Привязка инцидентов к конкретным AI-системам
- Severity scoring
- Корректирующие действия и их статус
- Связь с Article 62 (serious incident reporting)
- Экспорт для регулятора

**Почему это moat:** AI Act требует post-market monitoring и reporting. Это не «nice-to-have», а обязательство. Реестр инцидентов — доказательство, что компания следит за своими системами.

### 3.5 Team Collaboration (Multi-User)

- Roles: Admin, Compliance Manager, Developer, Viewer
- Назначение owners на AI-системы
- Комментарии и обсуждения на карточках систем
- Approval workflows для документов
- Activity feed

### 3.6 GDPR-AI Crossover Module

**Проблема:** AI Act пересекается с GDPR. Обработка персональных данных моделями = двойные обязательства.

**Что делает:**
- Data Protection Impact Assessment (DPIA) шаблон, адаптированный для AI-систем
- Маппинг GDPR obligations на AI-специфичные контексты
- Lawful basis assessment для обучения моделей на персональных данных
- Автоматическая генерация Records of Processing Activities (RoPA) для AI-систем

---

## УРОВЕНЬ 4: Network Effects и Marketplace (Год 2+)

### 4.1 AI Compliance Marketplace

- Каталог проверенных AI-вендоров с compliance scores
- Юристы и консультанты по AI compliance (партнёрская программа)
- Шаблоны DPA (Data Processing Agreements) для AI-вендоров
- Pre-vetted AI tools с подтверждённым compliance-статусом

### 4.2 Benchmarking

- Анонимизированные benchmarks: «Ваш compliance score — 67%. Средний по вашей индустрии — 72%»
- Industry-specific insights
- Данные агрегируются от всех пользователей платформы

### 4.3 Community & Knowledge Base

- AI Compliance Wiki — объяснения статей AI Act простым языком
- Форум вопросов-ответов
- Case studies: «Как SaaS X прошёл compliance за 6 недель»
- Templates library

### 4.4 White-Label / Partner Program

- Юридические фирмы и консалтинговые компании могут предлагать продукт своим клиентам под своим брендом
- Revenue share модель
- Co-branded reports

---

## Обновлённое ценообразование (с учётом полного скоупа)

### Free
- 1 AI-система
- Классификация рисков (EU AI Act только)
- Базовый Gap Analysis
- Compliance Badge: «AI Act Aware»
- **Цель:** воронка + виральность через badge

### Starter — $99/мес
- До 5 AI-систем
- Полный Gap Analysis
- 1 regulation (EU AI Act ИЛИ один US state law)
- Document Generator (Classification Report + Roadmap)
- 2 AI Vendor assessments
- Regulatory Intelligence (email дайджест)
- Compliance Badge: «AI Act Ready»
- Email support

### Professional — $249/мес
- До 20 AI-систем
- Multi-regulation (EU + US + UAE)
- Annex IV Technical Documentation с предзаполнением
- До 10 AI Vendor assessments
- Evidence Vault
- Model Card Generator
- Bias Testing (до 3 datasets/мес)
- Regulatory Intelligence (real-time алерты)
- Compliance Badge: «AI Act Compliant»
- Priority support

### Scale — $499/мес
- До 50 AI-систем
- Всё из Professional +
- Безлимитные Vendor assessments
- Bias Testing безлимит
- CI/CD API access
- Incident & Risk Register
- GDPR-AI Crossover Module
- Team collaboration (до 10 users)
- Branded reports
- Quarterly compliance review call

### Enterprise — Custom
- Безлимит
- White-label
- Dedicated account manager
- Custom integrations
- SLA

---

## Конкурентная матрица (полный скоуп)

| Фича | Complyance | Credo AI | Holistic AI | Vanta | Бесплатные чекеры |
|---|---|---|---|---|---|
| Self-serve | ✅ | ❌ | ❌ | ✅ | ✅ |
| AI-specific compliance | ✅ | ✅ | ✅ | ❌ (общий GRC) | Поверхностно |
| Multi-regulation | ✅ | ✅ | ✅ | Частично | ❌ |
| Vendor Risk (AI-specific) | ✅ | ✅ | Частично | ✅ (не AI) | ❌ |
| Doc generation | ✅ | ✅ | ✅ | ✅ | ❌ |
| Bias testing | ✅ (lightweight) | ✅ (deep) | ✅ (deep) | ❌ | ❌ |
| CI/CD API | ✅ | ✅ | ❌ | ✅ | ❌ |
| Compliance Badge | ✅ | ❌ | ❌ | ✅ | ❌ |
| Evidence Vault | ✅ | ✅ | ✅ | ✅ | ❌ |
| Regulatory Intelligence | ✅ | ✅ | ✅ | ❌ | ❌ |
| Model Cards | ✅ | Частично | ❌ | ❌ | ❌ |
| Цена (SMB) | $99-499 | $$$$$ | $$$$$ | $$$$ | $0 |

---

## 5 конкурентных рвов (moats)

1. **Compliance Badge / Trust Seal** — виральный цикл: каждый клиент рекламирует тебя на своём сайте
2. **AI Vendor Risk Assessment** — уникальная ниша, ни один SMB-инструмент не покрывает
3. **CI/CD API** — максимальный switching cost, встроен в ежедневный workflow
4. **Multi-Regulation Engine** — один продукт для всех рынков клиента (EU + US + UAE)
5. **Regulatory Intelligence** — создаёт привычку, клиент открывает продукт каждую неделю

---

## Roadmap сводка

| Период | Что запускаем | MRR цель |
|---|---|---|
| Месяцы 1-2 | MVP: Inventory + Classification + Gap Analysis + Docs + Dashboard | $0 → $1,000 |
| Месяц 3 | Free Risk Classifier (воронка) + Product Hunt launch | $1,000 → $3,000 |
| Месяцы 4-5 | Vendor Risk Assessment + Compliance Badge + Evidence Vault | $3,000 → $7,000 |
| Месяц 6 | Multi-Regulation Engine + Regulatory Intelligence | $7,000 → $12,000 |
| Месяцы 7-9 | CI/CD API + Model Cards + Bias Testing | $12,000 → $20,000 |
| Месяцы 10-12 | Team Collaboration + Incident Register + GDPR Module | $20,000 → $35,000 |
| Год 2 | Marketplace + Benchmarking + White-Label | $35,000 → $100,000 |

---

## Юридический disclaimer

Продукт не является юридической консультацией. Классификация рисков и рекомендации носят информационный характер. Рекомендуется верификация с квалифицированным юристом, специализирующимся на AI-регулировании.
