import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'radiologist' | 'staff' | 'viewer';
  name: string;
  radiologist_id: number | null;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithoutPassword {
  id: number;
  email: string;
  role: 'admin' | 'radiologist' | 'staff' | 'viewer';
  name: string;
  radiologist_id: number | null;
  is_active: boolean;
  last_login: Date | null;
}

class User {
  static async findByEmail(email: string): Promise<UserRow | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );
    return result.rows[0] as UserRow | undefined;
  }

  static async findById(id: number): Promise<UserRow | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = TRUE', [id]);
    return result.rows[0] as UserRow | undefined;
  }

  static async create(
    email: string,
    password: string,
    role: 'admin' | 'radiologist' | 'staff' | 'viewer',
    name: string,
    radiologistId: number | null = null
  ): Promise<UserWithoutPassword> {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, name, radiologist_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, name, radiologist_id, is_active, last_login, created_at, updated_at`,
      [email, passwordHash, role, name, radiologistId]
    );
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      radiologist_id: user.radiologist_id,
      is_active: user.is_active,
      last_login: user.last_login
    };
  }

  static async verifyPassword(user: UserRow, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async updateLastLogin(userId: number): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  static async updatePassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, userId]
    );
  }

  static async getAll(): Promise<UserWithoutPassword[]> {
    const result = await pool.query(
      `SELECT id, email, role, name, radiologist_id, is_active, last_login, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows as UserWithoutPassword[];
  }

  static async updateRole(userId: number, role: 'admin' | 'radiologist' | 'staff' | 'viewer'): Promise<void> {
    await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    );
  }

  static async deactivate(userId: number): Promise<void> {
    await pool.query(
      'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  static async updateEmail(userId: number, email: string): Promise<void> {
    await pool.query(
      'UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [email, userId]
    );
  }

  static async updateName(userId: number, name: string): Promise<void> {
    await pool.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [name, userId]
    );
  }

  static async updateRadiologistId(userId: number, radiologistId: number | null): Promise<void> {
    await pool.query(
      'UPDATE users SET radiologist_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [radiologistId, userId]
    );
  }
}

export default User;
