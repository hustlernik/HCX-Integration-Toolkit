import { logger } from './logger';
import { importPKCS8, CompactEncrypt, importX509, compactDecrypt } from 'jose';
import fs from 'fs';
import path from 'path';

function resolvePath(p?: string, fallbackName = 'rsa-public.pem') {
  return p || path.join(__dirname, fallbackName);
}

/**
 * Extract public key from X509 certificate
 */
async function extractPublicKeyFromCertificate(certPath: string): Promise<any> {
  try {
    const certPem = fs.readFileSync(certPath, 'utf8');

    if (certPem.includes('-----BEGIN CERTIFICATE-----')) {
      logger.debug('Processing X509 certificate', undefined, { phase: 'parse-cert' });
      return await importX509(certPem, 'RSA-OAEP-256');
    }

    throw new Error('Invalid certificate format. Expected X509 certificate or SPKI public key.');
  } catch (error) {
    console.error('Error extracting public key from certificate:', error);
    throw error;
  }
}

/**
 * Encrypt a FHIR resource using recipient's X509 certificate and HCX-compliant protected headers.
 */
export async function encryptFHIR(
  payload: Record<string, any>,
  protocolHeaders: Record<string, any> = {},
  domainHeaders: Record<string, any> = {},
  recipientCertPath?: string,
): Promise<string> {
  const certPath = resolvePath(recipientCertPath, '../keys/provider_cert.pem');

  const publicKey = await extractPublicKeyFromCertificate(certPath);

  const protectedHeader = {
    alg: 'RSA-OAEP-256',
    enc: 'A256GCM',
    ...protocolHeaders,
    ...domainHeaders,
  };

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(payload));

  const jwe = await new CompactEncrypt(plaintext)
    .setProtectedHeader(protectedHeader)
    .encrypt(publicKey);

  console.log('JWE encrypted successfully with X509 certificate');
  return jwe;
}

/**
 * Decrypt a compact JWE string to get the FHIR payload.
 */
export async function decryptFHIR(
  jweCompact: string,
  privateKeyPath?: string,
): Promise<Record<string, any>> {
  try {
    if (!jweCompact || typeof jweCompact !== 'string') {
      throw new Error('Invalid JWE: must be a non-empty string');
    }

    const parts = jweCompact.split('.');
    if (parts.length !== 5) {
      throw new Error(`Invalid JWE format: expected 5 parts, got ${parts.length}`);
    }

    const privPath = privateKeyPath || path.resolve(__dirname, '../keys/payer_private.pem');

    if (!fs.existsSync(privPath)) {
      throw new Error(`Private key file not found: ${privPath}`);
    }

    const privateKeyPem = fs.readFileSync(privPath, 'utf8');
    const privateKey = await importPKCS8(privateKeyPem, 'RSA-OAEP-256');

    const { plaintext, protectedHeader } = await compactDecrypt(jweCompact, privateKey);

    let payload: any;
    try {
      payload = JSON.parse(new TextDecoder().decode(plaintext));
    } catch (parseError) {
      console.warn('Failed to parse decrypted payload as JSON, returning as string');
      payload = new TextDecoder().decode(plaintext);
    }

    return {
      protected: protectedHeader,
      payload: payload,
    };
  } catch (error) {
    console.error('JWE decryption failed:', {
      error: (error as any)?.message,
      jweLength: jweCompact?.length,
      privateKeyPath: privateKeyPath || 'default',
    });
    throw new Error(`JWE decryption failed: ${(error as any)?.message}`);
  }
}

/**
 * Validate X509 certificate format
 */
export function validateCertificate(certPath: string): boolean {
  try {
    const certPem = fs.readFileSync(certPath, 'utf8');

    if (
      certPem.includes('-----BEGIN CERTIFICATE-----') &&
      certPem.includes('-----END CERTIFICATE-----')
    ) {
      console.log('Valid X509 certificate format detected');
      return true;
    }

    console.error('Invalid certificate format');
    return false;
  } catch (error) {
    console.error('Error reading certificate file:', error);
    return false;
  }
}
