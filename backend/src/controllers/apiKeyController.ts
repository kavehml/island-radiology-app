import { Response } from 'express';
import ApiKey from '../models/ApiKey';
import { AuthenticatedRequest } from '../types/api';

export const createApiKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { keyName, organizationName, contactEmail, allowedIps, expiresAt } = req.body;

    if (!keyName) {
      res.status(400).json({ error: 'Key name is required' });
      return;
    }

    const createdBy = req.user?.id || null;
    const apiKey = await ApiKey.create(
      keyName,
      createdBy,
      organizationName,
      contactEmail,
      allowedIps,
      expiresAt ? new Date(expiresAt) : undefined
    );

    res.status(201).json({
      id: apiKey.id,
      key_name: apiKey.key_name,
      api_key: apiKey.api_key, // Only show key on creation
      organization_name: apiKey.organization_name,
      contact_email: apiKey.contact_email,
      created_at: apiKey.created_at,
      expires_at: apiKey.expires_at
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getAllApiKeys = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const apiKeys = await ApiKey.getAll();
    // Don't expose the actual API keys in the list
    const sanitized = apiKeys.map(key => ({
      id: key.id,
      key_name: key.key_name,
      organization_name: key.organization_name,
      contact_email: key.contact_email,
      is_active: key.is_active,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at
    }));
    res.json(sanitized);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deactivateApiKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await ApiKey.deactivate(id);
    res.json({ message: 'API key deactivated successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteApiKey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await ApiKey.delete(id);
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
