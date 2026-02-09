import pool from '../config/database';
import crypto from 'crypto';

export interface ApiKeyRow {
  id: number;
  key_name: string;
  api_key: string;
  organization_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  allowed_ips: string[] | null;
  rate_limit_per_hour: number;
  created_by: number | null;
  created_at: Date;
  last_used_at: Date | null;
  expires_at: Date | null;
}

class ApiKey {
  static async generateKey(): Promise<string> {
    return 'island_' + crypto.randomBytes(32).toString('hex');
  }

  static async create(
    keyName: string,
    createdBy: number | null,
    organizationName?: string,
    contactEmail?: string,
    allowedIps?: string[],
    expiresAt?: Date
  ): Promise<ApiKeyRow> {
    const apiKey = await this.generateKey();
    const result = await pool.query(
      `INSERT INTO api_keys (key_name, api_key, organization_name, contact_email, allowed_ips, created_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [keyName, apiKey, organizationName || null, contactEmail || null, allowedIps || null, createdBy, expiresAt || null]
    );
    return result.rows[0] as ApiKeyRow;
  }

  static async findByKey(apiKey: string): Promise<ApiKeyRow | undefined> {
    const result = await pool.query(
      `SELECT * FROM api_keys 
       WHERE api_key = $1 
       AND is_active = TRUE 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [apiKey]
    );
    return result.rows[0] as ApiKeyRow | undefined;
  }

  static async getAll(): Promise<ApiKeyRow[]> {
    const result = await pool.query(
      `SELECT id, key_name, organization_name, contact_email, is_active, 
              created_at, last_used_at, expires_at
       FROM api_keys
       ORDER BY created_at DESC`
    );
    return result.rows as ApiKeyRow[];
  }

  static async updateLastUsed(apiKey: string): Promise<void> {
    await pool.query(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE api_key = $1',
      [apiKey]
    );
  }

  static async deactivate(id: number): Promise<void> {
    await pool.query('UPDATE api_keys SET is_active = FALSE WHERE id = $1', [id]);
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM api_keys WHERE id = $1', [id]);
  }
}

export default ApiKey;
