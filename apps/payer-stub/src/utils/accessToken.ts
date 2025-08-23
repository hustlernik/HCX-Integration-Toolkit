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
    console.log('[Payer Session] Requesting ABDM token with:', {
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

    return response.data.accessToken;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch access token: ${error.response?.data?.message || error.message}`,
    );
  }
}
