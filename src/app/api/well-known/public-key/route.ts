import { NextResponse } from 'next/server';

/**
 * Public key endpoint for Verifiable Credential verification.
 *
 * GET /api/well-known/public-key
 *
 * Returns the Ed25519 public key used to sign compliance credentials.
 * External parties use this to independently verify badge credentials.
 *
 * Note: In production, this should ideally live at /.well-known/public-key
 * via a rewrite in next.config.js.
 */
export async function GET() {
  const publicKeyBase64 = process.env.COMPLYANCE_SIGNING_PUBLIC_KEY || '';

  if (!publicKeyBase64) {
    return NextResponse.json(
      { error: 'Public key not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      '@context': 'https://w3id.org/security/v1',
      id: 'https://complyance.io/.well-known/public-key',
      type: 'Ed25519VerificationKey2020',
      controller: 'https://complyance.io',
      publicKeyBase64,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
