import { createHash } from 'crypto';

/**
 * Evidence integrity verification service
 * Provides SHA-256 hashing for evidence authenticity
 */

/**
 * Calculate SHA-256 hash from file content (Buffer or string)
 */
export function calculateHashFromContent(content: Buffer | string): string {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

/**
 * Calculate SHA-256 hash from evidence metadata (for MVP without real S3)
 * This creates a hash based on the evidence properties as a placeholder
 */
export function calculateMetadataHash(evidence: {
  title: string;
  description?: string | null;
  evidenceType: string;
  article?: string | null;
  systemId?: string | null;
  organizationId: string;
  createdAt: Date;
}): string {
  const content = JSON.stringify({
    title: evidence.title,
    description: evidence.description,
    evidenceType: evidence.evidenceType,
    article: evidence.article,
    systemId: evidence.systemId,
    organizationId: evidence.organizationId,
    createdAt: evidence.createdAt.toISOString(),
  });
  return calculateHashFromContent(content);
}

/**
 * Verify evidence integrity by comparing stored hash with recalculated hash
 */
export function verifyIntegrity(
  storedHash: string | null,
  currentHash: string
): { verified: boolean; status: 'VERIFIED' | 'TAMPERED' | 'NO_HASH' } {
  if (!storedHash) {
    return { verified: false, status: 'NO_HASH' };
  }

  if (storedHash === currentHash) {
    return { verified: true, status: 'VERIFIED' };
  }

  return { verified: false, status: 'TAMPERED' };
}

/**
 * Evidence type options
 */
export const EVIDENCE_TYPES = [
  'DOCUMENT',
  'SCREENSHOT',
  'LOG',
  'TEST_RESULT',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/**
 * Related article options for EU AI Act compliance
 */
export const EVIDENCE_ARTICLES = [
  { value: 'Article 9', label: 'Article 9 - Risk Management System' },
  { value: 'Article 10', label: 'Article 10 - Data Governance' },
  { value: 'Article 11', label: 'Article 11 - Technical Documentation' },
  { value: 'Article 12', label: 'Article 12 - Record-Keeping' },
  { value: 'Article 13', label: 'Article 13 - Transparency' },
  { value: 'Article 14', label: 'Article 14 - Human Oversight' },
  { value: 'Article 15', label: 'Article 15 - Accuracy & Robustness' },
  { value: 'Article 47', label: 'Article 47 - Conformity Assessment' },
  { value: 'Article 49', label: 'Article 49 - CE Marking' },
  { value: 'Article 50', label: 'Article 50 - Transparency Obligations' },
  { value: 'Article 72', label: 'Article 72 - Post-Market Monitoring' },
  { value: 'Other', label: 'Other' },
] as const;

export type EvidenceArticle = (typeof EVIDENCE_ARTICLES)[number]['value'];

/**
 * File type validation for evidence uploads
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.csv',
  '.txt',
  '.docx',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type and size
 */
export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType?: string
): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  // Check extension
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as typeof ALLOWED_FILE_EXTENSIONS[number])) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
    };
  }

  // Check mime type if provided
  if (mimeType && !ALLOWED_FILE_TYPES.includes(mimeType as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      valid: false,
      error: 'Invalid file type',
    };
  }

  return { valid: true };
}

/**
 * Generate a placeholder file URL for MVP (no real S3)
 */
export function generatePlaceholderFileUrl(
  organizationId: string,
  evidenceId: string,
  fileName: string
): string {
  return `https://storage.complyance.app/evidence/${organizationId}/${evidenceId}/${fileName}`;
}
