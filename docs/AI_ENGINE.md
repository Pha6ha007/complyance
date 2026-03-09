# AI_ENGINE.md — Classification Engine & LLM Integration

## Overview

The classification engine determines the risk level of AI systems under multiple regulatory frameworks. It uses a hybrid approach: rule-based pre-filtering, LLM analysis, and rule-based validation.

## Classification Pipeline

```
Input → Pre-Filter (rules) → LLM Analysis (Claude) → Validation (rules) → Multi-Reg Mapping → Output
```

## Step 1: Rule-Based Pre-Filter

These rules execute BEFORE any LLM call. They catch obvious cases and reduce API costs.

### Hard Rules (override everything)

```ts
// ALWAYS high-risk, no LLM needed
if (system.profilesUsers === true) {
  return { riskLevel: 'HIGH', reason: 'AI Act Article 6(3): profiling always triggers high-risk' };
}

// ALWAYS unacceptable risk
if (system.domain === 'SOCIAL_SCORING' && system.endUsers.includes('GOVERNMENT')) {
  return { riskLevel: 'UNACCEPTABLE', reason: 'AI Act Article 5: social scoring by public authorities is prohibited' };
}

// Skip EU classification if no EU market
if (!system.markets.includes('EU')) {
  skipEUClassification = true;
}

// Likely minimal risk (fast path)
if (!system.makesDecisions && !system.processesPersonalData && !system.profilesUsers
    && !HIGH_RISK_DOMAINS.includes(system.domain)) {
  return { riskLevel: 'MINIMAL', reason: 'System does not make decisions, process personal data, or profile users' };
}
```

### Domain Hints (sent to LLM as context)

```ts
const HIGH_RISK_DOMAINS = [
  'BIOMETRICS', 'CRITICAL_INFRASTRUCTURE', 'EDUCATION',
  'EMPLOYMENT', 'ESSENTIAL_SERVICES', 'LAW_ENFORCEMENT',
  'MIGRATION', 'JUSTICE'
];

const LIMITED_RISK_INDICATORS = [
  'CHATBOT', 'CONTENT_GENERATION', 'TRANSLATION',
  'RECOMMENDATION_NON_ESSENTIAL'
];
```

## Step 2: LLM Classification (Claude Sonnet)

### API Call Configuration

```ts
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2000,
  temperature: 0,    // CRITICAL: deterministic output
  system: CLASSIFICATION_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: buildClassificationPrompt(system) }]
});
```

### System Prompt (abridged — full version in src/server/ai/prompts/classification.ts)

```
You are an EU AI Act classification expert. Your task is to classify an AI system
according to the EU AI Act (Regulation 2024/1689).

## Classification Framework

### Risk Levels
1. UNACCEPTABLE — Prohibited practices (Article 5)
2. HIGH — Listed in Annex III or safety component (Article 6)
3. LIMITED — Transparency obligations only (Article 50)
4. MINIMAL — No specific obligations

### Annex III Categories (High-Risk)
1. Biometrics (Article 6(2), Annex III §1)
   - Remote biometric identification
   - Biometric categorisation by sensitive attributes
   - Emotion recognition
   
2. Critical Infrastructure (Annex III §2)
   - Safety components in digital infrastructure, road traffic, water, gas, heating, electricity
   
3. Education & Vocational Training (Annex III §3)
   - Determining access/admission to institutions
   - Evaluating learning outcomes
   - Assessing appropriate education level
   - Monitoring prohibited behavior during tests
   
4. Employment & Worker Management (Annex III §4)
   - Recruitment, CV screening
   - Job advertisements targeting
   - Application evaluation, filtering, assessment
   - Performance evaluation, promotions, termination
   - Task allocation based on behavior/traits
   - Monitoring/evaluation of work performance
   
5. Essential Services (Annex III §5)
   - Credit scoring
   - Life/health insurance risk assessment
   - Public assistance eligibility
   - Emergency call classification
   - Emergency service dispatch priority
   
6. Law Enforcement (Annex III §6)
   [detailed subcategories]
   
7. Migration, Asylum, Border Control (Annex III §7)
   [detailed subcategories]
   
8. Justice & Democratic Processes (Annex III §8)
   [detailed subcategories]

### Exceptions (Article 6(3))
An Annex III system is NOT high-risk if ALL of these apply:
- Does not perform profiling (profiling = ALWAYS high-risk)
- AND meets ONE of:
  a) Performs narrow procedural task (admin function, no decision influence)
  b) Improves result of previously completed human activity
  c) Detects decision-making patterns for human review only
  d) Performs preparatory task without filtering/recommending

### Limited Risk Systems (Article 50)
- Chatbots: must disclose AI usage to users
- Deepfakes: must label generated/manipulated content
- Emotion recognition: must inform subjects
- Biometric categorisation: must inform subjects

## Output Format
Respond ONLY with valid JSON:
{
  "riskLevel": "HIGH" | "LIMITED" | "MINIMAL" | "UNACCEPTABLE",
  "annexIIICategory": "§1" | "§2" | ... | "§8" | null,
  "annexIIISubcategory": "string description" | null,
  "exceptionApplies": boolean,
  "exceptionReason": "string" | null,
  "providerOrDeployer": "PROVIDER" | "DEPLOYER" | "BOTH",
  "reasoning": "Step-by-step explanation referencing specific articles",
  "confidenceScore": 0.0-1.0,
  "transparencyObligations": ["list of applicable Article 50 obligations"]
}
```

### User Prompt Template

```ts
function buildClassificationPrompt(system: AISystemInput): string {
  return `
Classify the following AI system:

**Name:** ${system.name}
**Description:** ${system.description}
**AI Type:** ${system.aiType}
**Domain:** ${system.domain}
**Makes decisions affecting people:** ${system.makesDecisions}
**Processes personal data:** ${system.processesPersonalData}
**Profiles users:** ${system.profilesUsers}
**End users:** ${system.endUsers.join(', ')}
**Markets:** ${system.markets.join(', ')}

${system.additionalContext ? `**Additional context:** ${system.additionalContext}` : ''}

Classify this system step by step. First check prohibited practices (Article 5),
then check Annex III categories, then check exceptions (Article 6.3),
then determine transparency obligations (Article 50).
`;
}
```

## Step 3: Rule-Based Validation

After LLM response, validate:

```ts
function validateClassification(input: AISystemInput, llmResult: ClassificationResult): ClassificationResult {
  // 1. Validate riskLevel is valid enum
  if (!['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'].includes(llmResult.riskLevel)) {
    throw new ClassificationError('Invalid risk level from LLM');
  }

  // 2. If HIGH, must have annexIIICategory
  if (llmResult.riskLevel === 'HIGH' && !llmResult.annexIIICategory) {
    // Try to infer from reasoning, or flag for review
  }

  // 3. Override: profiling = always HIGH
  if (input.profilesUsers && llmResult.riskLevel !== 'HIGH' && llmResult.riskLevel !== 'UNACCEPTABLE') {
    llmResult.riskLevel = 'HIGH';
    llmResult.reasoning += ' [OVERRIDE: Profiling detected — Article 6(3) mandates high-risk classification]';
  }

  // 4. Validate annexIIICategory is valid (§1 through §8)
  if (llmResult.annexIIICategory && !VALID_ANNEX_III_CATEGORIES.includes(llmResult.annexIIICategory)) {
    // Flag for review
  }

  // 5. Low confidence → flag for manual review
  if (llmResult.confidenceScore < 0.7) {
    llmResult.flaggedForReview = true;
  }

  return llmResult;
}
```

## Step 4: Multi-Regulation Mapping

After EU AI Act classification, map to additional frameworks:

```ts
function mapToAdditionalRegulations(system: AISystemInput, euResult: ClassificationResult) {
  const regulations = [];

  // Colorado AI Act
  if (system.markets.includes('US')) {
    regulations.push(classifyColorado(system));
    // Colorado focuses on "consequential decisions" in employment, finance, housing, insurance, education
  }

  // NYC Local Law 144
  if (system.markets.includes('US') && system.domain === 'EMPLOYMENT') {
    regulations.push(classifyNYCLL144(system));
    // Requires annual bias audit for automated employment decision tools
  }

  // NIST AI RMF
  regulations.push(mapToNISTRMF(system, euResult));
  // Maps EU risk level to NIST risk categories

  // UAE
  if (system.markets.includes('UAE')) {
    regulations.push(classifyUAE(system));
  }

  return regulations;
}
```

## Gap Analysis Generation

Based on classification result, generate compliance gaps:

```ts
function generateGaps(system: AISystem, classification: ClassificationResult): ComplianceGap[] {
  if (classification.riskLevel === 'HIGH') {
    return [
      { article: 'Article 9', requirement: 'Risk Management System', priority: 'CRITICAL' },
      { article: 'Article 10', requirement: 'Data Governance', priority: 'CRITICAL' },
      { article: 'Article 11', requirement: 'Technical Documentation (Annex IV)', priority: 'CRITICAL' },
      { article: 'Article 12', requirement: 'Record-Keeping & Logging', priority: 'HIGH' },
      { article: 'Article 13', requirement: 'Transparency & Info for Deployers', priority: 'HIGH' },
      { article: 'Article 14', requirement: 'Human Oversight Measures', priority: 'HIGH' },
      { article: 'Article 15', requirement: 'Accuracy, Robustness, Cybersecurity', priority: 'HIGH' },
      { article: 'Article 47', requirement: 'EU Declaration of Conformity', priority: 'CRITICAL' },
      { article: 'Article 49', requirement: 'Registration in EU Database', priority: 'CRITICAL' },
      { article: 'Article 72', requirement: 'Post-Market Monitoring Plan', priority: 'MEDIUM' },
    ];
  }

  if (classification.riskLevel === 'LIMITED') {
    return classification.transparencyObligations.map(obligation => ({
      article: 'Article 50',
      requirement: obligation,
      priority: 'MEDIUM'
    }));
  }

  return []; // MINIMAL — no specific gaps
}
```

## Compliance Score Calculation

```ts
function calculateComplianceScore(gaps: ComplianceGap[]): number {
  if (gaps.length === 0) return 100;

  const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const statusMultiplier = { COMPLETED: 1, IN_PROGRESS: 0.5, NOT_STARTED: 0 };

  let totalWeight = 0;
  let achievedWeight = 0;

  for (const gap of gaps) {
    const weight = weights[gap.priority];
    totalWeight += weight;
    achievedWeight += weight * statusMultiplier[gap.status];
  }

  return Math.round((achievedWeight / totalWeight) * 100);
}
```

## Vendor Risk Scoring

```ts
function calculateVendorRiskScore(vendor: VendorAssessment): number {
  let score = 100; // Start at 100, deduct for risks

  if (vendor.dataUsedForTraining === true) score -= 25;
  if (vendor.dataUsedForTraining === null) score -= 15; // Unknown = risk

  if (vendor.dataProcessingLocation === 'US' && markets.includes('EU')) score -= 15;
  if (vendor.dataProcessingLocation === null) score -= 20;

  if (!vendor.hasDPA) score -= 20;
  if (!vendor.hasModelCard) score -= 10;
  if (!vendor.supportsAIAct) score -= 10;
  if (vendor.supportsAIAct === null) score -= 5;

  // Subprocessor risk
  if (vendor.usesSubprocessors && !vendor.subprocessorsDocumented) score -= 15;

  return Math.max(0, score);
}
```

## Error Handling

```ts
// If LLM call fails, retry up to 3 times with exponential backoff
// If all retries fail, mark classification as PENDING_MANUAL_REVIEW
// Never show an incorrect classification — prefer "needs review" over wrong answer

// If LLM returns invalid JSON, attempt to extract from text
// If extraction fails, retry with explicit JSON-only instruction
```

## Testing

Classification engine must have comprehensive tests:

```ts
// tests/classification/known-cases.test.ts
// Test against known examples from EU AI Commission guidance

describe('Classification Engine', () => {
  test('HR recruitment tool → HIGH (Annex III §4)', async () => {
    const result = await classify({
      domain: 'EMPLOYMENT',
      description: 'AI tool that screens CVs and ranks candidates',
      makesDecisions: true,
      processesPersonalData: true,
    });
    expect(result.riskLevel).toBe('HIGH');
    expect(result.annexIIICategory).toBe('§4');
  });

  test('Website chatbot → LIMITED', async () => {
    const result = await classify({
      domain: 'CUSTOMER_SERVICE',
      description: 'Chatbot that answers FAQs on website',
      makesDecisions: false,
      processesPersonalData: false,
    });
    expect(result.riskLevel).toBe('LIMITED');
  });

  test('Profiling always → HIGH regardless of domain', async () => {
    const result = await classify({
      domain: 'CONTENT_GENERATION',
      description: 'Content recommendation engine',
      profilesUsers: true,
    });
    expect(result.riskLevel).toBe('HIGH');
  });
});
```
