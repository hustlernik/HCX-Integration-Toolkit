import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';

/**
 * Fetches an access token using client credentials.
 * @param clientId - The client ID
 * @param clientSecret - The client secret
 * @param tokenUrl - The URL to request the token from
 * @param grantType - OAuth grant type (defaults to 'client_credentials')
 * @returns The access token as a string
 */
export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
  grantType: string = 'client_credentials',
): Promise<string> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  const body = {
    clientId,
    clientSecret,
    grantType,
  };
  const bodyString = JSON.stringify(body);
  const contentLength = Buffer.byteLength(bodyString).toString();
  const host = new URL(tokenUrl).host;

  try {
    console.log('[Provider Session] Requesting ABDM token with:', {
      clientId,
      grantType,
      tokenUrl,
      hasClientSecret: Boolean(clientSecret),
    });
    const response = await axios.post(tokenUrl, body, {
      headers: {
        'Content-Type': 'application/json',
        'REQUEST-ID': requestId,
        TIMESTAMP: timestamp,
        'X-CM-ID': 'sbx',
        'Content-Length': contentLength,
        Host: host,
      },
    });

    const token: string = response.data.accessToken;
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
        );
        const { iss, aud, scope, exp } = payloadJson || {};
        console.log('[Provider Session] Token claims:', { iss, aud, scope, exp });
      }
    } catch {}

    return token;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch access token: ${error.response?.data?.message || error.message}`,
    );
  }
}
