import { Pool, PoolClient } from 'pg';

describe('Database Schema', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://pride_user:pride_password@localhost:5432/pride_training_db',
      max: 5,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should have users table with correct columns', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY column_name
      `);

      const columns = result.rows.map((row) => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('email');
      expect(columns).toContain('password_hash');
      expect(columns).toContain('first_name');
      expect(columns).toContain('last_name');
      expect(columns).toContain('role');
      expect(columns).toContain('is_active');
      expect(columns).toContain('created_at');
      expect(columns).toContain('updated_at');
    } finally {
      client.release();
    }
  });

  it('should have new_hires table with correct columns', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'new_hires'
        ORDER BY column_name
      `);

      const columns = result.rows.map((row) => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('user_id');
      expect(columns).toContain('department');
      expect(columns).toContain('start_date');
      expect(columns).toContain('day_90_target_date');
      expect(columns).toContain('hire_manager_id');
    } finally {
      client.release();
    }
  });

  it('should have skill_assessments table', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'skill_assessments'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should have leadership_modules table with 8 pre-populated modules', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query('SELECT COUNT(*) FROM leadership_modules');

      expect(parseInt(result.rows[0].count, 10)).toBe(8);
    } finally {
      client.release();
    }
  });

  it('should have leadership_progress table', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'leadership_progress'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should have evaluation_summaries table', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'evaluation_summaries'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should have audit_logs table', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'audit_logs'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should have correct enum types', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT typname
        FROM pg_type
        WHERE typtype = 'e'
        ORDER BY typname
      `);

      const enums = result.rows.map((row) => row.typname);
      expect(enums).toContain('user_role');
      expect(enums).toContain('department_type');
      expect(enums).toContain('evaluation_status');
      expect(enums).toContain('skill_proficiency');
    } finally {
      client.release();
    }
  });

  it('should have correct indexes for performance', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
      `);

      const indexCount = parseInt(result.rows[0].index_count, 10);
      // Should have at least the main indexes we created
      expect(indexCount).toBeGreaterThan(10);
    } finally {
      client.release();
    }
  });

  it('should have technical skills pre-populated', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query('SELECT COUNT(*) FROM technical_skills');

      expect(parseInt(result.rows[0].count, 10)).toBe(15);
    } finally {
      client.release();
    }
  });

  it('should have soft skills pre-populated', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query('SELECT COUNT(*) FROM soft_skills');

      expect(parseInt(result.rows[0].count, 10)).toBe(10);
    } finally {
      client.release();
    }
  });

  it('should have update_updated_at_column trigger function', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_name = 'update_updated_at_column'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should enforce email format constraint on users table', async () => {
    const client: PoolClient = await pool.connect();
    try {
      // This should fail due to invalid email constraint
      await expect(
        client.query(
          'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4)',
          ['invalid-email', 'hash', 'John', 'Doe']
        )
      ).rejects.toThrow();
    } finally {
      client.release();
    }
  });

  it('should have foreign key constraints', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'new_hires' AND constraint_type = 'FOREIGN KEY'
      `);

      const constraintNames = result.rows.map((row) => row.constraint_name);
      expect(constraintNames.length).toBeGreaterThan(0);
    } finally {
      client.release();
    }
  });

  it('should have validate_skill_id trigger function', async () => {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query(`
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_name = 'validate_skill_id'
      `);

      expect(result.rows.length).toBe(1);
    } finally {
      client.release();
    }
  });

  it('should enforce skill_id validation on insert (trigger)', async () => {
    const client: PoolClient = await pool.connect();
    try {
      // Get valid IDs
      const userResult = await client.query('SELECT id FROM users LIMIT 1');
      const newHireResult = await client.query('SELECT id FROM new_hires LIMIT 1');
      const technicalSkillResult = await client.query('SELECT id FROM technical_skills WHERE department = $1 LIMIT 1', ['FOH']);

      if (userResult.rows.length === 0 || newHireResult.rows.length === 0 || technicalSkillResult.rows.length === 0) {
        // Skip test if data not available
        return;
      }

      const userId = userResult.rows[0].id;
      const newHireId = newHireResult.rows[0].id;
      const skillId = technicalSkillResult.rows[0].id;

      // Insert valid assessment
      await client.query(
        `INSERT INTO skill_assessments
         (new_hire_id, skill_type, skill_id, assessor_id, proficiency_level, assessment_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newHireId, 'technical', skillId, userId, 'intermediate', new Date().toISOString().split('T')[0]]
      );

      // Attempt to insert with invalid skill_id should fail
      await expect(
        client.query(
          `INSERT INTO skill_assessments
           (new_hire_id, skill_type, skill_id, assessor_id, proficiency_level, assessment_date)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newHireId, 'technical', '00000000-0000-0000-0000-000000000000', userId, 'intermediate', new Date().toISOString().split('T')[0]]
        )
      ).rejects.toThrow('Invalid technical_skill_id');
    } finally {
      client.release();
    }
  });
});
