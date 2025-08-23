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
    const clientId = config.abdmClientId || process.env.ABDM_CLIENT_ID || '';
    const clientSecret = config.abdmClientSecret || process.env.ABDM_CLIENT_SECRET || '';
    const tokenUrl = config.sessionApiUrl || process.env.ABDM_TOKEN_URL || '';
    const grantType = config.abdmGrantType || 'client_credentials';

    if (!clientId || !clientSecret || !tokenUrl) {
      logger.warn('Missing required ABDM session params');
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['clientId', 'clientSecret', 'tokenUrl'],
      });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(tokenUrl);
    } catch {
      logger.warn('Invalid tokenUrl', { tokenUrl });
      return res.status(400).json({ error: 'Invalid tokenUrl' });
    }
    const allowedHosts = new Set(
      (process.env.SESSION_ALLOWED_HOSTS ?? '')
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean),
    );
    if (allowedHosts.size && !allowedHosts.has(parsedUrl.host)) {
      logger.warn('tokenUrl host not allowed', { host: parsedUrl.host });
      return res.status(400).json({ error: 'tokenUrl host not allowed' });
    }
    logger.info('Requesting ABDM token', {
      host: parsedUrl.host,
      grantType,
      clientIdMasked: clientId.slice(0, 4) + '***',
    });

    const accessToken = await getAccessToken(clientId, clientSecret, tokenUrl, grantType);
    return res.json({ accessToken, cached: false, expiresIn: 0 });
  } catch (err: any) {
    const rawMsg = String(err?.message || '');
    const isDisallowedHost = rawMsg.startsWith('tokenUrl host not allowed');
    const status = isDisallowedHost ? 400 : 500;
    logger.error('ABDM session error', err);
    return res.status(status).json({ error: 'Failed to create session' });
  }
});

export default router;
