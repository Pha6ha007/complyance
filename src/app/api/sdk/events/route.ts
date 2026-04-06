import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { z } from 'zod';
import { calculateMetadataHash } from '@/server/services/evidence/integrity';

/**
 * SDK Event webhook endpoint.
 * Receives compliance events from @complyance/sdk and stores them as Evidence.
 * Authentication via Bearer API key (Organization.apiKey).
 *
 * POST /api/sdk/events
 * Authorization: Bearer cmp_...
 */

const sdkEventSchema = z.object({
  system_id: z.string().min(1),
  timestamp: z.string(),
  event_type: z.enum([
    // Native SDK events
    'llm_call',
    'tool_call',
    'error',
    // TraceHawk integration events (pushed via SDK from TraceHawk runtime)
    'monitoring_summary',
    'security_alert',
    'budget_exceeded',
    'runtime_anomaly',
  ]),
  model: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  input_tokens: z.number().optional().nullable(),
  output_tokens: z.number().optional().nullable(),
  latency_ms: z.number().optional().nullable(),
  has_pii_indicators: z.boolean().default(false),
  error: z.string().optional().nullable(),
  content_hash: z.string().optional().nullable(),
  // Free-form structured payload for TraceHawk events. Never contains prompt
  // content; only metrics, summaries, identifiers.
  metadata: z.record(z.unknown()).optional().nullable(),
});

/**
 * Map an SDK event_type to the EU AI Act article it provides evidence for.
 * Used as the Evidence.article field so the audit trail surfaces the right
 * article in the dashboard.
 */
const EVENT_TYPE_TO_ARTICLE: Record<string, string> = {
  llm_call: 'Article 12 — Record Keeping',
  tool_call: 'Article 12 — Record Keeping',
  error: 'Article 12 — Record Keeping',
  monitoring_summary: 'Article 12 — Record Keeping (Runtime Monitoring)',
  security_alert: 'Article 15 — Accuracy, Robustness and Cybersecurity',
  budget_exceeded: 'Article 12 — Record Keeping (Cost Anomaly)',
  runtime_anomaly: 'Article 9 — Risk Management System',
};

export async function POST(req: NextRequest) {
  // Authenticate via API key
  const authHeader = req.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const org = await prisma.organization.findFirst({
    where: { apiKey },
    select: { id: true, plan: true },
  });

  if (!org) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Plan gate — SDK requires Professional+
  if (!['PROFESSIONAL', 'SCALE', 'ENTERPRISE'].includes(org.plan)) {
    return NextResponse.json(
      { error: 'SDK integration requires Professional plan or higher' },
      { status: 403 }
    );
  }

  // Parse and validate event
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = sdkEventSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const event = parsed.data;

  // Verify system belongs to organization
  const system = await prisma.aISystem.findFirst({
    where: { id: event.system_id, organizationId: org.id },
    select: { id: true, name: true },
  });

  if (!system) {
    return NextResponse.json({ error: 'System not found' }, { status: 404 });
  }

  try {
    // Build evidence description (structured metadata, never prompt content).
    // For TraceHawk-originated events, the optional `metadata` field carries
    // the runtime payload (counts, models, anomaly details). It must never
    // contain prompts, completions, or PII.
    const metadata = {
      type: event.event_type,
      model: event.model ?? null,
      provider: event.provider ?? null,
      tokens: {
        input: event.input_tokens ?? null,
        output: event.output_tokens ?? null,
      },
      latency_ms: event.latency_ms ?? null,
      has_pii_indicators: event.has_pii_indicators,
      content_hash: event.content_hash ?? null,
      error: event.error ?? null,
      payload: event.metadata ?? null,
      sdk_version: '0.1.0',
    };

    const title = `SDK: ${event.event_type} — ${event.provider ?? 'unknown'}${event.model ? ` (${event.model})` : ''}`;

    const article =
      EVENT_TYPE_TO_ARTICLE[event.event_type] ?? 'Article 12 — Record Keeping';

    // Store as Evidence (article picked per event type)
    const evidence = await prisma.evidence.create({
      data: {
        title,
        description: JSON.stringify(metadata),
        evidenceType: 'LOG',
        article,
        systemId: system.id,
        organizationId: org.id,
      },
    });

    // Calculate integrity hash
    const integrityHash = calculateMetadataHash({
      title: evidence.title,
      description: evidence.description,
      evidenceType: evidence.evidenceType,
      article: evidence.article,
      systemId: evidence.systemId,
      organizationId: evidence.organizationId,
      createdAt: evidence.createdAt,
    });

    await prisma.evidence.update({
      where: { id: evidence.id },
      data: { integrityHash },
    });

    return NextResponse.json({ received: true, evidence_id: evidence.id });
  } catch {
    return NextResponse.json({ error: 'Failed to store event' }, { status: 500 });
  }
}
