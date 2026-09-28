import request from 'supertest';
import express, { Express } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { createAnalyticsRouter } from '../src/routes/analytics';
import { requireAuth } from '../src/middleware/auth';

/**
 * Comprehensive RBAC and calculation tests for Analytics Endpoints (Task 5)
 * Uses REAL HTTP calls via supertest to verify RBAC boundaries and analytics calculations
 * Tests verify: auth, RBAC (team-based visibility), calculations (days, completion %, skill averages)
 */

describe('Analytics API - Real HTTP Tests', () => {
  let app: Express;
  let pool: Pool;

  // Test JWT tokens for different roles
  let fohStaffToken: string;
  let bohStaffToken: string;
  let managerToken: string;
  let adminToken: string;

  // Test data UUIDs
  const fohNewHireId = '11111111-1111-1111-1111-111111111111';
  const bohNewHireId = '22222222-2222-2222-2222-222222222222';
  const unknownNewHireId = '99999999-9999-9999-9999-999999999999';

  const JWT_SECRET = 'test-secret-key-for-analytics-tests';

  // Helper to create JWT tokens
  const createToken = (userId: string, role: string, team: string | null) => {
    return jwt.sign(
      {
        userId,
        email: `${role}@test.com`,
        role,
        team,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  };

  beforeAll(async () => {
    // Set JWT_SECRET environment variable for token verification
    process.env.JWT_SECRET = JWT_SECRET;

    // Create Express app
    app = express();
    app.use(express.json());

    // Use real requireAuth middleware from production code
    app.use(requireAuth);

    // Create pool for testing
    pool = new Pool({
      connectionString:
        process.env.TEST_DATABASE_URL ||
        'postgresql://pride_user:pride_password@localhost:5432/pride_training_db_test',
    });

    // Mount analytics router
    app.use('/api/analytics', createAnalyticsRouter(pool));

    // Create tokens for different roles/teams
    fohStaffToken = createToken('foh-staff-001', 'foh_lead', 'FOH');
    bohStaffToken = createToken('boh-staff-001', 'chef', 'BOH');
    managerToken = createToken('manager-001', 'manager', null);
    adminToken = createToken('admin-001', 'admin', null);

    // Seed test data in database
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();

    if (pool) {
      try {
        await pool.end();
      } catch (err) {
        console.error('Error closing pool:', err);
      }
    }
  });

  /**
   * Seed test database with fixture data
   * Creates new hires and skill ratings for testing analytics calculations
   */
  async function seedTestData() {
    try {
      // Create FOH new hire with start date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const fohStartDate = thirtyDaysAgo.toISOString().split('T')[0];

      await pool.query(
        `INSERT INTO new_hires (id, user_id, department, start_date, day_90_target_date, hire_manager_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          fohNewHireId,
          'foh-user-001',
          'FOH',
          fohStartDate,
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
          'manager-001',
        ]
      );

      // Create BOH new hire with start date 20 days ago
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

      const bohStartDate = twentyDaysAgo.toISOString().split('T')[0];

      await pool.query(
        `INSERT INTO new_hires (id, user_id, department, start_date, day_90_target_date, hire_manager_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          bohNewHireId,
          'boh-user-001',
          'BOH',
          bohStartDate,
          new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 70 days from now
          'manager-001',
        ]
      );

      // Create technical skills if they don't exist
      await pool.query(
        `INSERT INTO technical_skills (id, department, name, is_active, created_at, updated_at)
         VALUES
           ('tech-skill-001', 'FOH', 'POS System', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           ('tech-skill-002', 'FOH', 'Point of Sale', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           ('tech-skill-003', 'BOH', 'Food Safety', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`
      );

      // Create soft skills if they don't exist
      await pool.query(
        `INSERT INTO soft_skills (id, name, is_active, created_at, updated_at)
         VALUES
           ('soft-skill-001', 'Communication', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           ('soft-skill-002', 'Teamwork', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`
      );

      // Create skill assessments for FOH new hire (4 ratings: 2 technical, 2 soft)
      // Technical: advanced (4), intermediate (3) -> avg 3.5
      // Soft: expert (5), advanced (4) -> avg 4.5
      // Overall: (3.5 + 4.5) / 2 = 4.0
      await pool.query(
        `INSERT INTO skill_assessments
         (id, new_hire_id, skill_type, skill_id, assessor_id, proficiency_level, assessment_date, is_completed, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, 'technical', $2, 'assessor-001', 'advanced', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 'technical', $3, 'assessor-001', 'intermediate', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 'soft', $4, 'assessor-001', 'expert', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 'soft', $5, 'assessor-001', 'advanced', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [fohNewHireId, 'tech-skill-001', 'tech-skill-002', 'soft-skill-001', 'soft-skill-002']
      );

      // Create skill assessments for BOH new hire (3 ratings: 1 technical, 2 soft)
      // Technical: expert (5) -> avg 5.0
      // Soft: advanced (4), advanced (4) -> avg 4.0
      // Overall: (5.0 + 4.0) / 2 = 4.5
      await pool.query(
        `INSERT INTO skill_assessments
         (id, new_hire_id, skill_type, skill_id, assessor_id, proficiency_level, assessment_date, is_completed, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, 'technical', $2, 'assessor-001', 'expert', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 'soft', $3, 'assessor-001', 'advanced', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 'soft', $4, 'assessor-001', 'advanced', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [bohNewHireId, 'tech-skill-003', 'soft-skill-001', 'soft-skill-002']
      );

      // Create leadership modules if they don't exist
      await pool.query(
        `INSERT INTO leadership_modules (id, title, description, is_active, created_at, updated_at)
         VALUES
           (1, 'Module 1', 'First module', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (2, 'Module 2', 'Second module', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (3, 'Module 3', 'Third module', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`
      );

      // Mark some leadership modules as completed for FOH new hire
      await pool.query(
        `INSERT INTO leadership_progress
         (id, new_hire_id, leadership_module_id, status, completion_date, is_completed, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, 1, 'completed', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
           (gen_random_uuid(), $1, 2, 'completed', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [fohNewHireId]
      );

      // Mark one leadership module as completed for BOH new hire
      await pool.query(
        `INSERT INTO leadership_progress
         (id, new_hire_id, leadership_module_id, status, completion_date, is_completed, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, 1, 'completed', CURRENT_DATE, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [bohNewHireId]
      );

      console.log('Test data seeded successfully');
    } catch (error) {
      console.error('Error seeding test data:', error);
      // Don't throw - allow tests to run even if seeding partially fails
    }
  }

  /**
   * Clean up test data after tests complete
   */
  async function cleanupTestData() {
    try {
      // Delete in reverse order of foreign key dependencies
      await pool.query('DELETE FROM leadership_progress WHERE new_hire_id IN ($1, $2)', [
        fohNewHireId,
        bohNewHireId,
      ]);

      await pool.query('DELETE FROM skill_assessments WHERE new_hire_id IN ($1, $2)', [
        fohNewHireId,
        bohNewHireId,
      ]);

      await pool.query('DELETE FROM new_hires WHERE id IN ($1, $2)', [
        fohNewHireId,
        bohNewHireId,
      ]);

      console.log('Test data cleaned up');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  describe('GET /api/analytics/:newHireId - Individual Analytics', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app).get(`/api/analytics/${fohNewHireId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 404 when new hire does not exist', async () => {
      const response = await request(app)
        .get(`/api/analytics/${unknownNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toMatch(/New hire not found/i);
    });

    test('should return 403 when FOH staff tries to view BOH analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${bohNewHireId}`)
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toMatch(/can only view analytics for FOH/i);
    });

    test('should return 403 when BOH staff tries to view FOH analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toMatch(/can only view analytics for BOH/i);
    });

    test('should allow FOH staff to view FOH new hire analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('new_hire_id', fohNewHireId);
    });

    test('should allow manager to view FOH analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('new_hire_id', fohNewHireId);
    });

    test('should allow manager to view BOH analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${bohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('new_hire_id', bohNewHireId);
    });

    test('should allow admin to view any analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('new_hire_id', fohNewHireId);
    });

    test('should calculate correct days_elapsed (~30 days for FOH new hire)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      // Should be approximately 30 (±1 for timing variations)
      expect(response.body.days_elapsed).toBeGreaterThanOrEqual(29);
      expect(response.body.days_elapsed).toBeLessThanOrEqual(31);
    });

    test('should calculate correct days_remaining (60 days for FOH new hire)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      // Should be approximately 60 (90 - 30)
      expect(response.body.days_remaining).toBeGreaterThanOrEqual(59);
      expect(response.body.days_remaining).toBeLessThanOrEqual(61);
    });

    test('should calculate correct completion_percentage (~33% for 30 days elapsed)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      // Should be approximately 33.33 (30/90 * 100)
      expect(response.body.completion_percentage).toBeGreaterThanOrEqual(32);
      expect(response.body.completion_percentage).toBeLessThanOrEqual(35);
    });

    test('should calculate correct technical_skills_avg (3.5 for FOH: 4,3)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.technical_skills_avg).toBe(3.5);
    });

    test('should calculate correct soft_skills_avg (4.5 for FOH: 5,4)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.soft_skills_avg).toBe(4.5);
    });

    test('should report correct leadership_modules_complete (2 for FOH)', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.leadership_modules_complete).toBe(2);
    });

    test('should include skill_progress array with correct ratings', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.skill_progress)).toBe(true);
      expect(response.body.skill_progress.length).toBe(4); // 2 technical + 2 soft

      // Verify technical skills
      const technicalSkills = response.body.skill_progress.filter(
        (s: any) => s.skill_type === 'technical'
      );
      expect(technicalSkills).toContainEqual(
        expect.objectContaining({ current_rating: 4 })
      );
      expect(technicalSkills).toContainEqual(
        expect.objectContaining({ current_rating: 3 })
      );

      // Verify soft skills
      const softSkills = response.body.skill_progress.filter(
        (s: any) => s.skill_type === 'soft_skill'
      );
      expect(softSkills).toContainEqual(
        expect.objectContaining({ current_rating: 5 })
      );
      expect(softSkills).toContainEqual(
        expect.objectContaining({ current_rating: 4 })
      );
    });

    test('should include weekly_trend array', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.weekly_trend)).toBe(true);
      // Should have at least one week of data
      expect(response.body.weekly_trend.length).toBeGreaterThan(0);

      // Verify structure
      response.body.weekly_trend.forEach((trend: any) => {
        expect(trend).toHaveProperty('week');
        expect(trend).toHaveProperty('avg_rating');
        expect(typeof trend.week).toBe('number');
        expect(typeof trend.avg_rating).toBe('number');
      });
    });

    test('should include cohort_comparison with percentile and peer_average', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cohort_comparison');
      expect(response.body.cohort_comparison).toHaveProperty('user_percentile');
      expect(response.body.cohort_comparison).toHaveProperty('peer_average');

      const { user_percentile, peer_average } = response.body.cohort_comparison;
      expect(typeof user_percentile).toBe('number');
      expect(typeof peer_average).toBe('number');
      expect(user_percentile).toBeGreaterThanOrEqual(0);
      expect(user_percentile).toBeLessThanOrEqual(100);
    });

    test('should return 100 percentile for highest scorer in cohort', async () => {
      // Create 3 more FOH new hires with known ratings
      const peer1Id = '88888888-8888-8888-8888-888888888881';
      const peer2Id = '88888888-8888-8888-8888-888888888882';
      const topScorerId = '88888888-8888-8888-8888-888888888883';

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dateStr = startDate.toISOString().split('T')[0];
      const targetDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Insert peers and top scorer
      await pool.query(
        `INSERT INTO new_hires (id, user_id, department, start_date, day_90_target_date, hire_manager_id, is_active, created_at, updated_at)
         VALUES
         ($1, $2, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($6, $7, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($8, $9, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          peer1Id,
          'peer1-user',
          dateStr,
          targetDate,
          'manager-001',
          peer2Id,
          'peer2-user',
          topScorerId,
          'top-scorer-user',
        ]
      );

      // Get technical skill IDs for FOH
      const skillsRes = await pool.query(
        `SELECT id FROM technical_skills WHERE department = 'FOH' LIMIT 2`
      );
      const [skill1, skill2] = skillsRes.rows.map(r => r.id);

      // Rate peers lower and top scorer highest
      await pool.query(
        `INSERT INTO skill_assessments (new_hire_id, skill_id, rating, updated_by, updated_at)
         VALUES
         ($1, $2, 2, $4, CURRENT_TIMESTAMP),
         ($1, $3, 2, $4, CURRENT_TIMESTAMP),
         ($5, $2, 3, $4, CURRENT_TIMESTAMP),
         ($5, $3, 3, $4, CURRENT_TIMESTAMP),
         ($6, $2, 5, $4, CURRENT_TIMESTAMP),
         ($6, $3, 5, $4, CURRENT_TIMESTAMP)`,
        [peer1Id, skill1, skill2, 'foh-staff-001', peer2Id, topScorerId]
      );

      const response = await request(app)
        .get(`/api/analytics/${topScorerId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      // Top scorer (5.0) is above both peers (2.0, 3.0) → 100 percentile
      expect(response.body.cohort_comparison.user_percentile).toBe(100);
    });

    test('should return 0 percentile for lowest scorer in cohort', async () => {
      const lowScorerId = '99999999-9999-9999-9999-999999999999';
      const peer1Id = '99999999-9999-9999-9999-999999999991';
      const peer2Id = '99999999-9999-9999-9999-999999999992';

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dateStr = startDate.toISOString().split('T')[0];
      const targetDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      await pool.query(
        `INSERT INTO new_hires (id, user_id, department, start_date, day_90_target_date, hire_manager_id, is_active, created_at, updated_at)
         VALUES
         ($1, $2, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($6, $7, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($8, $9, 'FOH', $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [lowScorerId, 'low-scorer-user', dateStr, targetDate, 'manager-001', peer1Id, 'peer1b-user', peer2Id, 'peer2b-user']
      );

      const skillsRes = await pool.query(
        `SELECT id FROM technical_skills WHERE department = 'FOH' LIMIT 2`
      );
      const [skill1, skill2] = skillsRes.rows.map(r => r.id);

      // Low scorer gets 1.0, peers get higher
      await pool.query(
        `INSERT INTO skill_assessments (new_hire_id, skill_id, rating, updated_by, updated_at)
         VALUES
         ($1, $2, 1, $4, CURRENT_TIMESTAMP),
         ($1, $3, 1, $4, CURRENT_TIMESTAMP),
         ($5, $2, 4, $4, CURRENT_TIMESTAMP),
         ($5, $3, 4, $4, CURRENT_TIMESTAMP),
         ($6, $2, 5, $4, CURRENT_TIMESTAMP),
         ($6, $3, 5, $4, CURRENT_TIMESTAMP)`,
        [lowScorerId, skill1, skill2, 'foh-staff-001', peer1Id, peer2Id]
      );

      const response = await request(app)
        .get(`/api/analytics/${lowScorerId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      // Low scorer (1.0) is below both peers (4.0, 5.0) → 0 percentile
      expect(response.body.cohort_comparison.user_percentile).toBe(0);
    });

    test('should return 0 for technical and soft averages when no ratings exist', async () => {
      // Create a new hire without ratings
      const noRatingsNewHireId = '77777777-7777-7777-7777-777777777777';
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fohStartDate = thirtyDaysAgo.toISOString().split('T')[0];

      try {
        await pool.query(
          `INSERT INTO new_hires (id, user_id, department, start_date, day_90_target_date, hire_manager_id, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [
            noRatingsNewHireId,
            'no-ratings-user',
            'FOH',
            fohStartDate,
            new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'manager-001',
          ]
        );

        const response = await request(app)
          .get(`/api/analytics/${noRatingsNewHireId}`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.technical_skills_avg).toBe(0);
        expect(response.body.soft_skills_avg).toBe(0);
        expect(response.body.skill_progress.length).toBe(0);

        // Cleanup
        await pool.query('DELETE FROM new_hires WHERE id = $1', [noRatingsNewHireId]);
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });
  });

  describe('GET /api/analytics/cohort/summary - Cohort Analytics', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app).get('/api/analytics/cohort/summary');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 403 when FOH staff tries to view cohort analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toMatch(/Only managers and admins/i);
    });

    test('should return 403 when BOH staff tries to view cohort analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toMatch(/Only managers and admins/i);
    });

    test('should allow manager to view cohort analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('department');
      expect(response.body).toHaveProperty('total_members');
      expect(response.body).toHaveProperty('members');
    });

    test('should allow admin to view cohort analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('department');
      expect(response.body).toHaveProperty('total_members');
      expect(response.body).toHaveProperty('members');
    });

    test('should default to FOH when no department specified', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.department).toBe('FOH');
    });

    test('should filter by FOH department when specified', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary?department=FOH')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.department).toBe('FOH');
      expect(response.body.total_members).toBeGreaterThanOrEqual(1);

      // All members should be FOH
      response.body.members.forEach((member: any) => {
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('avg_rating');
        expect(member).toHaveProperty('rank');
      });
    });

    test('should filter by BOH department when specified', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary?department=BOH')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.department).toBe('BOH');
      expect(response.body.total_members).toBeGreaterThanOrEqual(1);
    });

    test('should return 400 for invalid department', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary?department=INVALID')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toMatch(/Invalid department/i);
    });

    test('should rank members by performance (highest avg_rating first)', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary?department=FOH')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      const members = response.body.members;

      // Check that rankings are sequential starting from 1
      if (members.length > 0) {
        expect(members[0].rank).toBe(1);
        if (members.length > 1) {
          expect(members[1].rank).toBe(2);
        }
      }

      // Check that averages are in descending order
      for (let i = 0; i < members.length - 1; i++) {
        expect(members[i].avg_rating).toBeGreaterThanOrEqual(members[i + 1].avg_rating);
      }
    });

    test('should include timestamp in response', async () => {
      const response = await request(app)
        .get('/api/analytics/cohort/summary')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Authorization Header Validation', () => {
    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123', role: 'manager', team: null },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should reject tokens signed with wrong secret', async () => {
      const wrongToken = jwt.sign(
        { userId: 'user-123', role: 'manager', team: null },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get(`/api/analytics/${fohNewHireId}`)
        .set('Authorization', `Bearer ${wrongToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });
});
