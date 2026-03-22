# Complyance — Полный брифинг проекта

> Документ для использования как контекст при создании маркетинговых материалов, описаний, статей, постов и ответов на любые вопросы о проекте.
> Последнее обновление: 22 марта 2026

---

## 1. Что такое Complyance

**Complyance** — это self-serve SaaS-платформа для управления AI compliance. Помогает малым и средним технологическим компаниям (SMB/SaaS) соответствовать требованиям EU AI Act и других регуляций в области искусственного интеллекта.

**Сайт:** https://complyance.io
**Приложение:** https://app.complyance.io

### Позиционирование в одном предложении

> «Credo AI для компаний, которые не могут позволить себе Credo AI.»

Или альтернативно:

> «Stripe Atlas для AI compliance» — инструмент, который делает сложное простым для маленьких команд.

### Elevator Pitch (30 секунд)

EU AI Act вступает в полную силу 2 августа 2026 года. Штрафы — до €35 млн или 7% мирового оборота. Каждая компания, которая использует AI и продаёт в Европу, обязана классифицировать свои AI-системы и выполнить compliance-требования. Enterprise-решения стоят десятки тысяч долларов в год и требуют sales-команды. Complyance делает это за $99–499/мес в режиме полного самообслуживания. Зарегистрировался — классифицировал — получил отчёт — закрыл gaps. За 30 минут вместо 40-80 часов ручной работы.

---

## 2. Какую проблему решает

### Проблема

1. **EU AI Act** — первый в мире всеобъемлющий закон об AI. Вступает в силу поэтапно, ключевой дедлайн для high-risk систем — **2 августа 2026** (~134 дня от даты документа).
2. **Штрафы колоссальные:** до €35 млн или 7% мирового оборота за использование запрещённых AI-практик, до €15 млн или 3% за нарушения high-risk требований.
3. **Большинство SMB/SaaS компаний не знают**, подпадают ли они вообще под регулирование, и не имеют ресурсов разобраться — нет compliance-команды, нет бюджета на юриста за €300/час.
4. **76% компаний не имеют политик** для управления сторонним AI (OpenAI, Anthropic и т.д.), хотя по AI Act deployer тоже несёт ответственность.
5. **Enterprise-решения** (Credo AI, Holistic AI, OneTrust) стоят $50K–200K/год, требуют procurement-циклы в 6+ месяцев и sales-команду. Для SMB это недоступно.

### Решение

Complyance — полностью self-serve платформа, которая позволяет за 30 минут:
- Классифицировать AI-систему по EU AI Act (risk level: Minimal → Limited → High → Unacceptable)
- Получить gap analysis — что именно нужно сделать для compliance
- Сгенерировать готовые PDF-документы для регулятора
- Оценить риски AI-вендоров (OpenAI, Anthropic и т.д.)
- Хранить доказательства compliance для аудитора
- Отслеживать изменения в регуляции

Без звонков, без sales, без demo. Зарегистрировался → работаешь.

---

## 3. Целевая аудитория

### Первичная

- **SMB SaaS-компании** (10–500 сотрудников), которые используют AI в продукте и продают в ЕС
- **Стартапы**, встраивающие AI-API (OpenAI, Anthropic, Google) в свои продукты
- CTO, VP of Engineering, Head of Product — люди, ответственные за compliance в маленьких командах
- Компании из **EU, US, UAE**, которые продают на европейский рынок

### Вторичная

- **Юридические фирмы и консалтинги**, которые консультируют клиентов по AI compliance (будущий white-label/partner канал)
- **Solo developers и freelancers**, создающие AI-продукты (Free план)
- **HR Tech, FinTech, EdTech, HealthTech** — индустрии с повышенными AI-рисками

### Типичный пользователь

Павел, CTO стартапа на 30 человек. Продукт использует Claude API для анализа резюме кандидатов. Продают в Германию и Францию. Слышал про AI Act, но не знает, high-risk это или нет. Не может позволить юриста на ретейнере. Нужен быстрый ответ и план действий.

---

## 4. Ключевые фичи и что они дают

### 4.1 AI Risk Classification (Классификация рисков) ✅ Работает

**Что:** Пошаговый wizard, где пользователь описывает свою AI-систему. На основе ответов — автоматическая классификация риска.

**Как работает внутри:**
- Правила предфильтрации (rule-based) → отсекают очевидные случаи без LLM
- Claude Sonnet (temperature=0) → детерминистическая классификация по Annex III (8 категорий)
- Пост-валидация → проверяет LLM-ответ, применяет жёсткие правила (profiling = всегда HIGH)
- Мульти-регуляция → дополнительно оценивает по Colorado AI Act, NYC LL144, NIST RMF, UAE

**Что получает пользователь:** Чёткий risk level (Minimal/Limited/High/Unacceptable) с обоснованием, ссылками на конкретные статьи AI Act, и confidence score.

### 4.2 Gap Analysis (Анализ пробелов) ✅ Работает

**Что:** Для каждой классифицированной системы — персонализированный список обязательств с приоритетами.

**Что включает:**
- Articles 9–15 обязательства для high-risk систем (Risk Management, Data Governance, Technical Documentation, Record-Keeping, Transparency, Human Oversight, Accuracy & Robustness)
- Статус каждого требования: Not Started / In Progress / Completed
- Compliance Score в процентах
- Приоритизированный action plan

### 4.3 Document Generation (Генерация документов) ✅ Работает

**Что:** Автоматическая генерация PDF-документов для регулятора/аудитора.

**3 шаблона:**
1. **AI System Risk Classification Report** — полный отчёт о классификации с обоснованием
2. **Compliance Roadmap** — таймлайн действий до дедлайна
3. **Annex IV Technical Documentation** — шаблон технической документации (9 секций)

**Особенности:**
- Генерация на всех 7 языках (включая арабский RTL)
- Предзаполнение из данных, введённых в wizard
- Юридический disclaimer на каждом документе

### 4.4 Vendor Risk Assessment (Оценка рисков вендоров) ✅ Работает

**Что:** Оценка AI-провайдеров, которых использует компания (OpenAI, Anthropic, Google и т.д.).

**Что оценивает:**
- Используются ли данные клиентов для обучения модели?
- Где обрабатываются данные (EU/US)?
- Есть ли Data Processing Agreement?
- Есть ли model card / документация?
- Поддерживает ли вендор EU AI Act?
- Используются ли субпроцессоры?

**Результат:** Risk score (0–100), рекомендации по митигации, привязка вендора к AI-системам.

**Почему это важно:** Уникальная фича — ни один SMB-инструмент не делает AI-vendor-specific risk assessment.

### 4.5 Evidence Vault (Хранилище доказательств) ✅ Работает

**Что:** Безопасное хранилище для compliance-доказательств.

**Возможности:**
- Загрузка файлов (документы, скриншоты, логи, результаты тестов)
- SHA-256 integrity verification — доказательство подлинности файла
- Привязка к конкретным статьям AI Act
- Audit trail — кто, что, когда загрузил

**Почему это важно:** Превращает платформу из «генератор отчётов» в «continuous compliance platform». Аудитору нужны доказательства — Evidence Vault их хранит.

### 4.6 Regulatory Intelligence (Мониторинг регуляции) ✅ Работает

**Что:** Лента обновлений по изменениям в AI-регуляции.

**Возможности:**
- Feed обновлений в дашборде
- Read/unread tracking
- Severity filtering (критичные / важные / информационные)
- Персонализация: алерты по релевантным для клиента изменениям

**Почему это важно:** AI-регуляция меняется каждый месяц. Клиент не может следить сам. Создаёт привычку — клиент открывает продукт каждую неделю.

### 4.7 Compliance Badge (Бейдж соответствия) ✅ Работает

**Что:** Верифицируемый badge для сайта компании.

**Три уровня:**
- 🔵 **AI Act Aware** — компания начала процесс (Free план)
- 🟡 **AI Act Ready** — основные требования выполнены (Starter план)
- 🟢 **AI Act Compliant** — полное соответствие (Professional/Scale план)

**Особенности:**
- SVG badge для сайта + email подписи
- QR-код, ведущий на публичную страницу верификации (`/verify/[orgId]`)
- Embeddable HTML / Markdown код
- Динамический — обновляется при изменении compliance-статуса

**Почему это важно:** Виральный цикл. Каждый badge на сайте клиента — реклама Complyance. B2B-клиенты всё чаще требуют доказательств AI compliance при procurement.

### 4.8 Bias Testing (Тестирование на предвзятость) ✅ Работает

**Что:** AI-powered анализ fairness для классифицированных систем.

### 4.9 Free AI Risk Classifier (Бесплатный классификатор) ✅ Работает

**Что:** Публичный инструмент по адресу `/free-classifier` — классификация AI-системы без регистрации.

**Зачем:** Верхняя часть воронки. Пользователь пробует бесплатно → видит что его система high-risk → нужен полный gap analysis и документы → регистрируется.

### 4.10 Blog ✅ Работает

**5 SEO-статей:**
1. «EU AI Act Deadline August 2026: What SMBs Need to Do Now»
2. «AI Act Annex III Explained: 8 Categories That Make Your AI High-Risk»
3. «Is Your AI Vendor EU AI Act Compliant? OpenAI, Anthropic, Google Compared»
4. «Is Your SaaS High-Risk Under the EU AI Act?»
5. «EU AI Act vs Colorado AI Act vs NYC Local Law 144: What SaaS Founders Need to Know»

---

## 5. Тарифные планы

| | **Free** | **Starter $99/мес** | **Professional $249/мес** | **Scale $499/мес** |
|---|---|---|---|---|
| AI-системы | 1 | 5 | 20 | 50 |
| Vendor assessments | 0 | 2 | 10 | Безлимит |
| Генерация документов | ❌ | ✅ | ✅ | ✅ |
| Evidence Vault | ❌ | ❌ | ✅ | ✅ |
| Compliance Badge | Aware | Ready | Compliant | Compliant |
| Regulatory Alerts | ❌ | Еженедельно | Real-time | Real-time |
| Bias Testing | ❌ | ❌ | 3/мес | Безлимит |
| Team Members | 1 | 1 | 3 | 10 |

**Логика ценообразования:** Free → воронка и виральность. Starter → базовый compliance для маленьких команд. Professional → полный compliance toolkit. Scale → для компаний с десятками AI-систем.

**Оплата:** Paddle (Merchant of Record) — Paddle выступает юридическим продавцом, берёт на себя все налоги (VAT, sales tax) во всех странах.

---

## 6. Конкурентный ландшафт

### Enterprise-конкуренты (недоступны для SMB)

| Конкурент | Что делает | Цена | Почему не конкурент |
|---|---|---|---|
| **Credo AI** | AI governance platform | $50K–200K+/год | Enterprise-only, 6+ месяцев procurement |
| **Holistic AI** | AI risk management | $$$$/год | Enterprise, sales-driven |
| **IBM watsonx.governance** | AI lifecycle governance | Enterprise pricing | Часть IBM ecosystem, не self-serve |
| **OneTrust** | GRC platform с AI-модулем | $$$$/год | Общий GRC, не AI-specific |

### Ближайшие аналоги

| Конкурент | Что делает | Разница с Complyance |
|---|---|---|
| **Vanta** | SOC 2 / ISO 27001 compliance | Общий GRC, не AI-specific. Может добавить AI-модуль. |
| **Drata** | Compliance automation | Аналогично Vanta — не AI-focused |

### Бесплатные инструменты

Есть несколько бесплатных AI Act checkers онлайн — дают поверхностную оценку без gap analysis, документов, и continuous compliance.

### Конкурентные преимущества Complyance

1. **Self-serve** — никаких звонков, demo, procurement. Зарегистрировался и работаешь.
2. **Фокус на AI compliance** — не общий GRC, а специализированный AI compliance инструмент.
3. **AI Vendor Risk Assessment** — уникальная фича, которую никто не делает для SMB.
4. **Compliance Badge** — виральный механизм (каждый badge = реклама).
5. **Мульти-регуляция** — EU AI Act + Colorado + NYC LL144 + UAE + NIST в одном продукте.
6. **7 языков** — English, French, German, Portuguese, Arabic, Polish, Italian.
7. **Цена** — $99–499/мес vs $50K+/год у enterprise.
8. **Время до результата** — 30 минут vs 40–80 часов ручной работы.

---

## 7. Технический стек (для технических постов)

| Слой | Технология |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| API | tRPC, Next.js Route Handlers |
| Database | PostgreSQL + Prisma ORM |
| AI Engine | Anthropic Claude Sonnet API (temperature=0 для детерминизма) |
| Auth | NextAuth.js v5 (email + Google OAuth) |
| Payments | Paddle (Merchant of Record) |
| Email | Resend |
| Storage | AWS S3 / Cloudflare R2 |
| PDF | @react-pdf/renderer |
| i18n | next-intl (7 языков, включая Arabic RTL) |
| Monitoring | Sentry (ошибки) + PostHog (аналитика) |
| Deploy | Railway (PostgreSQL, Redis, Next.js, Worker) |

---

## 8. Текущая стадия проекта

### Статус: Pre-launch (closed beta ready)

**Готовность: 8/10** — core flows работают end-to-end.

### ✅ Что полностью готово и работает

- Регистрация, вход, сброс пароля (email + Google OAuth)
- Dashboard с onboarding-шагами
- Классификация AI-систем (rule engine + Claude)
- Gap Analysis с compliance score
- Генерация 3 PDF-документов на всех 7 языках
- Vendor Risk Assessment
- Evidence Vault с SHA-256 integrity
- Regulatory Intelligence (лента обновлений)
- Compliance Badge (SVG + публичная верификация)
- Bias Testing
- Free Classifier (без регистрации)
- Blog (5 SEO-статей)
- Полная локализация (7 языков × 1,583 ключа = 100% покрытие)
- SEO: OG-теги, dynamic OG image, sitemap, robots.txt, structured data
- Security: CSP, HSTS, rate limiting (100 req/min)
- Monitoring: Sentry + PostHog
- 40 E2E smoke tests (Playwright)
- Dockerfile для Railway deploy

### 🔴 Заблокировано

- **Оплата платных планов** — ожидает верификации Paddle-аккаунта. Вся инфраструктура биллинга готова (webhooks, plan display, usage tracking), но checkout недоступен.

### 🟡 Запланировано на пост-launch (первый месяц)

- Team management (приглашения, роли) — для Professional/Scale планов
- Incident Register — требование AI Act для high-risk систем
- BullMQ queue для классификации (сейчас inline)
- Дополнительные PDF-шаблоны (Vendor Assessment, Model Card, Bias Report)
- Welcome email при регистрации

### 🔵 Стратегический roadmap (6–24 месяца)

1. **CI/CD API + SDK** — compliance-проверки в pipeline (GitHub Action, Python/Node SDK)
2. **Model Card Generator** — автогенерация model cards для прозрачности
3. **AI Vendor Trust Directory** — публичный каталог вендоров с compliance-рейтингами (сетевой эффект)
4. **Compliance Benchmarking** — анонимизированные бенчмарки по индустриям
5. **Agentic AI Governance** — governance для автономных AI-агентов (новый рынок с 2027)
6. **White-Label / Partner Program** — для юрфирм и консалтингов
7. **Compliance-as-Code** — machine-readable regulation rules, API для других SaaS
8. **Complyance Agent** — автономный compliance-мониторинг внутри инфраструктуры клиента

---

## 9. Бизнес-модель

### Модель монетизации

SaaS-подписка с 4 тарифами ($0 / $99 / $249 / $499 в месяц). Paddle как Merchant of Record (упрощает юридическую структуру, берёт на себя налоги).

### Ключевые бизнес-метрики (целевые)

| Период | MRR | Paying users |
|---|---|---|
| Launch (Q2 2026) | $0 → $5K | 25–50 |
| Q3 2026 | $5K → $15K | 150–300 |
| Q1 2027 | $15K → $50K | 500–1,000 |
| Q4 2027 | $50K → $150K | 2,000–3,000 |

### Unit Economics (целевые)

- ARPU: ~$200/мес (mix Free + платных)
- Gross margin: ~70–80% (основные затраты — Anthropic API, Railway hosting)
- Target churn: <5% monthly после Evidence Vault + Intelligence

### Каналы привлечения (запланированные)

1. **SEO + Blog** — 5 статей на высокочастотные запросы по AI compliance
2. **Free Classifier** — бесплатный инструмент как верх воронки
3. **Compliance Badge** — виральность (каждый badge на сайте клиента = реклама)
4. **Referral Program** — +2 системы за каждого приведённого платящего клиента
5. **Product Hunt** — запуск для первоначального трафика
6. **LinkedIn** — контент для CTO/VP Engineering аудитории
7. **Партнёрства** — юрфирмы, консалтинги по AI compliance

---

## 10. Рыночный контекст

### Размер рынка

- AI governance market: **$228M (2024) → $1.4–7.4B (2030)** (зависит от источника)
- Agentic AI governance (подсегмент): **$7.28B (2025) → $38.94B (2030)**, CAGR 39.85%
- SAM для Complyance: SMB SaaS-компании с AI-фичами, продающие в EU — десятки тысяч компаний

### Ключевые регуляторные события

| Дата | Событие |
|---|---|
| Авг 2024 | EU AI Act вступил в силу |
| Фев 2025 | Запрет AI-практик из Article 5 (social scoring, манипулятивный AI и т.д.) |
| Авг 2025 | Требования к GPAI-моделям (Articles 51-53) |
| **Авг 2026** | **Полные high-risk требования (Articles 6-49, Annex III) — ГЛАВНЫЙ ДЕДЛАЙН** |
| Авг 2027 | Требования к high-risk AI в Annex I (regulated products) |

### Digital Omnibus

ЕС обсуждает "Digital Omnibus" пакет, который может сдвинуть некоторые дедлайны. Но это не снимает необходимость подготовки — compliance нужен не только из-за дедлайна, но и для доверия клиентов, procurement requirements, и конкурентного преимущества.

---

## 11. О фаундере

**Solo founder.** Проект bootstrapped (без инвестиций). Все доходы реинвестируются в продукт. Нет sales-команды — всё self-serve. Paddle как MoR решает сложности с юрисдикцией.

---

## 12. Ключевые тезисы для маркетинга

### Для постов / описаний

- «EU AI Act дедлайн — 2 августа 2026. У вас есть ~X месяцев.»
- «Штрафы до €35 млн или 7% мирового оборота.»
- «Если вы используете OpenAI/Claude/Google AI в продукте и продаёте в Европу — вы уже под регуляцией.»
- «Enterprise-решения стоят $50K+/год. Complyance — от $99/мес.»
- «30 минут вместо 40-80 часов ручной работы на техническую документацию.»
- «Не просто чеклист — полная платформа: классификация → gap analysis → документы → evidence vault.»
- «7 языков, включая Arabic RTL. Для глобальных команд.»

### Для технической аудитории

- «Детерминистическая классификация — Claude Sonnet с temperature=0, пост-валидация rule engine.»
- «Не чёрный ящик — каждая классификация обоснована ссылками на конкретные статьи AI Act.»
- «SHA-256 integrity для evidence — доказательство подлинности для аудитора.»
- «Мульти-регуляция: EU AI Act + Colorado AI Act + NYC LL144 + NIST RMF + UAE.»

### Для бизнес-аудитории

- «Compliance badge на вашем сайте = конкурентное преимущество при B2B-продажах.»
- «Ваши клиенты начинают спрашивать про AI compliance — будьте готовы.»
- «Compliance — это не разовая задача, а процесс. Complyance автоматизирует его.»
- «Risk assessment для AI-вендоров — знайте, насколько ваш OpenAI/Anthropic договор compliance-ready.»

---

## 13. FAQ (Частые вопросы)

**Q: Complyance заменяет юриста?**
A: Нет. Complyance — инструмент, который делает 80% работы по compliance автоматически. Для conformity assessment и специфических юридических вопросов рекомендуется консультация с юристом. Каждый отчёт содержит юридический disclaimer.

**Q: Подходит ли для компаний, которые не в EU?**
A: Да. EU AI Act имеет экстерриториальное действие — если ваш продукт доступен в EU или ваши клиенты в EU, закон распространяется на вас. Плюс Complyance покрывает Colorado AI Act, NYC LL144 и UAE requirements.

**Q: Мы используем OpenAI API — мы deployer или provider?**
A: Вы — provider AI-системы (вашего продукта) и одновременно deployer GPAI-модели (OpenAI). Вы несёте полную ответственность за compliance вашей системы, даже если underlying model не ваша.

**Q: Что если дедлайн сдвинут?**
A: Даже если Digital Omnibus сдвинет дедлайн, compliance нужен для: (1) доверия клиентов, (2) procurement requirements — B2B-клиенты уже спрашивают, (3) конкурентного преимущества, (4) подготовки занимает время — лучше начать раньше.

**Q: Чем отличается от бесплатных AI Act checkers?**
A: Бесплатные чекеры дают поверхностную оценку «high risk / not high risk». Complyance даёт: детальную классификацию по конкретной категории Annex III, gap analysis с приоритизированным action plan, генерацию PDF-документов, vendor risk assessment, evidence vault, compliance badge, и continuous monitoring. Это платформа, не калькулятор.

**Q: Данные в безопасности?**
A: PostgreSQL с шифрованием at rest, TLS для всех соединений, SHA-256 integrity для evidence, JWT auth, rate limiting, Content Security Policy headers. Мониторинг через Sentry. Hosting — Railway (EU-friendly).

**Q: Поддерживает ли Arabic / RTL?**
A: Да. Все 7 языков полностью переведены (1,583 ключа). Arabic поддерживается с RTL-layout через Tailwind logical properties. PDF-документы тоже генерируются на Arabic с правильным RTL.

---

## 14. Глоссарий (для тех, кто пишет контент)

| Термин | Значение |
|---|---|
| **EU AI Act** | Regulation (EU) 2024/1689 — первый всеобъемлющий закон об AI в мире |
| **Annex III** | Приложение III к AI Act — 8 категорий high-risk AI-систем |
| **Article 6** | Статья, определяющая правила классификации high-risk систем |
| **Article 6(3)** | Исключения — когда система из Annex III всё же НЕ high-risk |
| **High-risk** | AI-система с обязательствами по Articles 9-15 (документация, мониторинг, oversight) |
| **Limited risk** | AI-система с обязательствами прозрачности (Article 50) — чатботы, deepfakes |
| **Minimal risk** | AI-система без специфических обязательств |
| **Unacceptable risk** | Запрещённые AI-практики (Article 5) — social scoring, манипулятивный AI |
| **Provider** | Компания, которая разрабатывает и размещает AI-систему на рынке |
| **Deployer** | Компания, которая использует AI-систему в своей деятельности |
| **GPAI** | General-Purpose AI — модели общего назначения (GPT-4, Claude, Gemini) |
| **Conformity Assessment** | Формальная процедура подтверждения соответствия требованиям |
| **Gap Analysis** | Анализ разрыва между текущим состоянием и требуемым compliance |
| **Evidence Vault** | Хранилище доказательств compliance для аудитора |
| **MoR** | Merchant of Record — Paddle выступает юридическим продавцом |
| **Digital Omnibus** | Пакет поправок ЕС, который может изменить некоторые дедлайны AI Act |

---

## 15. Контакты и ссылки

- **Сайт:** https://complyance.io
- **Приложение:** https://app.complyance.io
- **Free Classifier:** https://app.complyance.io/free-classifier
- **Blog:** https://app.complyance.io/blog
- **Badge Verification:** https://app.complyance.io/verify/[orgId]
