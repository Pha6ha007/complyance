# Задание: Redesign лендинга Complyance

Используй frontend-design skill из .claude/skills/frontend-design/SKILL.md.

## Дизайн-система

### Цвета
- Primary: Emerald #10B981 (compliance = green = approved)
- Primary dark: #059669
- Primary light: #34D399
- Background: White #FFFFFF
- Background secondary: #F9FAFB
- Text primary: #111827
- Text secondary: #6B7280
- Dark sections: #0F172A (для hero или feature blocks)
- Accent gradient: from-emerald-500 to-teal-400

### Типографика
- Заголовки: font-семейство Cal Sans или Inter Bold, крупный размер (text-5xl до text-7xl)
- Текст: Inter, text-lg, text-gray-600
- Подзаголовки: Inter Medium, text-xl

### Стиль
- Referens: микс Vanta.com + Sprinto.com
- Светлая тема, чистый и профессиональный
- Emerald акценты на CTA кнопках, иконках, бордерах
- Мягкие тени (shadow-lg), скруглённые карточки (rounded-2xl)
- Fade-in анимации при скролле (CSS animation или framer-motion если доступен)
- Gradient backgrounds на hero и CTA секциях

## Структура лендинга (src/app/[locale]/page.tsx)

### 1. Header / Navigation
- Логотип "Complyance" слева (зелёный кружок + текст)
- Навигация: Features, Pricing, Blog, About
- CTA кнопка "Get Started Free" справа (emerald background)
- Sticky header с backdrop-blur при скролле

### 2. Hero Section
- Тёмный фон (#0F172A) с subtle gradient
- Крупный заголовок: "AI Compliance Made Simple"
- Подзаголовок: "Classify your AI systems, identify compliance gaps, and generate documentation — all before the EU AI Act deadline"
- Два CTA: "Start Free" (emerald) + "View Pricing" (outline)
- Countdown badge: "🕐 X days until EU AI Act deadline"
- Справа или снизу: скриншот/мокап dashboard (можно placeholder div с gradient)

### 3. Trust Bar
- "Trusted by SaaS companies across EU, US, and UAE"
- Лого placeholder блоки (серые) — заполним позже

### 4. Problem Section
- Заголовок: "The EU AI Act Deadline is Coming"
- 3 карточки с иконками:
  - "€35M fines" — penalties for non-compliance
  - "78% unprepared" — companies without AI governance
  - "40+ hours" — manual compliance documentation time
- Emerald accent borders или icons

### 5. How It Works — 3 Steps
- Заголовок: "Get Compliant in 3 Steps"
- Step 1: "Classify" — Add your AI system, get instant risk classification
- Step 2: "Analyze" — See compliance gaps and prioritized action plan  
- Step 3: "Document" — Generate audit-ready reports in one click
- Визуально: numbered circles с emerald background, connecting line

### 6. Features Grid
- Заголовок: "Everything You Need for AI Compliance"
- 6 карточек (2x3 grid):
  - Risk Classification (Annex III mapping)
  - Gap Analysis (Articles 9-15 checklist)
  - Document Generator (PDF reports)
  - Vendor Risk Assessment (OpenAI, Anthropic, etc.)
  - Evidence Vault (audit-ready storage)
  - Regulatory Intelligence (real-time updates)
- Каждая: иконка (lucide-react), заголовок, 1-2 строки описания
- Hover эффект: поднимается тень + emerald border

### 7. Compliance Badge Section
- Заголовок: "Show Your Customers You're Compliant"
- 3 badge уровня: Aware → Ready → Compliant
- Визуально: badge превью с emerald checkmarks
- "Every badge links to a verified compliance page"

### 8. Pricing Preview
- Заголовок: "Simple, Transparent Pricing"
- 3 карточки: Free ($0), Starter ($99), Professional ($249)
- Highlight на Professional (emerald border, "Most Popular" badge)
- CTA: "View All Plans" ведёт на /pricing

### 9. Testimonials / Social Proof (placeholder)
- Заголовок: "What Founders Say"
- 3 placeholder testimonial карточки с серыми аватарами
- Текст: placeholder цитаты про compliance

### 10. CTA Section (bottom)
- Emerald gradient фон
- "Start Your Compliance Journey Today"
- "Classify your first AI system for free. No credit card required."
- Большая кнопка "Get Started Free"

### 11. Footer
- Используй существующий footer component

## Технические требования

- Server component (Next.js App Router)
- Все тексты через useTranslations('marketing') — добавь ключи в en.json
- Tailwind CSS only (никаких inline styles)
- Responsive: mobile-first
- Логические свойства для RTL (ms-/me-/ps-/pe-)
- Анимации: CSS @keyframes для fade-in-up при появлении в viewport
- Иконки: lucide-react (Shield, FileCheck, BarChart3, Users, Bell, Award)
- Не ломай существующие routes и компоненты

## Коммит
"feat: Redesign landing page with emerald design system"
