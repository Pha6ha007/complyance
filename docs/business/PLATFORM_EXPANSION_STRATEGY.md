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

## Фаза 6: Deep Integration (2028-2029) — «Compliance Built-In»

### 6.1 CI/CD Compliance Gate (первый шаг интеграции)

**Что это:** API-endpoint, который вызывается перед деплоем. Если compliance-статус не OK — деплой блокируется.

**Реализация:**
- REST API: `POST /api/v1/check` → returns `{ allowed: true/false, reason: "..." }`
- GitHub Action: `complyance/compliance-check@v1` — добавляется в workflow за 2 минуты
- GitLab CI template
- Webhook: уведомление при изменении compliance-статуса системы

**Пример:**
```yaml
# .github/workflows/deploy.yml
- name: Compliance Check
  uses: complyance/compliance-check@v1
  with:
    api-key: ${{ secrets.COMPLYANCE_API_KEY }}
    system-id: "sys_abc123"
    fail-on: "HIGH"  # Block deploy if any HIGH/CRITICAL gaps open
```

**За что платит пользователь:** Compliance встроен в процесс разработки. Невозможно случайно задеплоить non-compliant код. Максимальный switching cost — переключиться = переписать все пайплайны.

**Pricing:** Только план Scale ($499/мес) и выше.

### 6.2 Lightweight SDK — Логирование AI-вызовов

**Что это:** Минимальный SDK (Python + Node.js), который оборачивает AI-вызовы клиента и логирует метаданные для compliance.

**Что логирует (НЕ содержимое, только мета):**
- Timestamp вызова
- Какая модель используется (gpt-4, claude-sonnet, etc.)
- Тип запроса (classification, generation, recommendation)
- Обрабатываются ли персональные данные (PII detection flag)
- Latency, token count
- Ошибки и отказы

**Что НЕ логирует:** содержимое промптов и ответов (privacy). Только metadata.

**Реализация:**
```python
# pip install complyance
from complyance import ComplyanceTracker

tracker = ComplyanceTracker(api_key="...", system_id="sys_abc123")

# Wraps existing OpenAI call
response = tracker.wrap(openai.chat.completions.create)(
    model="gpt-4",
    messages=[...]
)

# Automatically logs: model, timestamp, tokens, latency, PII flag
# Data appears in Complyance dashboard → Evidence Vault
```

```javascript
// npm install @complyance/sdk
import { ComplyanceTracker } from '@complyance/sdk';

const tracker = new ComplyanceTracker({ apiKey: '...', systemId: 'sys_abc123' });

// Wraps existing Anthropic call
const response = await tracker.wrap(anthropic.messages.create)({
  model: 'claude-sonnet-4-20250514',
  messages: [...]
});
```

**За что платит пользователь:**
- Автоматическое заполнение Evidence Vault — не нужно вручную загружать скриншоты
- Record-keeping для Article 12 (logging requirement)
- Доказательство для аудитора: «вот лог всех AI-вызовов за последние 6 месяцев»
- PII detection алерты: «ваша система обработала 1,247 запросов с персональными данными на этой неделе»

**Pricing:** Plan Professional ($249/мес) и выше.

### 6.3 Drift & Anomaly Detection

**Что это:** На основе данных SDK — автоматическое обнаружение изменений в поведении AI-системы.

**Что детектит:**
- Model drift: клиент переключился с GPT-4 на GPT-4-mini → алерт (изменение модели может повлиять на классификацию)
- Usage spike: количество AI-вызовов выросло в 10 раз → возможно добавлена новая фича → нужна переклассификация
- PII spike: резкий рост обработки персональных данных → алерт
- Error rate spike: модель стала отказывать чаще → reliability concern (Article 15)
- New endpoint: SDK обнаружил вызовы к новому AI-провайдеру → нужен vendor assessment

**За что платит пользователь:** Compliance не ломается тихо. Каждое значимое изменение → алерт → action item в дашборде.

---

## Фаза 7: Full Compliance Agent (2029+) — «AI-Аудитор внутри продукта»

### 7.1 Complyance Agent — автономный compliance-мониторинг

**Что это:** AI-агент, который полностью интегрируется в инфраструктуру клиента и непрерывно мониторит compliance.

**Что делает агент:**
- Сканирует кодовую базу (через GitHub/GitLab integration) → находит все AI-вызовы
- Анализирует data flows → какие данные куда идут, есть ли PII
- Мониторит AI-ответы в реальном времени → детектит bias, галлюцинации, токсичность
- Отслеживает изменения в коде → новая AI-фича? → автоматическая переклассификация
- Генерирует compliance-отчёты автоматически → Evidence Vault заполняется без участия человека
- Алертит при нарушениях → «Ваш чат-бот дал ответ, нарушающий Article 50 transparency requirement»

**Архитектура:**
```
Customer's infrastructure
├── Complyance Agent (lightweight container / sidecar)
│   ├── Code Scanner (reads repo, finds AI usage patterns)
│   ├── Traffic Monitor (intercepts AI API calls, metadata only)
│   ├── Response Analyzer (samples AI outputs for quality/bias)
│   └── Reporter (sends aggregated data to Complyance cloud)
│
Complyance Cloud
├── Dashboard (real-time compliance status)
├── Alert Engine (risk-based notifications)
├── Evidence Vault (auto-populated from agent data)
└── Report Generator (continuous compliance reports)
```

**Bounded Autonomy:**
- Агент ТОЛЬКО мониторит и алертит
- Агент НЕ изменяет код, НЕ блокирует запросы, НЕ модифицирует ответы
- Все решения принимает человек
- Полный audit trail действий агента

**Security:**
- Agent runs in customer's infrastructure (data не покидает их среду)
- Только агрегированные метрики отправляются в Complyance cloud
- SOC 2 Type II certification для агента (к этому моменту нужно)
- On-premise deployment option для regulated industries

**За что платит пользователь:** Полностью автономный compliance. Человек открывает дашборд раз в неделю, видит зелёный статус, подписывает quarterly report. Всё остальное — автоматически.

**Pricing:** Enterprise план $2,999-9,999/мес. Это конкурирует с Credo AI, но с self-serve онбордингом.

### 7.2 Multi-Agent Governance

**Что это:** Управление compliance для компаний, которые деплоят множественные AI-агенты (не модели, а автономные агенты).

**Проблема к 2029:** Компании будут иметь десятки AI-агентов: sales agent, support agent, coding agent, analytics agent. Каждый агент вызывает инструменты, принимает решения, взаимодействует с другими агентами. Текущие compliance-фреймворки не покрывают agent-to-agent коммуникацию.

**Что делает:**
- Inventory: какие агенты, что делают, какие tools вызывают, к каким данным имеют доступ
- Dependency mapping: агент A вызывает агента B → chain of responsibility
- Autonomy scoring: насколько автономен каждый агент (1-10 шкала)
- Escalation rules: когда агент должен передать решение человеку
- Cross-agent audit trail: полная цепочка действий через все агенты

---

## Эволюция интеграции (от tool к infrastructure)

| Этап | Глубина | Effort клиента | Switching cost | Ценность |
|------|---------|---------------|----------------|----------|
| **Tool** (Фазы 1-2) | Описание + документы | 30 минут | Низкий | Классификация + отчёты |
| **Document Analysis** (Фаза 2+) | Загрузка документов | 10 минут | Средний | Авто-анализ рисков |
| **CI/CD Gate** (Фаза 6.1) | 1 строка в pipeline | 5 минут | Высокий | Блокировка non-compliant деплоев |
| **SDK** (Фаза 6.2) | Обёртка AI-вызовов | 1 час | Очень высокий | Авто-логирование + evidence |
| **Drift Detection** (Фаза 6.3) | Автоматически | 0 минут | Очень высокий | Превентивные алерты |
| **Full Agent** (Фаза 7) | Контейнер в инфраструктуре | 2-4 часа | Максимальный | Полностью автономный compliance |

Каждый шаг увеличивает глубину интеграции → switching cost → retention → ARPU.

---

## Эволюция ценности для пользователя

| Фаза | Пользователь говорит | Готов платить |
|------|---------------------|--------------|
| 1 | «Мне нужно понять, подпадаю ли я под AI Act» | $99-249/мес |
| 2 | «Мне нужно непрерывно поддерживать compliance» | $249-499/мес |
| 3 | «Мне нужно управлять compliance для AI-агентов» | $499-999/мес |
| 4 | «Мне нужна экосистема: вендоры, консультанты, бенчмарки» | $499-1499/мес |
| 5 | «Мне нужна сертификация и industry-standard» | $999-2999/мес |
| 6 | «Мне нужен compliance, встроенный в мой код» | $499-2999/мес |
| 7 | «Мне нужен автономный AI-аудитор внутри моего продукта» | $2999-9999/мес |

Ключевое: пользователь никогда не платит за фичи. Он платит за **уверенность** — уверенность, что его бизнес защищён от штрафов, репутационных потерь и потери клиентов.

---

## Конкурентная эволюция

| Год | Complyance | Credo AI | Vanta | Бесплатные чекеры |
|-----|-----------|----------|-------|-----------------|
| 2026 | SMB compliance platform | Enterprise AI governance | General GRC | Static tools |
| 2027 | AI Trust OS + Agentic governance | Enterprise + agentic | Adding AI modules | Abandoned/outdated |
| 2028 | Compliance infrastructure (API + SDK + Marketplace) | Enterprise platform | Competing on AI features | Dead |
| 2029 | Full compliance agent + Multi-agent governance | Enterprise + agent monitoring | May acquire AI compliance startup | — |

**Твоя стратегическая ставка:** Credo AI и IBM watsonx.governance никогда не спустятся в SMB-сегмент — слишком дорого обслуживать мелких клиентов с их sales-моделью. Vanta добавит AI-модули, но AI governance не будет их core competency. Твоя ниша — self-serve AI compliance для 10,000+ SMB компаний, которые используют AI, но не имеют compliance-команды. К моменту когда конкуренты доберутся до SMB, ты уже будешь на уровне infrastructure (SDK + Agent) с максимальным switching cost.

---

## Ключевые метрики по фазам

| Метрика | Фаза 1 (Q2'26) | Фаза 2 (Q3'26) | Фаза 3 (Q1'27) | Фаза 4 (Q4'27) | Фаза 5 (2028) | Фаза 6-7 (2029) |
|---------|----------------|----------------|----------------|----------------|---------------|-----------------|
| Users (total) | 500 | 2,000 | 8,000 | 25,000 | 75,000 | 150,000+ |
| Paying users | 25-50 | 150-300 | 500-1,000 | 2,000-3,000 | 5,000+ | 10,000+ |
| MRR | $5K | $15K | $50K | $150K | $500K | $1M+ |
| ARR | $60K | $180K | $600K | $1.8M | $6M | $12M+ |
| AI Systems classified | 200 | 2,000 | 15,000 | 60,000 | 200,000+ | 500,000+ |
| Vendors in directory | — | — | 50 | 500 | 2,000+ | 5,000+ |
| SDK integrations | — | — | — | — | 100+ | 1,000+ |
| Agent deployments | — | — | — | — | — | 50+ |
| Churn (monthly) | 8-10% | 5-7% | 3-5% | 2-4% | 2-3% | 1-2% |

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
