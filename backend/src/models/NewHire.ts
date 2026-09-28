import { Pool, QueryResult } from 'pg';

export interface NewHire {
  id: string;
  user_id: string;
  department: 'FOH' | 'BOH';
  start_date: Date;
  day_90_target_date: Date;
  hire_manager_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * NewHire Repository for database operations
 * Handles CRUD operations for new hire records
 */
export class NewHireRepository {
  constructor(private pool: Pool) {}

  /**
   * Create a new hire record
   * @param newHireData Data for creating a new hire
   * @returns Created new hire object
   */
  async create(newHireData: {
    user_id: string;
    department: 'FOH' | 'BOH';
    start_date: Date;
    day_90_target_date: Date;
    hire_manager_id: string;
  }): Promise<NewHire> {
    const query = `
      INSERT INTO new_hires (user_id, department, start_date, day_90_target_date, hire_manager_id, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;
    const result: QueryResult<NewHire> = await this.pool.query(query, [
      newHireData.user_id,
      newHireData.department,
      newHireData.start_date,
      newHireData.day_90_target_date,
      newHireData.hire_manager_id,
    ]);
    return result.rows[0];
  }

  /**
   * Get a new hire by ID
   * @param id New hire ID (UUID)
   * @returns NewHire object or null if not found
   */
  async getById(id: string): Promise<NewHire | null> {
    const query = 'SELECT * FROM new_hires WHERE id = $1 AND is_active = true';
    const result: QueryResult<NewHire> = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get a new hire by ID including inactive records (admin only)
   * @param id New hire ID (UUID)
   * @returns NewHire object or null if not found
   */
  async getByIdIncludeInactive(id: string): Promise<NewHire | null> {
    const query = 'SELECT * FROM new_hires WHERE id = $1';
    const result: QueryResult<NewHire> = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update a new hire record
   * @param id New hire ID
   * @param updates Fields to update
   * @returns Updated new hire object
   */
  async update(
    id: string,
    updates: Partial<Omit<NewHire, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<NewHire | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.department !== undefined) {
      fields.push(`department = $${paramCount++}`);
      values.push(updates.department);
    }

    if (updates.start_date !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(updates.start_date);
    }

    if (updates.day_90_target_date !== undefined) {
      fields.push(`day_90_target_date = $${paramCount++}`);
      values.push(updates.day_90_target_date);
    }

    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `
      UPDATE new_hires
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<NewHire> = await this.pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * List new hires with optional filters
   * @param filters Optional filters for department, hire_manager_id, and is_active
   * @returns Array of new hire objects
   */
  async list(filters?: {
    department?: 'FOH' | 'BOH';
    hire_manager_id?: string;
    is_active?: boolean;
  }): Promise<NewHire[]> {
    let query = 'SELECT * FROM new_hires WHERE 1=1';
    const params: any[] = [];

    if (filters?.department) {
      query += ` AND department = $${params.length + 1}`;
      params.push(filters.department);
    }

    if (filters?.hire_manager_id) {
      query += ` AND hire_manager_id = $${params.length + 1}`;
      params.push(filters.hire_manager_id);
    }

    if (filters?.is_active !== undefined) {
      query += ` AND is_active = $${params.length + 1}`;
      params.push(filters.is_active);
    }

    query += ' ORDER BY created_at DESC';

    const result: QueryResult<NewHire> = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Soft delete a new hire (mark as inactive)
   * @param id New hire ID
   */
  async deactivate(id: string): Promise<void> {
    const query = 'UPDATE new_hires SET is_active = false WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Reactivate a new hire
   * @param id New hire ID
   */
  async activate(id: string): Promise<void> {
    const query = 'UPDATE new_hires SET is_active = true WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * Get new hires by user ID
   * @param userId User ID to filter by
   * @returns Array of new hire objects
   */
  async getByUserId(userId: string): Promise<NewHire | null> {
    const query = 'SELECT * FROM new_hires WHERE user_id = $1 AND is_active = true LIMIT 1';
    const result: QueryResult<NewHire> = await this.pool.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
