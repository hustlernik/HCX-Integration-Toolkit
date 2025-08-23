import axios from 'axios';
import { URL } from 'url';

/**
 * Fetches the encrypted certificate for a given participant ID.
 * @param participantId - The participant ID
 * @param certUrl - The URL to fetch the certificate from
 * @returns The certificate response data
 */
export async function getEncryptedCert(participantId: string, certUrl: string): Promise<any> {
  const body = {
    participantid: participantId,
  };
  const bodyString = JSON.stringify(body);
  const contentLength = Buffer.byteLength(bodyString).toString();
  const host = new URL(certUrl).host;

  try {
    const response = await axios.post(certUrl, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': contentLength,
        Host: host,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch encrypted cert: ${error.response?.data?.message || error.message}`,
    );
  }
}
