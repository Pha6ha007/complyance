# ADDITION TO CLAUDE.md — Document Upload & AI Analysis

## Куда добавить: после секции "Key Workflows" → новый workflow "5. Document-Assisted Classification"

---

## Document Upload & AI-Powered Analysis

### Overview

Users can upload product documentation (technical docs, README, API docs, privacy policy, terms of service, model cards, architecture docs) and the platform automatically extracts AI-relevant information to pre-fill the classification wizard. This reduces human error and catches risks the founder might not recognize.

### Supported File Types

- PDF (.pdf) — privacy policies, legal docs, compliance reports
- Word (.docx) — technical documentation
- Markdown (.md) — README, API docs, architecture docs
- Plain text (.txt) — any text documentation
- Max file size: 10MB per file, up to 5 files per classification

### Workflow: Document-Assisted Classification

```
User clicks "Add AI System" → Option: "Fill manually" OR "Upload documents" →
User uploads 1-5 files → Files stored in S3/R2 (encrypted at rest) →
Claude API extracts AI-relevant information from documents →
Platform pre-fills wizard steps 1-4 with extracted data →
User reviews, corrects if needed, confirms →
Classification runs as normal (rules → LLM → validation)
```

### Document Analysis (Claude API)

```ts
// src/server/services/documents/analyzer.ts

interface DocumentAnalysisResult {
  systemName: string | null;
  description: string | null;
  aiType: AIType | null;              // ML_MODEL, LLM, RULE_BASED, HYBRID
  domain: string | null;              // HR, FINANCE, HEALTHCARE, etc.
  makesDecisions: boolean | null;
  processesPersonalData: boolean | null;
  profilesUsers: boolean | null;
  endUsers: string[];                 // B2C, B2B, EMPLOYEES, GOVERNMENT
  markets: string[];                  // EU, US, UAE
  detectedRisks: DetectedRisk[];      // Risks found in documents
  extractedQuotes: ExtractedQuote[];  // Exact quotes as evidence
  confidence: number;                 // 0-1 how confident the analysis is
}

interface DetectedRisk {
  category: string;        // "PROFILING", "PERSONAL_DATA", "AUTOMATED_DECISIONS"
  description: string;     // What was found
  sourceFile: string;      // Which document
  quote: string;           // Exact text from document
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ExtractedQuote {
  text: string;            // Exact quote from document
  sourceFile: string;
  relevance: string;       // Why this quote matters for classification
}
```

### LLM Prompt for Document Analysis

```ts
// src/server/ai/prompts/document-analysis.ts

const DOCUMENT_ANALYSIS_PROMPT = `
You are an EU AI Act compliance analyst. Analyze the following product documentation 
and extract all information relevant to AI risk classification.

Focus on finding:
1. What type of AI/ML is used (models, algorithms, LLMs, rule-based systems)
2. What domain the AI operates in (HR, finance, healthcare, education, etc.)
3. Whether the system makes or influences decisions affecting people
4. Whether personal data is processed (names, emails, behavior, biometrics)
5. Whether users are profiled (behavior tracking, personalization, scoring)
6. Who the end users are (consumers, businesses, employees, government)
7. Which markets the product serves (look for mentions of EU, GDPR, specific countries)

CRITICAL: Look for hidden risks the company might not be aware of:
- "personalized experience" or "recommendations" = likely profiling
- "automated scoring" or "ranking" = likely automated decisions
- "user behavior" or "analytics" = likely personal data processing
- "screening" or "filtering candidates" = employment AI (high-risk)
- Any mention of biometrics, facial recognition, emotion detection

For each finding, provide the EXACT QUOTE from the document as evidence.

Respond ONLY with valid JSON matching the DocumentAnalysisResult schema.
`;
```

### File Storage & Security

```ts
// src/server/services/documents/storage.ts

// Files are stored in S3/R2 with:
// - Server-side encryption (AES-256)
// - Unique key per organization: documents/{orgId}/{systemId}/{filename}
// - Presigned URLs for upload (expire in 15 minutes)
// - Presigned URLs for download (expire in 1 hour)
// - Files are NEVER publicly accessible
// - Retention: files kept as long as subscription is active
// - On account deletion: files deleted within 30 days (with grace period for reactivation)
```

### Database Models (add to schema.prisma)

```prisma
model SystemDocument {
  id            String   @id @default(cuid())
  fileName      String   // Original file name
  fileType      String   // pdf, docx, md, txt
  fileSize      Int      // Bytes
  fileUrl       String   // S3/R2 URL (encrypted)
  
  // Analysis results
  analysisStatus AnalysisStatus @default(PENDING) // PENDING, ANALYZING, COMPLETED, FAILED
  analysisResult Json?    // DocumentAnalysisResult as JSON
  detectedRisks  Json?    // DetectedRisk[] as JSON
  analyzedAt     DateTime?
  
  // Relations
  systemId      String
  system        AISystem @relation(fields: [systemId], references: [id], onDelete: Cascade)
  organizationId String
  
  createdAt     DateTime @default(now())
  
  @@index([systemId])
  @@index([organizationId])
}

enum AnalysisStatus { PENDING, ANALYZING, COMPLETED, FAILED }
```

Add to AISystem model:
```prisma
model AISystem {
  // ... existing fields ...
  documents     SystemDocument[]  // Uploaded product documentation
}
```

### tRPC Endpoints

```ts
// Add to src/server/routers/system.ts or create src/server/routers/document.ts

documentRouter = router({
  // Get presigned upload URL
  getUploadUrl: protectedProcedure
    .input(z.object({
      systemId: z.string(),
      fileName: z.string(),
      fileType: z.enum(['pdf', 'docx', 'md', 'txt']),
      fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
    }))
    .mutation(async ({ input, ctx }) => {
      // Generate presigned S3 URL
      // Return { uploadUrl, documentId }
    }),

  // Trigger analysis after upload
  analyze: protectedProcedure
    .input(z.object({ documentIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      // 1. Fetch documents from S3
      // 2. Extract text (PDF → text, DOCX → text, etc.)
      // 3. Send to Claude API with analysis prompt
      // 4. Save results to SystemDocument.analysisResult
      // 5. Return pre-filled wizard data
    }),

  // Get analysis results
  getAnalysis: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .query(async ({ input }) => {
      // Return all documents + analysis results for a system
    }),

  // Delete document
  delete: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ input }) => {
      // Delete from S3 + DB
    }),
});
```

### Updated Classification Wizard Flow

Step 0 (NEW): Upload Documents (optional)
```
┌─────────────────────────────────────────────┐
│  How would you like to add your AI system?  │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │ 📄 Upload Docs  │  │ ✍️ Fill Manually │  │
│  │                 │  │                  │  │
│  │ Upload your     │  │ Describe your    │  │
│  │ product docs    │  │ AI system step   │  │
│  │ and we'll       │  │ by step          │  │
│  │ analyze them    │  │                  │  │
│  └─────────────────┘  └──────────────────┘  │
│                                              │
│  Supported: PDF, DOCX, MD, TXT (max 10MB)   │
└─────────────────────────────────────────────┘
```

If user uploads docs:
```
Upload 1-5 files → "Analyzing your documents..." (loading) →
Show: "We found the following information in your documents:" →
Pre-filled wizard with highlighted fields: "Extracted from your docs" →
Detected risks shown as warnings: "⚠️ We found profiling in your privacy policy" →
User reviews each step → Confirms → Classification runs
```

### i18n Keys

```json
{
  "wizard": {
    "uploadOption": "Upload Documents",
    "manualOption": "Fill Manually",
    "uploadTitle": "Upload your product documentation",
    "uploadDescription": "We'll analyze your docs and pre-fill the classification form",
    "uploadDropzone": "Drop files here or click to upload",
    "uploadSupported": "Supported: PDF, DOCX, MD, TXT (max 10MB each, up to 5 files)",
    "analyzing": "Analyzing your documents...",
    "analysisComplete": "Analysis complete! Review the extracted information below.",
    "extractedFrom": "Extracted from your docs",
    "detectedRisk": "Risk detected",
    "detectedRiskDescription": "We found potential compliance risks in your documents",
    "noRisksFound": "No additional risks detected",
    "reviewAndConfirm": "Please review and confirm the information below"
  }
}
```

### Plan Limits

| Feature | Free | Starter | Professional | Scale |
|---------|------|---------|-------------|-------|
| Document Upload | No | 2 files/system | 5 files/system | 5 files/system |
| AI Document Analysis | No | Yes | Yes | Yes |

### Security & Data Handling Notice

Display to user before upload:
```
"Your documents are encrypted and stored securely. They are used only to analyze 
your AI system for compliance purposes. Documents are never shared with third parties. 
You can delete them at any time. See our Privacy Policy for details."
```

---

## IMPORTANT: Data Responsibility Disclaimer

### What Complyance IS:
- A tool that helps organize and analyze compliance information
- A generator of draft documents based on user input
- A tracker of compliance status and evidence

### What Complyance is NOT:
- A legal advisor (all outputs include disclaimer)
- A certified auditor
- A guarantor of compliance

### Document Storage Commitment:
- Files are encrypted at rest (AES-256) and in transit (TLS)
- Stored in EU region (eu-central-1) for GDPR alignment
- Retained as long as subscription is active
- 30-day grace period after cancellation before deletion
- User can export all data at any time (GDPR right to data portability)
- User can delete individual documents or all data at any time (GDPR right to erasure)
- Integrity hashes (SHA-256) stored for each file to prove document authenticity

### Legal Disclaimer (shown on every generated document):
```
"This document was generated by Complyance and is provided for informational 
purposes only. It does not constitute legal advice. Risk classifications and 
compliance recommendations should be verified by a qualified legal professional 
specializing in AI regulation. Complyance does not guarantee compliance with 
any regulation."
```

The platform helps users GET ORGANIZED for compliance — it does not certify them as compliant. This distinction must be clear in all UI, marketing, and generated documents.
