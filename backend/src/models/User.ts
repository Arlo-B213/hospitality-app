import { Pool, QueryResult } from 'pg';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  team?: string;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  team?: string;
  phone?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * User Repository for database operations
 */
export class UserRepository {
  constructor(private pool: Pool) {}

  /**
   * Find a user by email
   * @param email User email address
   * @returns User object or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result: QueryResult<User> = await this.pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find a user by ID
   * @param id User ID (UUID)
   * @returns User object or null if not found
   */
  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const result: QueryResult<User> = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find a user by ID including inactive users (admin only)
   * @param id User ID (UUID)
   * @returns User object or null if not found
   */
  async findByIdIncludeInactive(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: QueryResult<User> = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user object
   */
  async create(userData: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: string;
    team?: string;
    phone?: string;
  }): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, team, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result: QueryResult<User> = await this.pool.query(query, [
      userData.email,
      userData.password_hash,
      userData.first_name,
      userData.last_name,
      userData.role,
      userData.team || null,
      userData.phone || null,
      true,
    ]);
    return result.rows[0];
  }

  /**
   * Update user last login timestamp
   * @param id User ID
   */
  async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Update user profile (non-sensitive fields)
   * @param id User ID
   * @param updates Fields to update
   * @returns Updated user object
   */
  async updateProfile(
    id: string,
    updates: {
      first_name?: string;
      last_name?: string;
      phone?: string;
    }
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updates.first_name);
    }

    if (updates.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updates.last_name);
    }

    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<User> = await this.pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Deactivate a user (soft delete)
   * @param id User ID
   */
  async deactivate(id: string): Promise<void> {
    const query = 'UPDATE users SET is_active = false WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Activate a user
   * @param id User ID
   */
  async activate(id: string): Promise<void> {
    const query = 'UPDATE users SET is_active = true WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Get user profile (without password hash)
   * @param id User ID
   * @returns User profile or null
   */
  async getProfile(id: string): Promise<UserProfile | null> {
    const query = `
      SELECT id, email, first_name, last_name, role, team, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    const result: QueryResult<UserProfile> = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * List all active users by role
   * @param role User role to filter by
   * @returns Array of user profiles
   */
  async findByRole(role: string): Promise<UserProfile[]> {
    const query = `
      SELECT id, email, first_name, last_name, role, team, phone, is_active, last_login, created_at, updated_at
      FROM users
      WHERE role = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    const result: QueryResult<UserProfile> = await this.pool.query(query, [role]);
    return result.rows;
  }

  /**
   * Check if email already exists
   * @param email Email to check
   * @returns true if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Update password hash
   * @param id User ID
   * @param passwordHash New password hash
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2';
    await this.pool.query(query, [passwordHash, id]);
  }
}
