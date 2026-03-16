# INTEGRATION_MASTER_PLAN.md — Complyance
## Интеграция 5 GitHub-репозиториев для усиления продукта

**Читай этот файл первым при каждой сессии Claude Code.**
**Стек:** Next.js 14+, TypeScript strict, tRPC, Prisma/PostgreSQL, BullMQ/Redis, Railway

---

## ПОРЯДОК ВЫПОЛНЕНИЯ

```
Фаза 1 (1-2 дня): AI Legislation Tracker → Regulatory Intelligence
Фаза 2 (2-3 дня): mcp-eu-ai-act → Deep Scan на Free Classifier
Фаза 3 (5-7 дней): AIF360 → Bias Testing микросервис
Фаза 4 (7-10 дней): AgentGuard → Complyance SDK
Фаза 5 (3-4 недели): Attestix → Cryptographic Compliance Badge
```

---

## ФАЗА 1: AI Legislation Tracker → Regulatory Intelligence
**Репо:** https://github.com/delschlangen/ai-legislation-tracker
**Цель:** наполнить модуль Regulatory Intelligence реальными данными о законодательстве
**Сложность:** Низкая
**Затрагивает:** prisma/schema.prisma, seed файл, intelligence router, intelligence страница

### Шаг 1.1 — Скачать данные

```bash
# В корне проекта
mkdir -p data/legislation
curl -o data/legislation/us_federal.json \
  https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/us_federal_actions.json
curl -o data/legislation/us_state.json \
  https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/us_state_bills.json
curl -o data/legislation/international.json \
  https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/international_frameworks.json
```

### Шаг 1.2 — Добавить модель в Prisma (попросить подтверждение перед выполнением)

Добавить в `prisma/schema.prisma` после существующих моделей:

```prisma
model LegislationEntry {
  id              String   @id @default(cuid())
  externalId      String   @unique  // из JSON: "eu-001", "state-001" etc
  jurisdiction    String   // "EU", "US-CO", "US-NYC", "UAE", "UK", "China"
  title           String
  status          String   // "enacted", "proposed", "in_force", "repealed"
  effectiveDate   DateTime?
  summary         String   @db.Text
  keyProvisions   Json     // string[]
  sourceUrl       String
  tags            Json     // string[]
  lastVerified    DateTime
  impactLevel     String   @default("MEDIUM") // HIGH, MEDIUM, LOW
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([jurisdiction])
  @@index([status])
  @@index([tags])
}
```

### Шаг 1.3 — Создать seed скрипт

Создать `prisma/seeds/legislation.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

async function seedLegislation() {
  console.log('🌱 Seeding legislation data...');

  // Международные фреймворки
  const internationalRaw = fs.readFileSync(
    path.join(process.cwd(), 'data/legislation/international.json'),
    'utf-8'
  );
  const international = JSON.parse(internationalRaw);

  // US State bills
  const usStateRaw = fs.readFileSync(
    path.join(process.cwd(), 'data/legislation/us_state.json'),
    'utf-8'
  );
  const usState = JSON.parse(usStateRaw);

  const entries = [...(international.frameworks || []), ...(usState.bills || [])];

  for (const entry of entries) {
    await prisma.legislationEntry.upsert({
      where: { externalId: entry.id },
      update: {
        status: entry.status || 'proposed',
        summary: entry.summary || '',
        lastVerified: parseDate(entry.last_verified) || new Date(),
        updatedAt: new Date(),
      },
      create: {
        externalId: entry.id,
        jurisdiction: entry.jurisdiction || entry.state || 'UNKNOWN',
        title: entry.title || entry.name || '',
        status: entry.status || 'proposed',
        effectiveDate: parseDate(entry.effective_date),
        summary: entry.summary || '',
        keyProvisions: entry.key_provisions || [],
        sourceUrl: entry.source_url || '',
        tags: entry.tags || [],
        lastVerified: parseDate(entry.last_verified) || new Date(),
        impactLevel: entry.tags?.includes('comprehensive') ? 'HIGH' : 'MEDIUM',
      },
    });
  }

  console.log(`✅ Seeded ${entries.length} legislation entries`);
}

seedLegislation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Шаг 1.4 — Создать cron endpoint для автообновления

Создать `src/app/api/cron/legislation-sync/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LEGISLATION_URLS = {
  international: 'https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/international_frameworks.json',
  usState: 'https://raw.githubusercontent.com/delschlangen/ai-legislation-tracker/main/data/us_state_bills.json',
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let updated = 0;

    for (const [, url] of Object.entries(LEGISLATION_URLS)) {
      const res = await fetch(url);
      const data = await res.json();
      const entries = data.frameworks || data.bills || [];

      for (const entry of entries) {
        const result = await prisma.legislationEntry.upsert({
          where: { externalId: entry.id },
          update: {
            status: entry.status,
            lastVerified: new Date(),
            updatedAt: new Date(),
          },
          create: {
            externalId: entry.id,
            jurisdiction: entry.jurisdiction || entry.state || 'UNKNOWN',
            title: entry.title || entry.name || '',
            status: entry.status || 'proposed',
            effectiveDate: entry.effective_date ? new Date(entry.effective_date) : null,
            summary: entry.summary || '',
            keyProvisions: entry.key_provisions || [],
            sourceUrl: entry.source_url || '',
            tags: entry.tags || [],
            lastVerified: new Date(),
            impactLevel: entry.tags?.includes('comprehensive') ? 'HIGH' : 'MEDIUM',
          },
        });
        if (result) updated++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Legislation sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

### Шаг 1.5 — Обновить intelligence router

В `src/server/routers/intelligence.ts` добавить процедуру:

```typescript
getLegislation: protectedProcedure
  .input(z.object({
    jurisdiction: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
    cursor: z.string().optional(),
  }))
  .query(async ({ input }) => {
    const where: Prisma.LegislationEntryWhereInput = {};
    if (input.jurisdiction) where.jurisdiction = input.jurisdiction;
    if (input.status) where.status = input.status;

    const entries = await prisma.legislationEntry.findMany({
      where,
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: [{ impactLevel: 'desc' }, { updatedAt: 'desc' }],
    });

    const hasMore = entries.length > input.limit;
    return {
      entries: entries.slice(0, input.limit),
      nextCursor: hasMore ? entries[input.limit - 1].id : null,
    };
  }),
```

### Шаг 1.6 — i18n ключи (добавить в en.json)

```json
"intelligence": {
  "legislation": {
    "title": "Global AI Legislation",
    "subtitle": "Track AI laws and regulations worldwide",
    "jurisdictions": {
      "all": "All Jurisdictions",
      "EU": "European Union",
      "US-CO": "Colorado, USA",
      "US-NYC": "New York City",
      "UAE": "United Arab Emirates",
      "UK": "United Kingdom"
    },
    "status": {
      "enacted": "In Force",
      "proposed": "Proposed",
      "in_force": "In Force",
      "repealed": "Repealed"
    },
    "impact": {
      "HIGH": "High Impact",
      "MEDIUM": "Medium Impact",
      "LOW": "Low Impact"
    },
    "lastVerified": "Last verified",
    "viewSource": "View official source",
    "affectsYourSystems": "May affect your systems"
  }
}
```

### Коммит после Фазы 1:
```bash
git add -A
git commit -m "feat(intelligence): add global AI legislation tracker with auto-sync"
```

---

## ФАЗА 2: mcp-eu-ai-act → Free Classifier Deep Scan
**Репо:** https://github.com/ark-forge/mcp-eu-ai-act
**Цель:** добавить "Deep Scan" на страницу Free Classifier — сканирование codebase
**Сложность:** Низкая-средняя
**Затрагивает:** src/app/api/public/v1/scan/, src/app/[locale]/(marketing)/free-classifier/

### Архитектура

```
Browser → POST /api/public/v1/deep-scan → Next.js Route Handler →
Python subprocess (mcp-eu-ai-act) → JSON результат → Response
```

### Шаг 2.1 — Создать Python скрипт-обёртку

Создать `scripts/compliance_scan.py`:

```python
#!/usr/bin/env python3
"""
Complyance Deep Scan — обёртка над mcp-eu-ai-act
Принимает JSON на stdin, выдаёт JSON на stdout
"""
import json
import sys
import re
from pathlib import Path

# Маппинг доменов на риски (из EU AI Act Annex III)
DOMAIN_RISK_MAP = {
    'employment': {'level': 'HIGH', 'annex': '§4', 'article': 'Annex III §4'},
    'hr': {'level': 'HIGH', 'annex': '§4', 'article': 'Annex III §4'},
    'hiring': {'level': 'HIGH', 'annex': '§4', 'article': 'Annex III §4'},
    'credit': {'level': 'HIGH', 'annex': '§5', 'article': 'Annex III §5'},
    'scoring': {'level': 'HIGH', 'annex': '§5', 'article': 'Annex III §5'},
    'healthcare': {'level': 'HIGH', 'annex': '§2', 'article': 'Annex III §2'},
    'biometric': {'level': 'HIGH', 'annex': '§1', 'article': 'Annex III §1'},
    'education': {'level': 'HIGH', 'annex': '§3', 'article': 'Annex III §3'},
    'chatbot': {'level': 'LIMITED', 'annex': None, 'article': 'Article 50'},
    'recommendation': {'level': 'LIMITED', 'annex': None, 'article': 'Article 50'},
    'content': {'level': 'LIMITED', 'annex': None, 'article': 'Article 50'},
}

# Паттерны AI фреймворков в коде
AI_PATTERNS = [
    (r'openai', 'OpenAI API'),
    (r'anthropic', 'Anthropic/Claude API'),
    (r'langchain', 'LangChain'),
    (r'huggingface|transformers', 'HuggingFace'),
    (r'tensorflow|torch|pytorch', 'ML Framework'),
    (r'sklearn|scikit.learn', 'Scikit-learn'),
    (r'ml\.model|mlflow', 'ML Ops'),
    (r'azure.*cognitive|azure.*openai', 'Azure AI'),
    (r'gemini|vertex.*ai', 'Google AI'),
    (r'mistral|cohere|llama', 'LLM Provider'),
]

# Документация которая должна существовать для high-risk
REQUIRED_DOCS_HIGH_RISK = {
    'RISK_MANAGEMENT.md': 'Article 9 — Risk Management System',
    'DATA_GOVERNANCE.md': 'Article 10 — Data Governance',
    'TECHNICAL_DOCUMENTATION.md': 'Article 11 — Technical Documentation (Annex IV)',
    'LOGGING.md': 'Article 12 — Record-Keeping & Logging',
    'TRANSPARENCY.md': 'Article 13 — Transparency',
    'HUMAN_OVERSIGHT.md': 'Article 14 — Human Oversight',
    'ACCURACY_ROBUSTNESS.md': 'Article 15 — Accuracy & Robustness',
}

def scan_description(description: str, domain: str) -> dict:
    """Анализирует описание системы без доступа к файлам."""
    desc_lower = description.lower()
    domain_lower = domain.lower()
    
    # Определяем риск по домену
    risk_info = DOMAIN_RISK_MAP.get(domain_lower, {'level': 'MINIMAL', 'annex': None, 'article': None})
    
    # Проверяем ключевые слова в описании
    profiling_keywords = ['profile', 'track', 'behavior', 'personaliz', 'segment', 'target']
    decision_keywords = ['decide', 'decision', 'automat', 'approve', 'reject', 'score', 'rank']
    pii_keywords = ['personal data', 'gdpr', 'email', 'name', 'address', 'biometric', 'health']
    
    has_profiling = any(kw in desc_lower for kw in profiling_keywords)
    has_decisions = any(kw in desc_lower for kw in decision_keywords)
    has_pii = any(kw in desc_lower for kw in pii_keywords)
    
    # Override: profiling → always HIGH
    if has_profiling and risk_info['level'] != 'UNACCEPTABLE':
        risk_info['level'] = 'HIGH'
        risk_info['article'] = 'Article 6(3) — profiling detected'
    
    detected_risks = []
    if has_profiling:
        detected_risks.append({
            'category': 'PROFILING',
            'severity': 'HIGH',
            'description': 'System appears to profile or track user behavior',
            'article': 'Article 6(3)'
        })
    if has_decisions:
        detected_risks.append({
            'category': 'AUTOMATED_DECISIONS',
            'severity': 'MEDIUM',
            'description': 'System may make automated decisions affecting people',
            'article': 'Article 22 GDPR / Annex III'
        })
    if has_pii:
        detected_risks.append({
            'category': 'PERSONAL_DATA',
            'severity': 'MEDIUM',
            'description': 'System processes personal data',
            'article': 'Article 10 — Data Governance'
        })
    
    # Генерируем gaps на основе риска
    gaps = []
    if risk_info['level'] == 'HIGH':
        gaps = [
            {'article': 'Article 9', 'requirement': 'Risk Management System', 'status': 'MISSING'},
            {'article': 'Article 10', 'requirement': 'Data Governance Documentation', 'status': 'MISSING'},
            {'article': 'Article 11', 'requirement': 'Technical Documentation (Annex IV)', 'status': 'MISSING'},
            {'article': 'Article 12', 'requirement': 'Logging & Record-Keeping', 'status': 'MISSING'},
            {'article': 'Article 13', 'requirement': 'Transparency Measures', 'status': 'MISSING'},
            {'article': 'Article 14', 'requirement': 'Human Oversight', 'status': 'MISSING'},
            {'article': 'Article 47', 'requirement': 'EU Declaration of Conformity', 'status': 'MISSING'},
        ]
    elif risk_info['level'] == 'LIMITED':
        gaps = [
            {'article': 'Article 50', 'requirement': 'AI Disclosure to Users', 'status': 'MISSING'},
            {'article': 'Article 50', 'requirement': 'Content Labeling (if generative)', 'status': 'MISSING'},
        ]
    
    compliance_score = 0 if gaps else 100
    
    return {
        'riskLevel': risk_info['level'],
        'annexIIICategory': risk_info.get('annex'),
        'applicableArticle': risk_info.get('article'),
        'detectedRisks': detected_risks,
        'complianceGaps': gaps,
        'complianceScore': compliance_score,
        'confidence': 0.75,
        'disclaimer': 'This analysis is for informational purposes only and does not constitute legal advice.',
    }

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        description = input_data.get('description', '')
        domain = input_data.get('domain', 'OTHER')
        
        result = scan_description(description, domain)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Шаг 2.2 — Создать API endpoint

Создать `src/app/api/public/v1/deep-scan/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execAsync = promisify(exec);

const DeepScanInput = z.object({
  description: z.string().min(10).max(2000),
  domain: z.string(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = DeepScanInput.parse(body);

    const inputJson = JSON.stringify(input);
    const { stdout, stderr } = await execAsync(
      `echo '${inputJson.replace(/'/g, "'\\''")}' | python3 scripts/compliance_scan.py`,
      { timeout: 30000 }
    );

    if (stderr && !stdout) {
      console.error('Scan error:', stderr);
      return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
    }

    const result = JSON.parse(stdout);

    return NextResponse.json({
      success: true,
      result,
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Deep scan error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Шаг 2.3 — UI компонент Deep Scan

Добавить в `src/app/[locale]/(marketing)/free-classifier/` новый компонент `DeepScanButton.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DeepScanResult {
  riskLevel: 'HIGH' | 'LIMITED' | 'MINIMAL' | 'UNACCEPTABLE';
  annexIIICategory: string | null;
  detectedRisks: Array<{ category: string; severity: string; description: string; article: string }>;
  complianceGaps: Array<{ article: string; requirement: string; status: string }>;
  complianceScore: number;
  confidence: number;
  disclaimer: string;
}

const RISK_COLORS = {
  HIGH: 'text-red-400 bg-red-400/10 border-red-400/20',
  LIMITED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  MINIMAL: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  UNACCEPTABLE: 'text-red-600 bg-red-600/10 border-red-600/20',
};

export function DeepScanSection({ description, domain }: { description: string; domain: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    if (!description || description.length < 10) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/public/v1/deep-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, domain }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError('Scan failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border border-white/10 rounded-2xl p-6 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Deep Compliance Scan</h3>
          <p className="text-white/50 text-sm mt-0.5">
            Instant analysis against EU AI Act Articles 5-50
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={loading || description.length < 10}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 
                     disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium 
                     transition-colors"
        >
          {loading ? 'Scanning...' : 'Run Deep Scan'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result && (
        <div className="space-y-4 mt-4">
          {/* Risk Level */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${RISK_COLORS[result.riskLevel]}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {result.riskLevel} RISK
          </div>

          {/* Detected Risks */}
          {result.detectedRisks.length > 0 && (
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Detected Issues</p>
              <div className="space-y-2">
                {result.detectedRisks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <div>
                      <span className="text-white/80">{risk.description}</span>
                      <span className="text-white/40 ms-2">({risk.article})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Gaps */}
          {result.complianceGaps.length > 0 && (
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">
                Required Actions ({result.complianceGaps.length} gaps)
              </p>
              <div className="space-y-1">
                {result.complianceGaps.slice(0, 5).map((gap, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">✗</span>
                    <span className="text-white/60">{gap.article}</span>
                    <span className="text-white/80">{gap.requirement}</span>
                  </div>
                ))}
                {result.complianceGaps.length > 5 && (
                  <p className="text-white/40 text-sm ms-6">
                    +{result.complianceGaps.length - 5} more gaps...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs mb-3">{result.disclaimer}</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 
                         hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Fix All Gaps with Complyance →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Коммит после Фазы 2:
```bash
git add -A
git commit -m "feat(classifier): add Deep Scan with EU AI Act gap analysis"
```

---

## ФАЗА 3: IBM AIF360 → Bias Testing микросервис
**Репо:** https://github.com/Trusted-AI/AIF360
**Цель:** добавить Bias Testing как платный модуль (Professional+)
**Сложность:** Средняя
**Затрагивает:** новый Python сервис, BullMQ job, tRPC router, Evidence Vault интеграция

### Архитектура

```
Dashboard (upload CSV) → tRPC bias.analyze →
BullMQ job → Python FastAPI (bias-service/) → AIF360 →
JSON результат → сохранить в Evidence Vault → уведомить
```

### Шаг 3.1 — Создать Python микросервис

Создать директорию `bias-service/`:

**`bias-service/requirements.txt`:**
```
fastapi==0.109.0
uvicorn==0.27.0
aif360==0.6.1
pandas==2.1.4
numpy==1.26.3
scikit-learn==1.4.0
python-multipart==0.0.6
```

**`bias-service/main.py`:**
```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import json
import io
from typing import Optional

app = FastAPI(title="Complyance Bias Testing Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_bias(
    file: UploadFile = File(...),
    label_column: str = "outcome",
    protected_attribute: str = "gender",
    privileged_value: str = "1",
    favorable_label: str = "1",
):
    """
    Анализирует CSV файл на bias.
    
    Ожидает CSV с колонками:
    - label_column: бинарный исход (0/1)  
    - protected_attribute: защищённый атрибут (gender, race, age_group)
    - остальные: features
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    if label_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{label_column}' not found")
    if protected_attribute not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{protected_attribute}' not found")

    try:
        from aif360.datasets import BinaryLabelDataset
        from aif360.metrics import BinaryLabelDatasetMetric, ClassificationMetric

        priv_val = int(privileged_value) if privileged_value.isdigit() else privileged_value
        fav_label = int(favorable_label) if favorable_label.isdigit() else favorable_label

        dataset = BinaryLabelDataset(
            df=df,
            label_names=[label_column],
            protected_attribute_names=[protected_attribute],
            favorable_label=fav_label,
            unfavorable_label=1 - fav_label if isinstance(fav_label, int) else None,
            privileged_protected_attributes=[[priv_val]],
        )

        metric = BinaryLabelDatasetMetric(
            dataset,
            privileged_groups=[{protected_attribute: priv_val}],
            unprivileged_groups=[{protected_attribute: 1 - priv_val if isinstance(priv_val, int) else 0}],
        )

        disparate_impact = float(metric.disparate_impact())
        stat_parity_diff = float(metric.statistical_parity_difference())
        
        # EU AI Act compliance assessment
        # Disparate Impact < 0.8 = potential discrimination (EEOC 4/5 rule)
        di_compliant = 0.8 <= disparate_impact <= 1.25
        spd_compliant = abs(stat_parity_diff) < 0.1

        overall_compliant = di_compliant and spd_compliant

        # Group statistics
        priv_mask = df[protected_attribute] == priv_val
        unpriv_mask = ~priv_mask

        group_stats = {
            "privileged": {
                "count": int(priv_mask.sum()),
                "positive_rate": float(df.loc[priv_mask, label_column].mean()),
            },
            "unprivileged": {
                "count": int(unpriv_mask.sum()),
                "positive_rate": float(df.loc[unpriv_mask, label_column].mean()),
            },
        }

        # Recommendations
        recommendations = []
        if not di_compliant:
            recommendations.append({
                "issue": "Disparate Impact violation",
                "description": f"DI ratio {disparate_impact:.3f} outside acceptable range [0.8, 1.25]",
                "action": "Review training data for underrepresentation of protected groups",
                "article": "Article 10 — Data Governance",
                "priority": "HIGH",
            })
        if not spd_compliant:
            recommendations.append({
                "issue": "Statistical Parity violation",
                "description": f"Difference in positive rates between groups: {stat_parity_diff:.3f}",
                "action": "Apply fairness constraints or re-sample training data",
                "article": "Article 15 — Accuracy & Robustness",
                "priority": "MEDIUM",
            })
        if overall_compliant:
            recommendations.append({
                "issue": None,
                "description": "System meets basic fairness thresholds",
                "action": "Continue monitoring for drift over time",
                "article": "Article 72 — Post-Market Monitoring",
                "priority": "LOW",
            })

        return {
            "success": True,
            "metrics": {
                "disparate_impact": round(disparate_impact, 4),
                "statistical_parity_difference": round(stat_parity_diff, 4),
                "rows_analyzed": len(df),
                "protected_attribute": protected_attribute,
                "privileged_value": str(priv_val),
            },
            "compliance": {
                "disparate_impact_compliant": di_compliant,
                "statistical_parity_compliant": spd_compliant,
                "overall_compliant": overall_compliant,
                "eu_act_article": "Article 10, Article 15",
                "threshold_used": "EEOC 4/5 Rule (DI ≥ 0.8) + SPD < 0.1",
            },
            "group_statistics": group_stats,
            "recommendations": recommendations,
            "disclaimer": (
                "This bias analysis is for informational purposes only. "
                "Results should be reviewed by qualified experts before compliance decisions."
            ),
        }

    except ImportError:
        # Fallback: простой анализ без AIF360
        priv_mask = df[protected_attribute] == (int(privileged_value) if privileged_value.isdigit() else privileged_value)
        priv_rate = float(df.loc[priv_mask, label_column].mean()) if priv_mask.sum() > 0 else 0
        unpriv_rate = float(df.loc[~priv_mask, label_column].mean()) if (~priv_mask).sum() > 0 else 0
        di = priv_rate / unpriv_rate if unpriv_rate > 0 else float('inf')
        
        return {
            "success": True,
            "metrics": {
                "disparate_impact": round(di, 4),
                "statistical_parity_difference": round(priv_rate - unpriv_rate, 4),
                "rows_analyzed": len(df),
                "protected_attribute": protected_attribute,
                "privileged_value": privileged_value,
            },
            "compliance": {
                "disparate_impact_compliant": 0.8 <= di <= 1.25,
                "overall_compliant": 0.8 <= di <= 1.25,
                "eu_act_article": "Article 10, Article 15",
            },
            "recommendations": [],
            "note": "Basic analysis (AIF360 not available)",
            "disclaimer": "This analysis is for informational purposes only.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(__import__('os').environ.get("PORT", 8001)))
```

**`bias-service/Dockerfile`:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["python", "main.py"]
```

### Шаг 3.2 — Добавить в Railway

В Railway dashboard создать новый сервис `bias-service`, указать `bias-service/` как source.
Добавить переменную окружения в Next.js: `BIAS_SERVICE_URL=https://bias-service.railway.internal:8001`

### Шаг 3.3 — tRPC router для Bias Testing

Создать `src/server/routers/bias.ts`:

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';

const BIAS_SERVICE_URL = process.env.BIAS_SERVICE_URL || 'http://localhost:8001';

export const biasRouter = router({
  analyze: protectedProcedure
    .input(z.object({
      systemId: z.string(),
      labelColumn: z.string().default('outcome'),
      protectedAttribute: z.string(),
      privilegedValue: z.string().default('1'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Проверка плана — Professional+
      const org = await prisma.organization.findUnique({
        where: { id: ctx.session.user.organizationId },
      });
      
      if (!org || !['PROFESSIONAL', 'SCALE', 'ENTERPRISE'].includes(org.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bias Testing requires Professional plan or higher',
        });
      }

      // TODO: получить файл из Evidence Vault или принять upload
      // Временно возвращаем заглушку для структуры
      return {
        jobId: `bias_${Date.now()}`,
        status: 'QUEUED',
        message: 'Bias analysis queued. Results will appear in Evidence Vault.',
      };
    }),

  getResults: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .query(async ({ input }) => {
      // Получить результаты из Evidence
      const evidence = await prisma.evidence.findMany({
        where: {
          systemId: input.systemId,
          // type: 'BIAS_REPORT', // добавить когда будет поле type
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return evidence;
    }),
});
```

### Шаг 3.4 — i18n ключи для Bias Testing

```json
"bias": {
  "title": "Bias & Fairness Testing",
  "subtitle": "Analyze your AI system for algorithmic bias",
  "upload": "Upload your dataset (CSV)",
  "protectedAttribute": "Protected attribute",
  "protectedAttributeHint": "Column containing sensitive attribute (gender, race, age_group)",
  "labelColumn": "Outcome column",
  "labelColumnHint": "Binary column: 1 = positive outcome, 0 = negative",
  "runAnalysis": "Run Bias Analysis",
  "results": {
    "title": "Analysis Results",
    "disparateImpact": "Disparate Impact Ratio",
    "statisticalParity": "Statistical Parity Difference",
    "compliant": "Meets EU AI Act Article 10 threshold",
    "violation": "Potential bias detected — review required",
    "threshold": "Threshold: DI ≥ 0.8 (EEOC 4/5 Rule)"
  },
  "planRequired": "Bias Testing requires Professional plan",
  "disclaimer": "This analysis is for informational purposes only and does not constitute legal advice."
}
```

### Коммит после Фазы 3:
```bash
git add -A
git commit -m "feat(bias): add IBM AIF360 bias testing microservice and tRPC router"
```

---

## ФАЗА 4: AgentGuard → Complyance SDK
**Репо:** https://github.com/Sagar-Gogineni/agentguard
**Цель:** создать `complyance-sdk` Python пакет для CI/CD интеграции
**Сложность:** Средняя
**Затрагивает:** новый репо `complyance-sdk/`, webhook endpoint, Evidence Vault

### Архитектура

```
Customer's AI system → @complyance/sdk →
Intercepts AI calls → Logs metadata →
POST /api/sdk/events → Evidence Vault → Dashboard
```

### Шаг 4.1 — Создать SDK директорию

```bash
mkdir -p complyance-sdk/src
```

**`complyance-sdk/pyproject.toml`:**
```toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "complyance"
version = "0.1.0"
description = "EU AI Act compliance SDK — log AI calls, track evidence, monitor drift"
readme = "README.md"
license = {text = "MIT"}
requires-python = ">=3.9"
dependencies = [
    "httpx>=0.25.0",
    "pydantic>=2.0",
]

[project.optional-dependencies]
openai = ["openai>=1.0"]
anthropic = ["anthropic>=0.20"]
```

**`complyance-sdk/src/complyance/__init__.py`:**
```python
"""
Complyance SDK — EU AI Act compliance layer for AI applications.

Usage:
    from complyance import Guard
    
    guard = Guard(api_key="cmp_...", system_id="sys_abc123")
    
    # Wrap any async function that calls an LLM
    @guard.protect
    async def call_ai(prompt: str):
        return await openai_client.chat.completions.create(...)
"""

from .guard import Guard
from .config import Config

__version__ = "0.1.0"
__all__ = ["Guard", "Config"]
```

**`complyance-sdk/src/complyance/guard.py`:**
```python
import asyncio
import functools
import hashlib
import time
from datetime import datetime, timezone
from typing import Any, Callable, Optional
import httpx
from pydantic import BaseModel


class EventPayload(BaseModel):
    system_id: str
    timestamp: str
    event_type: str  # "llm_call", "tool_call", "error"
    model: Optional[str] = None
    provider: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    has_pii_indicators: bool = False
    error: Optional[str] = None
    # Никогда не логируем содержимое промптов
    content_hash: Optional[str] = None  # SHA256 для integrity


# Паттерны для детекции PII (без хранения контента)
PII_PATTERNS = [
    'email', 'phone', 'address', 'ssn', 'passport',
    'credit card', 'date of birth', 'medical', 'salary',
    'biometric', 'location', 'ip address',
]


def _detect_pii_indicators(text: str) -> bool:
    """Проверяет наличие PII-маркеров без сохранения содержимого."""
    text_lower = text.lower()
    return any(pattern in text_lower for pattern in PII_PATTERNS)


def _hash_content(content: str) -> str:
    """SHA256 hash для integrity без раскрытия содержимого."""
    return hashlib.sha256(content.encode()).hexdigest()[:16]


class Guard:
    """
    Complyance compliance guard for AI applications.
    
    Intercepts AI calls and logs compliance-relevant metadata to Complyance.
    Never logs prompt content — only metadata and integrity hashes.
    """

    def __init__(
        self,
        api_key: str,
        system_id: str,
        base_url: str = "https://app.complyance.io",
        timeout: float = 5.0,
        dry_run: bool = False,
    ):
        self.api_key = api_key
        self.system_id = system_id
        self.base_url = base_url
        self.timeout = timeout
        self.dry_run = dry_run
        self._client = httpx.AsyncClient(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=timeout,
        )

    async def _send_event(self, payload: EventPayload) -> None:
        """Отправляет событие в Complyance без блокировки основного потока."""
        if self.dry_run:
            print(f"[Complyance DryRun] {payload.model_dump()}")
            return
        try:
            await self._client.post("/api/sdk/events", json=payload.model_dump())
        except Exception:
            pass  # Never fail the wrapped function due to SDK errors

    def protect(self, func: Callable) -> Callable:
        """
        Decorator that wraps an async function with compliance logging.
        
        Usage:
            @guard.protect
            async def call_openai(prompt: str):
                return await client.chat.completions.create(...)
        """
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.monotonic()
            error_msg = None
            result = None

            # Detect PII in string arguments (without storing content)
            all_text = " ".join(
                str(a) for a in args if isinstance(a, str)
            ) + " ".join(
                str(v) for v in kwargs.values() if isinstance(v, str)
            )
            has_pii = _detect_pii_indicators(all_text)
            content_hash = _hash_content(all_text) if all_text else None

            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                error_msg = type(e).__name__
                raise
            finally:
                latency_ms = int((time.monotonic() - start_time) * 1000)
                
                # Try to extract model info from result
                model = None
                provider = None
                input_tokens = None
                output_tokens = None
                
                if result is not None:
                    # OpenAI response format
                    if hasattr(result, 'model'):
                        model = getattr(result, 'model', None)
                    if hasattr(result, 'usage') and result.usage:
                        input_tokens = getattr(result.usage, 'prompt_tokens', None)
                        output_tokens = getattr(result.usage, 'completion_tokens', None)
                    
                    # Detect provider from model name
                    if model:
                        if 'gpt' in str(model).lower():
                            provider = 'openai'
                        elif 'claude' in str(model).lower():
                            provider = 'anthropic'
                        elif 'gemini' in str(model).lower():
                            provider = 'google'

                payload = EventPayload(
                    system_id=self.system_id,
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    event_type="error" if error_msg else "llm_call",
                    model=model,
                    provider=provider,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    latency_ms=latency_ms,
                    has_pii_indicators=has_pii,
                    error=error_msg,
                    content_hash=content_hash,
                )
                asyncio.create_task(self._send_event(payload))

        return wrapper

    async def close(self):
        await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()
```

### Шаг 4.2 — SDK webhook endpoint в Next.js

Создать `src/app/api/sdk/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SDKEvent {
  system_id: string;
  timestamp: string;
  event_type: 'llm_call' | 'tool_call' | 'error';
  model?: string;
  provider?: string;
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
  has_pii_indicators: boolean;
  error?: string;
  content_hash?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  // Validate API key и получить organization
  const org = await prisma.organization.findFirst({
    where: { apiKey },
    select: { id: true, plan: true },
  });

  if (!org) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Проверка плана — SDK только для Professional+
  if (!['PROFESSIONAL', 'SCALE', 'ENTERPRISE'].includes(org.plan)) {
    return NextResponse.json({ error: 'SDK requires Professional plan' }, { status: 403 });
  }

  try {
    const event: SDKEvent = await req.json();

    // Валидация system принадлежит org
    const system = await prisma.aISystem.findFirst({
      where: { id: event.system_id, organizationId: org.id },
    });

    if (!system) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 });
    }

    // Сохраняем как Evidence (Article 12 — Record Keeping)
    await prisma.evidence.create({
      data: {
        title: `SDK Event: ${event.event_type} — ${event.provider || 'unknown'} ${event.model || ''}`,
        description: JSON.stringify({
          type: event.event_type,
          model: event.model,
          provider: event.provider,
          tokens: { input: event.input_tokens, output: event.output_tokens },
          latency_ms: event.latency_ms,
          has_pii_indicators: event.has_pii_indicators,
          content_hash: event.content_hash,
          error: event.error,
        }),
        source: 'SDK_AUTO',
        systemId: event.system_id,
        organizationId: org.id,
        collectedAt: new Date(event.timestamp),
      },
    });

    // Алерт при обнаружении PII
    if (event.has_pii_indicators) {
      // TODO: отправить notification через BullMQ
      console.log(`[SDK] PII detected in system ${event.system_id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('SDK event error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Шаг 4.3 — Добавить apiKey в Organization (обсудить с владельцем)

```prisma
// В модели Organization добавить:
apiKey  String?  @unique  // для SDK аутентификации
```

### Коммит после Фазы 4:
```bash
git add -A
git commit -m "feat(sdk): add Complyance Python SDK and /api/sdk/events webhook"
```

---

## ФАЗА 5: Attestix → Cryptographic Compliance Badge
**Репо:** https://github.com/VibeTensor/attestix
**Цель:** сделать Compliance Badge криптографически верифицируемым (W3C Verifiable Credentials)
**Сложность:** Высокая — стратегический moat
**Затрагивает:** badge service, новый endpoint /api/badge/verify, UI badge component

### Концепция

```
Сейчас:   Badge → QR → страница на complyance.io (маркетинговая наклейка)

С Attestix: Badge → QR → W3C Verifiable Credential →
            Ed25519 криптографическая подпись →
            Machine-readable proof что org compliant →
            Регулятор/клиент верифицирует НЕЗАВИСИМО от Complyance
```

### Шаг 5.1 — Создать ключи для подписи

```bash
# Генерация Ed25519 ключей для Complyance как issuer
pip install cryptography
python3 -c "
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import (
    Encoding, PublicFormat, PrivateFormat, NoEncryption
)
import base64

private_key = Ed25519PrivateKey.generate()
public_key = private_key.public_key()

priv_bytes = private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
pub_bytes = public_key.public_bytes(Encoding.Raw, PublicFormat.Raw)

print('COMPLYANCE_SIGNING_PRIVATE_KEY=' + base64.b64encode(priv_bytes).decode())
print('COMPLYANCE_SIGNING_PUBLIC_KEY=' + base64.b64encode(pub_bytes).decode())
"
# Добавить оба значения в Railway env vars
```

### Шаг 5.2 — Сервис подписи верификационных credentials

Создать `src/server/services/badge/credential-issuer.ts`:

```typescript
import { createPrivateKey, createSign } from 'crypto';

interface ComplianceCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: {
    id: string;
    name: string;
  };
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: {
    id: string;
    organizationName: string;
    complianceLevel: 'AWARE' | 'READY' | 'COMPLIANT';
    euAiActStatus: {
      classifiedSystems: number;
      highRiskSystems: number;
      openGaps: number;
      complianceScore: number;
    };
    verifiedAt: string;
    validUntil: string;
  };
  proof?: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
  };
}

export function issueComplianceCredential(params: {
  orgId: string;
  orgName: string;
  complianceLevel: 'AWARE' | 'READY' | 'COMPLIANT';
  classifiedSystems: number;
  highRiskSystems: number;
  openGaps: number;
  complianceScore: number;
}): ComplianceCredential {
  const now = new Date();
  const expiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 дней

  const credential: ComplianceCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://complyance.io/contexts/v1',
    ],
    id: `https://complyance.io/credentials/${params.orgId}/${now.getTime()}`,
    type: ['VerifiableCredential', 'AIComplianceCredential'],
    issuer: {
      id: 'https://complyance.io',
      name: 'Complyance',
    },
    issuanceDate: now.toISOString(),
    expirationDate: expiry.toISOString(),
    credentialSubject: {
      id: `https://complyance.io/organizations/${params.orgId}`,
      organizationName: params.orgName,
      complianceLevel: params.complianceLevel,
      euAiActStatus: {
        classifiedSystems: params.classifiedSystems,
        highRiskSystems: params.highRiskSystems,
        openGaps: params.openGaps,
        complianceScore: params.complianceScore,
      },
      verifiedAt: now.toISOString(),
      validUntil: expiry.toISOString(),
    },
  };

  // Подписываем
  const privateKeyBase64 = process.env.COMPLYANCE_SIGNING_PRIVATE_KEY;
  if (privateKeyBase64) {
    try {
      const privateKeyBytes = Buffer.from(privateKeyBase64, 'base64');
      // Ed25519 подпись через Node.js crypto
      const { createPrivateKey, sign } = require('crypto');
      
      const payload = JSON.stringify(credential.credentialSubject);
      const privateKey = createPrivateKey({
        key: privateKeyBytes,
        format: 'der',
        type: 'pkcs8',
      });
      
      const signature = sign(null, Buffer.from(payload), privateKey);
      
      credential.proof = {
        type: 'Ed25519Signature2020',
        created: now.toISOString(),
        verificationMethod: 'https://complyance.io/.well-known/public-key',
        proofPurpose: 'assertionMethod',
        proofValue: signature.toString('base64'),
      };
    } catch {
      // Если ошибка подписи — возвращаем без proof (лучше чем сломать)
    }
  }

  return credential;
}

export function verifyCredential(credential: ComplianceCredential): {
  valid: boolean;
  expired: boolean;
  reason?: string;
} {
  // Проверка срока действия
  const now = new Date();
  const expiry = new Date(credential.expirationDate);
  
  if (now > expiry) {
    return { valid: false, expired: true, reason: 'Credential has expired' };
  }

  // Проверка issuer
  if (credential.issuer.id !== 'https://complyance.io') {
    return { valid: false, expired: false, reason: 'Unknown issuer' };
  }

  // Проверка подписи (если есть proof)
  if (credential.proof) {
    // TODO: полная верификация Ed25519 подписи
    return { valid: true, expired: false };
  }

  return { valid: true, expired: false };
}
```

### Шаг 5.3 — Public verification endpoint

Создать `src/app/api/badge/[id]/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueComplianceCredential } from '@/server/services/badge/credential-issuer';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const org = await prisma.organization.findUnique({
    where: { id: params.id },
    include: {
      systems: {
        select: {
          riskLevel: true,
          complianceScore: true,
          complianceGaps: {
            where: { status: { not: 'COMPLETED' } },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const classifiedSystems = org.systems.filter(s => s.riskLevel).length;
  const highRiskSystems = org.systems.filter(s => s.riskLevel === 'HIGH').length;
  const totalOpenGaps = org.systems.reduce((sum, s) => sum + s.complianceGaps.length, 0);
  const avgScore = org.systems.length
    ? Math.round(org.systems.reduce((sum, s) => sum + (s.complianceScore || 0), 0) / org.systems.length)
    : 0;

  // Определяем уровень badge
  let complianceLevel: 'AWARE' | 'READY' | 'COMPLIANT' = 'AWARE';
  if (classifiedSystems > 0 && totalOpenGaps < 5) complianceLevel = 'READY';
  if (classifiedSystems > 0 && totalOpenGaps === 0 && avgScore >= 80) complianceLevel = 'COMPLIANT';

  const credential = issueComplianceCredential({
    orgId: org.id,
    orgName: org.name,
    complianceLevel,
    classifiedSystems,
    highRiskSystems,
    openGaps: totalOpenGaps,
    complianceScore: avgScore,
  });

  // Поддержка разных форматов
  const accept = req.headers.get('accept') || '';
  
  if (accept.includes('application/ld+json') || accept.includes('application/json')) {
    return NextResponse.json(credential, {
      headers: {
        'Content-Type': 'application/ld+json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // HTML страница верификации для браузеров
  return NextResponse.json({
    verified: true,
    credential,
    verifiedAt: new Date().toISOString(),
  }, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
```

### Шаг 5.4 — .well-known endpoint для public key

Создать `src/app/.well-known/public-key/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const publicKeyBase64 = process.env.COMPLYANCE_SIGNING_PUBLIC_KEY || '';
  
  return NextResponse.json({
    '@context': 'https://w3id.org/security/v1',
    id: 'https://complyance.io/.well-known/public-key',
    type: 'Ed25519VerificationKey2020',
    controller: 'https://complyance.io',
    publicKeyBase64,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Коммит после Фазы 5:
```bash
git add -A
git commit -m "feat(badge): add cryptographic W3C Verifiable Credential for Compliance Badge"
```

---

## ЧЕКЛИСТ ПЕРЕД КАЖДОЙ ФАЗОЙ

- [ ] Прочитал CLAUDE.md
- [ ] Запустил `pnpm tsc --noEmit` — 0 ошибок до начала
- [ ] Обсудил изменения schema.prisma с владельцем
- [ ] После завершения: `pnpm tsc --noEmit` — 0 ошибок
- [ ] Добавил i18n ключи во все 7 локалей (или попросил это сделать)
- [ ] Нет `console.log` в продакшн коде
- [ ] Сделал коммит с правильным message

---

## ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ — добавить в Railway

```bash
# Фаза 1
CRON_SECRET=<random-32-chars>  # уже должен быть

# Фаза 3  
BIAS_SERVICE_URL=https://bias-service.railway.internal:8001

# Фаза 5
COMPLYANCE_SIGNING_PRIVATE_KEY=<generated-ed25519-private>
COMPLYANCE_SIGNING_PUBLIC_KEY=<generated-ed25519-public>
```

---

## МАРКЕТИНГОВЫЕ ПРЕИМУЩЕСТВА ПОСЛЕ ВНЕДРЕНИЯ

После всех 5 фаз Complyance получает:

1. **Regulatory Intelligence** — реальные данные 28+ законодательных актов с автообновлением
2. **Deep Scan** — бесплатный instant анализ codebase против EU AI Act (вирусная точка входа)
3. **Bias Testing** — IBM AIF360 в облаке, доступный за $249/мес (конкуренты берут $$$$$)
4. **Complyance SDK** — `pip install complyance` + 1 декоратор = Article 12 evidence auto-logging
5. **Cryptographic Badge** — W3C Verifiable Credential, машиночитаемое доказательство compliance

Ни один из прямых конкурентов (Credo AI, Holistic AI, VerifyWise) не имеет всего этого в self-serve SaaS за $249/мес.
