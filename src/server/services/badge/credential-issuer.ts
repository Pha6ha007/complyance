import { createPrivateKey, sign, createPublicKey, verify } from 'crypto';

/**
 * W3C Verifiable Credential for AI Compliance Badge.
 *
 * Implements a subset of the W3C Verifiable Credentials Data Model v1.1
 * with Ed25519Signature2020 proof type.
 *
 * When COMPLYANCE_SIGNING_PRIVATE_KEY is set, credentials are cryptographically
 * signed and independently verifiable. Without it, credentials are issued unsigned
 * (still useful as structured compliance data, but not independently verifiable).
 */

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

export type { ComplianceCredential };

/** Credential validity period: 90 days */
const CREDENTIAL_VALIDITY_DAYS = 90;

/**
 * Issue a W3C Verifiable Credential for an organization's compliance status.
 * Optionally signs with Ed25519 if the signing key env var is set.
 */
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
  const expiry = new Date(now.getTime() + CREDENTIAL_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

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

  // Sign with Ed25519 if private key is available
  const privateKeyBase64 = process.env.COMPLYANCE_SIGNING_PRIVATE_KEY;
  if (privateKeyBase64) {
    try {
      const privateKeyBytes = Buffer.from(privateKeyBase64, 'base64');

      // Ed25519 raw key → PKCS8 DER wrapping
      // Ed25519 PKCS8 prefix (RFC 8410): 302e020100300506032b657004220420
      const pkcs8Prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
      const pkcs8Der = Buffer.concat([pkcs8Prefix, privateKeyBytes]);

      const privateKey = createPrivateKey({
        key: pkcs8Der,
        format: 'der',
        type: 'pkcs8',
      });

      const payload = JSON.stringify(credential.credentialSubject);
      const signature = sign(null, Buffer.from(payload), privateKey);

      credential.proof = {
        type: 'Ed25519Signature2020',
        created: now.toISOString(),
        verificationMethod: 'https://complyance.io/.well-known/public-key',
        proofPurpose: 'assertionMethod',
        proofValue: signature.toString('base64'),
      };
    } catch {
      // If signing fails, return credential without proof.
      // Better to issue an unsigned credential than to fail entirely.
    }
  }

  return credential;
}

/**
 * Verify a compliance credential.
 * Checks expiration, issuer, and optionally the Ed25519 signature.
 */
export function verifyCredential(credential: ComplianceCredential): {
  valid: boolean;
  expired: boolean;
  signed: boolean;
  signatureValid: boolean | null;
  reason?: string;
} {
  // Check expiration
  const now = new Date();
  const expiry = new Date(credential.expirationDate);

  if (now > expiry) {
    return { valid: false, expired: true, signed: !!credential.proof, signatureValid: null, reason: 'Credential has expired' };
  }

  // Check issuer
  if (credential.issuer.id !== 'https://complyance.io') {
    return { valid: false, expired: false, signed: false, signatureValid: null, reason: 'Unknown issuer' };
  }

  // Verify signature if present
  if (credential.proof) {
    const publicKeyBase64 = process.env.COMPLYANCE_SIGNING_PUBLIC_KEY;
    if (!publicKeyBase64) {
      return { valid: true, expired: false, signed: true, signatureValid: null, reason: 'Public key not available for verification' };
    }

    try {
      const publicKeyBytes = Buffer.from(publicKeyBase64, 'base64');

      // Ed25519 raw public key → SPKI DER wrapping
      // Ed25519 SPKI prefix (RFC 8410): 302a300506032b6570032100
      const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
      const spkiDer = Buffer.concat([spkiPrefix, publicKeyBytes]);

      const publicKey = createPublicKey({
        key: spkiDer,
        format: 'der',
        type: 'spki',
      });

      const payload = JSON.stringify(credential.credentialSubject);
      const signature = Buffer.from(credential.proof.proofValue, 'base64');
      const isValid = verify(null, Buffer.from(payload), publicKey, signature);

      return { valid: isValid, expired: false, signed: true, signatureValid: isValid };
    } catch {
      return { valid: false, expired: false, signed: true, signatureValid: false, reason: 'Signature verification failed' };
    }
  }

  // No proof — credential is valid but unsigned
  return { valid: true, expired: false, signed: false, signatureValid: null };
}
