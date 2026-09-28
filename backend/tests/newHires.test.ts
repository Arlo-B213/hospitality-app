import request from 'supertest';
import { Express } from 'express';
import express from 'express';
import { createNewHiresRouter } from '../src/routes/newHires';
import { generateToken, TokenPayload } from '../src/utils/jwt';

// Mock the pool
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

describe('New Hires API Routes', () => {
  let app: Express;
  let mockPool: any;

  // Test tokens
  let adminToken: string;
  let managerFOHToken: string;
  let managerBOHToken: string;
  let fohStaffToken: string;
  let bohStaffToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-min-32';

    // Initialize Express app with mock pool
    mockPool = {
      query: jest.fn() as any,
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api/new-hires', createNewHiresRouter(mockPool));

    // Generate test tokens
    const adminPayload: TokenPayload = {
      userId: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    };
    adminToken = generateToken(adminPayload);

    const managerFOHPayload: TokenPayload = {
      userId: 'manager-foh-1',
      email: 'manager_foh@test.com',
      role: 'manager',
      team: 'FOH',
    };
    managerFOHToken = generateToken(managerFOHPayload);

    const managerBOHPayload: TokenPayload = {
      userId: 'manager-boh-1',
      email: 'manager_boh@test.com',
      role: 'manager',
      team: 'BOH',
    };
    managerBOHToken = generateToken(managerBOHPayload);

    const fohStaffPayload: TokenPayload = {
      userId: 'staff-foh-1',
      email: 'staff_foh@test.com',
      role: 'foh_lead',
      team: 'FOH',
    };
    fohStaffToken = generateToken(fohStaffPayload);

    const bohStaffPayload: TokenPayload = {
      userId: 'staff-boh-1',
      email: 'staff_boh@test.com',
      role: 'chef',
      team: 'BOH',
    };
    bohStaffToken = generateToken(bohStaffPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/new-hires', () => {
    test('should create a new hire with valid manager token', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      const newHireData = {
        id: 'new-hire-1',
        user_id: 'user-1',
        department: 'FOH',
        start_date: startDate,
        day_90_target_date: day90Date,
        hire_manager_id: 'manager-foh-1',
        is_active: true,
        created_at: startDate,
        updated_at: startDate,
      };

      // Mock user existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', team: 'FOH' }],
      } as any);

      // Mock new hire creation
      mockPool.query.mockResolvedValueOnce({
        rows: [newHireData],
      } as any);

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'user-1',
          department: 'FOH',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new-hire-1');
      expect(response.body.department).toBe('FOH');
      expect(response.body.hire_manager_id).toBe('manager-foh-1');
    });

    test('should require authentication', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      const response = await request(app).post('/api/new-hires').send({
        user_id: 'user-1',
        department: 'FOH',
        start_date: startDate.toISOString(),
        day_90_target_date: day90Date.toISOString(),
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should require manager or asst_manager role', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${fohStaffToken}`)
        .send({
          user_id: 'user-1',
          department: 'FOH',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'user-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should validate department value', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'user-1',
          department: 'INVALID',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid department');
    });

    test('should validate date ordering', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() - 1); // Before start date

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'user-1',
          department: 'FOH',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('day_90_target_date must be after start_date');
    });

    test('should validate user exists', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      mockPool.query.mockResolvedValueOnce({
        rows: [], // User not found
      } as any);

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'nonexistent-user',
          department: 'FOH',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('User not found');
    });

    test('should set hire_manager_id from authenticated user', async () => {
      const startDate = new Date();
      const day90Date = new Date();
      day90Date.setDate(day90Date.getDate() + 90);

      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1' }],
      } as any);

      mockPool.query.mockResolvedValueOnce({
        rows: [{
          id: 'new-hire-1',
          user_id: 'user-1',
          department: 'FOH',
          start_date: startDate,
          day_90_target_date: day90Date,
          hire_manager_id: 'manager-foh-1',
          is_active: true,
          created_at: startDate,
          updated_at: startDate,
        }],
      } as any);

      const response = await request(app)
        .post('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          user_id: 'user-1',
          department: 'FOH',
          start_date: startDate.toISOString(),
          day_90_target_date: day90Date.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.hire_manager_id).toBe('manager-foh-1');
    });
  });

  describe('GET /api/new-hires', () => {
    test('should list all new hires for admin', async () => {
      const hires = [
        { id: '1', department: 'FOH', is_active: true },
        { id: '2', department: 'BOH', is_active: true },
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: hires,
      } as any);

      const response = await request(app)
        .get('/api/new-hires')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should list only FOH new hires for FOH staff', async () => {
      const hires = [
        { id: '1', department: 'FOH', is_active: true },
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: hires,
      } as any);

      const response = await request(app)
        .get('/api/new-hires')
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((h: any) => h.department === 'FOH')).toBe(true);
    });

    test('should list only BOH new hires for BOH staff', async () => {
      const hires = [
        { id: '2', department: 'BOH', is_active: true },
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: hires,
      } as any);

      const response = await request(app)
        .get('/api/new-hires')
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((h: any) => h.department === 'BOH')).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/new-hires');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should deny cross-team filtering for non-managers', async () => {
      const response = await request(app)
        .get('/api/new-hires?department=BOH')
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });
  });

  describe('GET /api/new-hires/:id', () => {
    test('should retrieve new hire for authorized user', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
        start_date: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerFOHToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('hire-1');
      expect(response.body.department).toBe('FOH');
    });

    test('should deny access to user from different team', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('should allow manager from different team to access', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerBOHToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('hire-1');
    });

    test('should return 404 for non-existent new hire', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/nonexistent')
        .set('Authorization', `Bearer ${managerFOHToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/new-hires/hire-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/new-hires/:id', () => {
    test('should update new hire with valid manager token', async () => {
      const startDate = new Date();
      const newDay90Date = new Date();
      newDay90Date.setDate(newDay90Date.getDate() + 95);

      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
        start_date: startDate,
        day_90_target_date: startDate,
      };

      const updatedHire = {
        ...hire,
        day_90_target_date: newDay90Date,
      };

      // First query: get existing hire
      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      // Second query: update hire
      mockPool.query.mockResolvedValueOnce({
        rows: [updatedHire],
      } as any);

      const response = await request(app)
        .put('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          day_90_target_date: newDay90Date.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('hire-1');
    });

    test('should require manager or asst_manager role', async () => {
      const response = await request(app)
        .put('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${fohStaffToken}`)
        .send({
          is_active: false,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('should deny update for user from different team', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .put('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${bohStaffToken}`)
        .send({
          is_active: false,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('should allow updating is_active status', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
        start_date: new Date(),
        day_90_target_date: new Date(),
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      mockPool.query.mockResolvedValueOnce({
        rows: [{ ...hire, is_active: false }],
      } as any);

      const response = await request(app)
        .put('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          is_active: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.is_active).toBe(false);
    });

    test('should return 404 for non-existent new hire', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
      } as any);

      const response = await request(app)
        .put('/api/new-hires/nonexistent')
        .set('Authorization', `Bearer ${managerFOHToken}`)
        .send({
          is_active: false,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/new-hires/hire-1')
        .send({
          is_active: false,
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/new-hires/:id', () => {
    test('should soft delete new hire with valid manager token', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      mockPool.query.mockResolvedValueOnce({
        rows: [],
      } as any);

      const response = await request(app)
        .delete('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerFOHToken}`);

      expect(response.status).toBe(204);
    });

    test('should require manager or asst_manager role', async () => {
      const response = await request(app)
        .delete('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('should deny delete for user from different team', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .delete('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(403);
    });

    test('should require authentication', async () => {
      const response = await request(app).delete('/api/new-hires/hire-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should check RBAC before deleting', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      // Manager from different team can still delete (managers have full access)
      const response = await request(app)
        .delete('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${managerBOHToken}`);

      // Should succeed because managers can manage all teams
      expect([200, 204]).toContain(response.status);
    });
  });

  describe('RBAC Security Boundaries', () => {
    test('FOH staff cannot see BOH new hires', async () => {
      const hire = {
        id: 'hire-2',
        department: 'BOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/hire-2')
        .set('Authorization', `Bearer ${fohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('BOH staff cannot see FOH new hires', async () => {
      const hire = {
        id: 'hire-1',
        department: 'FOH',
        is_active: true,
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [hire],
      } as any);

      const response = await request(app)
        .get('/api/new-hires/hire-1')
        .set('Authorization', `Bearer ${bohStaffToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    test('Manager can see both FOH and BOH new hires', async () => {
      const hires = [
        { id: '1', department: 'FOH', is_active: true },
        { id: '2', department: 'BOH', is_active: true },
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: hires,
      } as any);

      const response = await request(app)
        .get('/api/new-hires')
        .set('Authorization', `Bearer ${managerFOHToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Admin can see all new hires regardless of team', async () => {
      const hires = [
        { id: '1', department: 'FOH', is_active: true },
        { id: '2', department: 'BOH', is_active: true },
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: hires,
      } as any);

      const response = await request(app)
        .get('/api/new-hires')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
