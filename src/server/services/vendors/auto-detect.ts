/**
 * Vendor auto-detection from runtime model usage.
 *
 * When TraceHawk pushes a `monitoring_summary` SDK event for an AI system,
 * `metadata.models_used` lists the model names called during that period.
 * We map those model names to vendors (OpenAI, Anthropic, Google, etc.)
 * and automatically:
 *   1. Create the Vendor row if it doesn't exist for the org
 *   2. Link it to the AI system via SystemVendorLink if not already linked
 *
 * Newly auto-detected vendors are created with `supportsAIAct: null`
 * (unknown) and no risk score — they will surface in the vendor dashboard
 * for the user to formally assess.
 */
import type { PrismaClient } from '@prisma/client';

interface VendorInfo {
  name: string;
  /** Matches Vendor.vendorType convention: API_PROVIDER | SAAS_WITH_AI | MODEL_HOST */
  type: 'API_PROVIDER' | 'SAAS_WITH_AI' | 'MODEL_HOST';
}

/**
 * Exact-match map. Lookup is case-insensitive — see `lookupVendor` below.
 *
 * Keep model names lowercase, hyphenated. Add new entries here when new
 * models become common in the wild. Order is irrelevant.
 */
const MODEL_TO_VENDOR: Record<string, VendorInfo> = {
  // OpenAI
  'gpt-4o': { name: 'OpenAI', type: 'API_PROVIDER' },
  'gpt-4o-mini': { name: 'OpenAI', type: 'API_PROVIDER' },
  'gpt-4-turbo': { name: 'OpenAI', type: 'API_PROVIDER' },
  'gpt-4': { name: 'OpenAI', type: 'API_PROVIDER' },
  'gpt-3.5-turbo': { name: 'OpenAI', type: 'API_PROVIDER' },
  'o1': { name: 'OpenAI', type: 'API_PROVIDER' },
  'o1-mini': { name: 'OpenAI', type: 'API_PROVIDER' },
  'o1-preview': { name: 'OpenAI', type: 'API_PROVIDER' },
  // Anthropic
  'claude-sonnet-4': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-opus-4': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-haiku': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-3-5-sonnet': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-3-5-sonnet-20241022': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-3-5-haiku': { name: 'Anthropic', type: 'API_PROVIDER' },
  'claude-3-opus': { name: 'Anthropic', type: 'API_PROVIDER' },
  // Google
  'gemini-2.0-flash': { name: 'Google', type: 'API_PROVIDER' },
  'gemini-2.5-pro': { name: 'Google', type: 'API_PROVIDER' },
  'gemini-1.5-pro': { name: 'Google', type: 'API_PROVIDER' },
  'gemini-1.5-flash': { name: 'Google', type: 'API_PROVIDER' },
  // DeepSeek
  'deepseek-chat': { name: 'DeepSeek', type: 'API_PROVIDER' },
  'deepseek-coder': { name: 'DeepSeek', type: 'API_PROVIDER' },
  'deepseek-r1': { name: 'DeepSeek', type: 'API_PROVIDER' },
  // Meta
  'llama-4-scout': { name: 'Meta', type: 'API_PROVIDER' },
  'llama-3.3-70b': { name: 'Meta', type: 'API_PROVIDER' },
  'llama-3.1-405b': { name: 'Meta', type: 'API_PROVIDER' },
  // Mistral
  'mistral-large': { name: 'Mistral', type: 'API_PROVIDER' },
  'mistral-medium': { name: 'Mistral', type: 'API_PROVIDER' },
  'mistral-small': { name: 'Mistral', type: 'API_PROVIDER' },
  'codestral': { name: 'Mistral', type: 'API_PROVIDER' },
  // Cohere
  'command-r': { name: 'Cohere', type: 'API_PROVIDER' },
  'command-r-plus': { name: 'Cohere', type: 'API_PROVIDER' },
  // xAI
  'grok-2': { name: 'xAI', type: 'API_PROVIDER' },
  'grok-3': { name: 'xAI', type: 'API_PROVIDER' },
};

/**
 * Vendor name prefixes for fallback matching when an exact match fails.
 * If a model name starts with one of these prefixes (case-insensitive),
 * we attribute it to the corresponding vendor.
 *
 * Order matters — longer prefixes first to avoid mis-attribution.
 */
const VENDOR_PREFIXES: Array<{ prefix: string; info: VendorInfo }> = [
  { prefix: 'gpt-', info: { name: 'OpenAI', type: 'API_PROVIDER' } },
  { prefix: 'o1-', info: { name: 'OpenAI', type: 'API_PROVIDER' } },
  { prefix: 'claude-', info: { name: 'Anthropic', type: 'API_PROVIDER' } },
  { prefix: 'gemini-', info: { name: 'Google', type: 'API_PROVIDER' } },
  { prefix: 'deepseek-', info: { name: 'DeepSeek', type: 'API_PROVIDER' } },
  { prefix: 'llama-', info: { name: 'Meta', type: 'API_PROVIDER' } },
  { prefix: 'mistral-', info: { name: 'Mistral', type: 'API_PROVIDER' } },
  { prefix: 'command-', info: { name: 'Cohere', type: 'API_PROVIDER' } },
  { prefix: 'grok-', info: { name: 'xAI', type: 'API_PROVIDER' } },
];

/**
 * Resolve a model name to a vendor. Tries exact match first (case-insensitive),
 * then prefix match. Returns null if no match.
 */
export function lookupVendor(modelName: string): VendorInfo | null {
  const normalized = modelName.trim().toLowerCase();
  if (!normalized) return null;

  // Exact match
  const exact = MODEL_TO_VENDOR[normalized];
  if (exact) return exact;

  // Prefix fallback
  for (const { prefix, info } of VENDOR_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return info;
    }
  }

  return null;
}

export interface AutoDetectResult {
  /** Number of new Vendor rows created. */
  created: number;
  /** Number of new SystemVendorLink rows created. */
  linked: number;
  /** Vendor names that were skipped because no mapping matched. */
  unknownModels: string[];
}

/**
 * Auto-detect and link vendors based on the models used by an AI system
 * during a monitoring period.
 *
 * Idempotent: calling this twice with the same input is safe — the second
 * call will create zero new rows.
 *
 * @param prisma          PrismaClient instance (passed in so callers can
 *                        share the request-scoped client / transaction)
 * @param organizationId  Org that owns the system and vendors
 * @param systemId        AI system the models were used in
 * @param modelsUsed      Model names extracted from monitoring_summary
 * @returns counts of created vendors / links plus any unknown models
 */
export async function autoDetectVendors(
  prisma: PrismaClient,
  organizationId: string,
  systemId: string,
  modelsUsed: string[]
): Promise<AutoDetectResult> {
  const result: AutoDetectResult = {
    created: 0,
    linked: 0,
    unknownModels: [],
  };

  if (!modelsUsed || modelsUsed.length === 0) {
    return result;
  }

  // De-duplicate input — TraceHawk may report the same model many times.
  const uniqueModels = Array.from(new Set(modelsUsed.map((m) => m.trim()).filter(Boolean)));

  // Resolve to vendors, deduplicate by vendor name, track unknowns.
  const vendorsToProcess = new Map<string, VendorInfo>();
  for (const model of uniqueModels) {
    const info = lookupVendor(model);
    if (!info) {
      result.unknownModels.push(model);
      continue;
    }
    if (!vendorsToProcess.has(info.name)) {
      vendorsToProcess.set(info.name, info);
    }
  }

  // For each unique vendor: upsert vendor + upsert link.
  for (const [vendorName, vendorInfo] of vendorsToProcess) {
    // Find existing vendor for this org.
    let vendor = await prisma.vendor.findFirst({
      where: { organizationId, name: vendorName },
      select: { id: true },
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          organizationId,
          name: vendorInfo.name,
          vendorType: vendorInfo.type,
          // Auto-detected vendors start with unknown AI Act support —
          // they need a formal assessment to populate this field.
          supportsAIAct: null,
        },
        select: { id: true },
      });
      result.created += 1;
    }

    // Find existing link.
    const existingLink = await prisma.systemVendorLink.findFirst({
      where: { systemId, vendorId: vendor.id },
      select: { id: true },
    });

    if (!existingLink) {
      await prisma.systemVendorLink.create({
        data: { systemId, vendorId: vendor.id },
      });
      result.linked += 1;
    }
  }

  return result;
}
