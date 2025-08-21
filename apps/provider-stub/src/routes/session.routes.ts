import { Router, Request, Response } from 'express';
import { getAccessToken } from '../utils/accessToken';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

/**
 * POST /hcx/v1/session
 */

router.post('/hcx/v1/session', async (req: Request, res: Response) => {
  try {
    const clientId = process.env.ABDM_CLIENT_ID || '';
    const clientSecret = process.env.ABDM_CLIENT_SECRET || '';
    const tokenUrl = config.sessionApiUrl || process.env.ABDM_TOKEN_URL || '';
    const grantType = 'client_credentials';

    if (!clientId || !clientSecret || !tokenUrl) {
      logger.warn('Missing required ABDM session params');
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['clientId', 'clientSecret', 'tokenUrl'],
      });
    }

    const host = (() => {
      try {
        return new URL(tokenUrl).host;
      } catch {
        return undefined;
      }
    })();

    logger.info('Requesting ABDM token', {
      host,
      grantType,
      clientIdMasked: clientId.slice(0, 4) + '***',
    });

    const accessToken = await getAccessToken(clientId, clientSecret, tokenUrl, grantType);

    return res.json({ accessToken, cached: false, expiresIn: 0 });
  } catch (err: any) {
    const message = err?.message || 'Failed to create session';
    logger.error('ABDM session error', err);
    return res.status(500).json({ error: message });
  }
});

export default router;
