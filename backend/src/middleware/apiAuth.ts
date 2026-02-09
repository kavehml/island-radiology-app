import { Request, Response, NextFunction } from 'express';
import ApiKey from '../models/ApiKey';

export interface ApiAuthenticatedRequest extends Request {
  apiKey?: {
    id: number;
    keyName: string;
    organizationName: string | null;
  };
}

export const authenticateApiKey = async (
  req: ApiAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key required. Include X-API-Key header.' });
      return;
    }

    const keyRecord = await ApiKey.findByKey(apiKey);
    if (!keyRecord) {
      res.status(401).json({ error: 'Invalid or expired API key' });
      return;
    }

    // Check IP whitelist if configured
    if (keyRecord.allowed_ips && keyRecord.allowed_ips.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress || '';
      if (!keyRecord.allowed_ips.includes(clientIp)) {
        res.status(403).json({ error: 'IP address not authorized' });
        return;
      }
    }

    // Update last used timestamp
    await ApiKey.updateLastUsed(apiKey);

    req.apiKey = {
      id: keyRecord.id,
      keyName: keyRecord.key_name,
      organizationName: keyRecord.organization_name
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'API authentication error' });
  }
};
