import { logger } from './logger';
import {
  importPKCS8,
  CompactEncrypt,
  FlattenedDecryptResult,
  flattenedDecrypt,
  importX509,
} from 'jose';
import fs from 'fs';
import path from 'path';

function resolvePath(p?: string, fallbackName = 'rsa-public.pem') {
  return p || path.join(__dirname, fallbackName);
}

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

export async function encryptFHIR(
  payload: Record<string, any>,
  protocolHeaders: Record<string, any> = {},
  domainHeaders: Record<string, any> = {},
  recipientCertPath?: string,
): Promise<string> {
  const certPath = resolvePath(recipientCertPath, '../keys/payer_cert.pem');

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

export async function decryptFHIR(
  jweCompact: string,
  privateKeyPath?: string,
): Promise<{ payload: any; protected: Record<string, any> }> {
  const privPath = resolvePath(privateKeyPath, '../keys/provider_private.pem');
  const privateKeyPem = fs.readFileSync(privPath, 'utf8');

  const privateKey = await importPKCS8(privateKeyPem, 'RSA-OAEP-256');

  const parts = jweCompact.split('.');
  if (parts.length !== 5) {
    throw new Error('Invalid JWE compact serialization: expected 5 parts');
  }
  const [protectedB64, encrypted_key, iv, ciphertext, tag] = parts;
  const protectedHeader = JSON.parse(Buffer.from(protectedB64, 'base64url').toString('utf8'));

  const { plaintext }: FlattenedDecryptResult = await flattenedDecrypt(
    { protected: protectedB64, encrypted_key, iv, ciphertext, tag },
    privateKey,
  );

  return {
    payload: JSON.parse(new TextDecoder().decode(plaintext)),
    protected: protectedHeader,
  };
}

export function validateCertificate(certPath: string): boolean {
  try {
    const certPem = fs.readFileSync(certPath, 'utf8');

    // Check for X509 certificate format
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
