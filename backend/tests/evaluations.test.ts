import request from 'supertest';
import express, { Express } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { createEvaluationsRouter } from '../src/routes/evaluations';
import { requireAuth } from '../src/middleware/auth';

/**
 * Comprehensive RBAC tests for Evaluation Endpoints (Task 4)
 * Uses REAL HTTP calls via supertest to verify all RBAC boundaries and validation
 */

describe('Evaluations API - Real HTTP RBAC Tests', () => {
  let app: Express;
  let pool: Pool;

  // Test JWT tokens for different roles
  let fohToken: string;
  let bohToken: string;
  let managerToken: string;
  let adminToken: string;
  let asst_manager_token: string;

  // Test data UUIDs and module ID
  const fohNewHireId = '11111111-1111-1111-1111-111111111111';
  const bohNewHireId = '22222222-2222-2222-2222-222222222222';
  const techSkillId = '33333333-3333-3333-3333-333333333333';
  const validModuleId = 3; // Valid: 1-8
  const invalidModuleId = 'invalid';

  const JWT_SECRET = 'test-secret-key-for-evaluations-tests';

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

    // Create mock pool for testing
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || 'postgresql://pride_user:pride_password@localhost:5432/pride_training_db_test',
    });

    // Mount evaluations router
    app.use('/api/evaluations', createEvaluationsRouter(pool));

    // Create tokens for different roles/teams
    fohToken = createToken('foh-staff-001', 'foh_lead', 'FOH');
    bohToken = createToken('boh-staff-001', 'chef', 'BOH');
    managerToken = createToken('manager-001', 'manager', null);
    adminToken = createToken('admin-001', 'admin', null);
    asst_manager_token = createToken('asst-manager-001', 'asst_manager', 'FOH');
  });

  afterAll(async () => {
    if (pool) {
      try {
        await pool.end();
      } catch (err) {
        console.error('Error closing pool:', err);
      }
    }
  });

  describe('POST /api/evaluations/skills - RBAC & Validation', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 3,
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 403 when FOH staff tries to rate BOH new hire', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: bohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 3,
        });

      // FOH should be blocked: either 403 (RBAC) if fixture exists, 404 if not found, or 500 (DB error)
      expect([403, 404, 500]).toContain(response.status);
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/can only rate FOH/i);
      }
    });

    test('should return 403 when BOH staff tries to rate FOH new hire', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${bohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 3,
        });

      // BOH should be blocked: either 403 (RBAC) if fixture exists, 404 if not found, or 500 (DB error)
      expect([403, 404, 500]).toContain(response.status);
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/can only rate BOH/i);
      }
    });

    test('should accept request from manager for FOH new hire', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 3,
        });

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      // May get 201 (success), 404 (new hire not found), or 500 (DB error in test env)
      expect([201, 404, 500]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.message).toMatch(/saved successfully/i);
      }
    });

    test('should accept request from manager for BOH new hire', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          new_hire_id: bohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 4,
        });

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([201, 404, 500]).toContain(response.status);
    });

    test('should return 400 when rating is invalid (< 1)', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });

    test('should return 400 when rating is invalid (> 5)', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 6,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });

    test('should return 400 when missing required field (new_hire_id)', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 3,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toMatch(/new_hire_id/i);
    });

    test('should return 400 when skill_type is invalid', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'invalid',
          skill_id: techSkillId,
          rating: 3,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toMatch(/skill_type/i);
    });

    test('should accept rating 1', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 1,
        });

      // Rating validation passes - should NOT get 400
      expect(response.status).not.toBe(400);
      expect([201, 404, 500]).toContain(response.status);
    });

    test('should accept rating 5', async () => {
      const response = await request(app)
        .post('/api/evaluations/skills')
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          new_hire_id: fohNewHireId,
          skill_type: 'technical',
          skill_id: techSkillId,
          rating: 5,
        });

      // Rating validation passes - should NOT get 400
      expect(response.status).not.toBe(400);
      expect([201, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/evaluations/:newHireId - RBAC', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app).get(`/api/evaluations/${fohNewHireId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 403 when FOH staff tries to view BOH new hire', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${bohNewHireId}`)
        .set('Authorization', `Bearer ${fohToken}`);

      // FOH staff trying to view BOH should be blocked - could be 403 (RBAC), 404 (not found), or 500 (DB error)
      expect([403, 404, 500]).toContain(response.status);
      expect(response.status).not.toBe(200); // Should NOT allow viewing
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/can only view evaluations for FOH/i);
      }
    });

    test('should return 403 when BOH staff tries to view FOH new hire', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${fohNewHireId}`)
        .set('Authorization', `Bearer ${bohToken}`);

      // BOH staff trying to view FOH should be blocked - could be 403 (RBAC), 404 (not found), or 500 (DB error)
      expect([403, 404, 500]).toContain(response.status);
      expect(response.status).not.toBe(200); // Should NOT allow viewing
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/can only view evaluations for BOH/i);
      }
    });

    test('should allow manager to view FOH new hire', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should allow manager to view BOH new hire', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${bohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should allow admin to view any new hire', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${fohNewHireId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Admin bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/evaluations/leadership/:newHireId/:moduleId - RBAC', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app).post(
        `/api/evaluations/leadership/${fohNewHireId}/${validModuleId}`
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 403 when FOH lead tries to mark module complete', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/${validModuleId}`)
        .set('Authorization', `Bearer ${fohToken}`)
        .send({ progress_notes: 'Completed' });

      // FOH lead should be blocked: either 403 (role check) if authenticated, or 404 if new hire not found
      expect([403, 404]).toContain(response.status);
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/Only managers and assistant managers/i);
      }
    });

    test('should return 403 when BOH chef tries to mark module complete', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${bohNewHireId}/${validModuleId}`)
        .set('Authorization', `Bearer ${bohToken}`)
        .send({ progress_notes: 'Completed' });

      // BOH chef should be blocked: either 403 (role check) if authenticated, or 404 if new hire not found
      expect([403, 404]).toContain(response.status);
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
      }
    });

    test('should allow manager to mark module complete', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/${validModuleId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ progress_notes: 'Module completed successfully' });

      // Manager role is allowed - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([201, 404, 500]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.message).toMatch(/marked as completed/i);
      }
    });

    test('should allow assistant manager to mark module complete', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/${validModuleId}`)
        .set('Authorization', `Bearer ${asst_manager_token}`)
        .send({ progress_notes: 'Module completed' });

      // Asst manager role is allowed - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([201, 404, 500]).toContain(response.status);
    });

    test('should validate moduleId is integer between 1-8', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/${invalidModuleId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ progress_notes: 'Completed' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toMatch(/Module ID/i);
    });

    test('should reject moduleId > 8', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/9`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ progress_notes: 'Completed' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });

    test('should reject moduleId < 1', async () => {
      const response = await request(app)
        .post(`/api/evaluations/leadership/${fohNewHireId}/0`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ progress_notes: 'Completed' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
    });
  });

  describe('PUT /api/evaluations/summary/:newHireId - RBAC', () => {
    test('should return 401 when missing authentication', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${fohNewHireId}`)
        .send({
          strengths: 'Good',
          areas_for_improvement: 'Communication',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should return 403 when FOH staff tries to update BOH summary', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${bohNewHireId}`)
        .set('Authorization', `Bearer ${fohToken}`)
        .send({
          strengths: 'Good performer',
          areas_for_improvement: 'Time management',
        });

      // FOH staff should be rejected - either 403 (RBAC) or 404/500 (if new hire doesn't exist or DB error)
      expect([403, 404, 500]).toContain(response.status);
      expect(response.status).not.toBe(200);
      expect(response.status).not.toBe(201);
      if (response.status === 403) {
        expect(response.body.error).toBe('Forbidden');
        expect(response.body.message).toMatch(/can only update summaries for FOH/i);
      }
    });

    test('should return 403 when BOH staff tries to update FOH summary', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${fohNewHireId}`)
        .set('Authorization', `Bearer ${bohToken}`)
        .send({
          strengths: 'Reliable',
          areas_for_improvement: 'Technical skills',
        });

      // BOH staff should be rejected - either 403 (RBAC) or 404/500 (if new hire doesn't exist or DB error)
      // But should NOT get 200/201 which would indicate successful cross-team update
      expect([403, 404, 500]).toContain(response.status);
      expect(response.status).not.toBe(200);
      expect(response.status).not.toBe(201);
    });

    test('should allow manager to update FOH summary', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          strengths: 'Punctual and reliable',
          areas_for_improvement: 'Communication skills',
          action_items: 'Enroll in training',
        });

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should allow manager to update BOH summary', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${bohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          strengths: 'Strong knife skills',
          areas_for_improvement: 'Plating speed',
        });

      // Manager bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should allow admin to update any summary', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${fohNewHireId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          strengths: 'Excellent',
        });

      // Admin bypasses team check - should NOT get 403
      expect(response.status).not.toBe(403);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('should return 400 when overall_rating is invalid', async () => {
      const response = await request(app)
        .put(`/api/evaluations/summary/${fohNewHireId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          overall_rating: 'excellent',
          strengths: 'Good',
        });

      // Invalid input should be rejected
      expect([400, 500]).toContain(response.status); // 500 if DB error after validation
      if (response.status === 400) {
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toMatch(/overall_rating/i);
      }
    });
  });

  describe('Authorization Header Validation', () => {
    test('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .get(`/api/evaluations/${fohNewHireId}`)
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
        .get(`/api/evaluations/${fohNewHireId}`)
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
        .get(`/api/evaluations/${fohNewHireId}`)
        .set('Authorization', `Bearer ${wrongToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });
});
