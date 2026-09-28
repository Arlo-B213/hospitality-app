import { Request, Response } from 'express';
import {
  requireTeam,
  requireMinimumRole,
  enforceTeamBoundary,
  isValidRole,
  isValidTeam,
  roleRequiresTeam,
  canRoleBeAssignedToTeam,
  ROLES,
  ROLE_HIERARCHY,
} from '../src/middleware/rbac';
import { TokenPayload } from '../src/utils/jwt';

describe('RBAC Middleware', () => {
  const createMockReq = (user?: TokenPayload): Request => ({
    headers: {},
    params: {},
    body: {},
    user,
  } as Request);

  const createMockRes = (): Response => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response);

  describe('requireTeam', () => {
    it('should allow admins regardless of team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = requireTeam('FOH');
      middleware(mockReq, mockRes, mockNext);
    });

    it('should allow managers regardless of team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'manager@example.com',
        role: ROLES.MANAGER,
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = requireTeam('BOH');
      middleware(mockReq, mockRes, mockNext);
    });

    it('should allow user with correct team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'lead@example.com',
        role: ROLES.FOH_LEAD,
        team: 'FOH',
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = requireTeam('FOH', 'BOH');
      middleware(mockReq, mockRes, mockNext);
    });

    it('should deny user with wrong team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'chef@example.com',
        role: ROLES.CHEF,
        team: 'BOH',
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const middleware = requireTeam('FOH');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
        })
      );
      done();
    });

    it('should return 401 if user is not authenticated', (done) => {
      const mockReq = createMockReq();
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const middleware = requireTeam('FOH');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      done();
    });
  });

  describe('requireMinimumRole', () => {
    it('should allow admin (highest level)', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = requireMinimumRole(ROLES.MANAGER);
      middleware(mockReq, mockRes, mockNext);
    });

    it('should deny new_hire accessing manager resources', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'newhire@example.com',
        role: ROLES.NEW_HIRE,
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const middleware = requireMinimumRole(ROLES.MANAGER);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      done();
    });

    it('should allow manager accessing assistant manager resources', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'manager@example.com',
        role: ROLES.MANAGER,
      };

      const mockReq = createMockReq(user);
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = requireMinimumRole(ROLES.ASST_MANAGER);
      middleware(mockReq, mockRes, mockNext);
    });

    it('should enforce role hierarchy', (done) => {
      const adminLevel = ROLE_HIERARCHY[ROLES.ADMIN];
      const managerLevel = ROLE_HIERARCHY[ROLES.MANAGER];
      const asstManagerLevel = ROLE_HIERARCHY[ROLES.ASST_MANAGER];

      expect(adminLevel).toBeGreaterThan(managerLevel);
      expect(managerLevel).toBeGreaterThan(asstManagerLevel);
      done();
    });
  });

  describe('enforceTeamBoundary', () => {
    it('should allow admin to access any team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
      };

      const mockReq = createMockReq(user);
      mockReq.params = { team: 'FOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should allow manager to access any team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'manager@example.com',
        role: ROLES.MANAGER,
      };

      const mockReq = createMockReq(user);
      mockReq.params = { team: 'BOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should allow user accessing their own team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'chef@example.com',
        role: ROLES.CHEF,
        team: 'BOH',
      };

      const mockReq = createMockReq(user);
      mockReq.params = { team: 'BOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should deny user accessing different team', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'chef@example.com',
        role: ROLES.CHEF,
        team: 'BOH',
      };

      const mockReq = createMockReq(user);
      mockReq.params = { team: 'FOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      done();
    });

    it('should use team from body if not in params', (done) => {
      const user: TokenPayload = {
        userId: '123',
        email: 'chef@example.com',
        role: ROLES.CHEF,
        team: 'BOH',
      };

      const mockReq = createMockReq(user);
      mockReq.body = { team: 'BOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn(() => done());

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 if user is not authenticated', (done) => {
      const mockReq = createMockReq();
      mockReq.params = { team: 'FOH' };
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const middleware = enforceTeamBoundary();
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      done();
    });
  });
});

describe('RBAC Utilities', () => {
  describe('isValidRole', () => {
    it('should accept all defined roles', () => {
      expect(isValidRole(ROLES.ADMIN)).toBe(true);
      expect(isValidRole(ROLES.MANAGER)).toBe(true);
      expect(isValidRole(ROLES.ASST_MANAGER)).toBe(true);
      expect(isValidRole(ROLES.FOH_LEAD)).toBe(true);
      expect(isValidRole(ROLES.CHEF)).toBe(true);
      expect(isValidRole(ROLES.SOUS_CHEF)).toBe(true);
      expect(isValidRole(ROLES.ASST_CHEF)).toBe(true);
      expect(isValidRole(ROLES.NEW_HIRE)).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('invalid_role')).toBe(false);
      expect(isValidRole('superadmin')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('isValidTeam', () => {
    it('should accept valid teams', () => {
      expect(isValidTeam('FOH')).toBe(true);
      expect(isValidTeam('BOH')).toBe(true);
    });

    it('should accept null/undefined for team-agnostic roles', () => {
      expect(isValidTeam(null)).toBe(true);
      expect(isValidTeam(undefined)).toBe(true);
    });

    it('should reject invalid teams', () => {
      expect(isValidTeam('INVALID')).toBe(false);
      expect(isValidTeam('management')).toBe(false);
    });
  });

  describe('roleRequiresTeam', () => {
    it('should require team for team-specific roles', () => {
      expect(roleRequiresTeam(ROLES.FOH_LEAD)).toBe(true);
      expect(roleRequiresTeam(ROLES.CHEF)).toBe(true);
      expect(roleRequiresTeam(ROLES.SOUS_CHEF)).toBe(true);
      expect(roleRequiresTeam(ROLES.ASST_CHEF)).toBe(true);
      expect(roleRequiresTeam(ROLES.ASST_MANAGER)).toBe(true);
    });

    it('should not require team for team-agnostic roles', () => {
      expect(roleRequiresTeam(ROLES.ADMIN)).toBe(false);
      expect(roleRequiresTeam(ROLES.MANAGER)).toBe(false);
      expect(roleRequiresTeam(ROLES.NEW_HIRE)).toBe(false);
    });
  });

  describe('canRoleBeAssignedToTeam', () => {
    it('should allow FOH_LEAD to be assigned to FOH', () => {
      expect(canRoleBeAssignedToTeam(ROLES.FOH_LEAD, 'FOH')).toBe(true);
    });

    it('should not allow FOH_LEAD to be assigned to BOH', () => {
      expect(canRoleBeAssignedToTeam(ROLES.FOH_LEAD, 'BOH')).toBe(false);
    });

    it('should allow CHEF to be assigned to BOH', () => {
      expect(canRoleBeAssignedToTeam(ROLES.CHEF, 'BOH')).toBe(true);
    });

    it('should not allow CHEF to be assigned to FOH', () => {
      expect(canRoleBeAssignedToTeam(ROLES.CHEF, 'FOH')).toBe(false);
    });

    it('should allow ASST_MANAGER to be assigned to both teams', () => {
      expect(canRoleBeAssignedToTeam(ROLES.ASST_MANAGER, 'FOH')).toBe(true);
      expect(canRoleBeAssignedToTeam(ROLES.ASST_MANAGER, 'BOH')).toBe(true);
    });

    it('should allow team-agnostic roles for any team', () => {
      expect(canRoleBeAssignedToTeam(ROLES.ADMIN, 'FOH')).toBe(true);
      expect(canRoleBeAssignedToTeam(ROLES.ADMIN, 'BOH')).toBe(true);
      expect(canRoleBeAssignedToTeam(ROLES.MANAGER, 'FOH')).toBe(true);
    });
  });
});

describe('Role Hierarchy', () => {
  it('should define all 8 roles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.ADMIN);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.MANAGER);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.ASST_MANAGER);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.FOH_LEAD);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.CHEF);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.SOUS_CHEF);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.ASST_CHEF);
    expect(Object.keys(ROLE_HIERARCHY)).toContain(ROLES.NEW_HIRE);
  });

  it('should have correct hierarchy levels', () => {
    expect(ROLE_HIERARCHY[ROLES.ADMIN]).toBe(5);
    expect(ROLE_HIERARCHY[ROLES.MANAGER]).toBe(4);
    expect(ROLE_HIERARCHY[ROLES.ASST_MANAGER]).toBe(3);
    expect(ROLE_HIERARCHY[ROLES.NEW_HIRE]).toBe(0);
  });

  it('should enforce admin > manager > asst_manager', () => {
    expect(ROLE_HIERARCHY[ROLES.ADMIN]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.MANAGER]);
    expect(ROLE_HIERARCHY[ROLES.MANAGER]).toBeGreaterThan(ROLE_HIERARCHY[ROLES.ASST_MANAGER]);
  });
});

describe('Role and Team Consistency', () => {
  it('should define teams for all team-requiring roles', () => {
    const teamRequiringRoles = [
      ROLES.FOH_LEAD,
      ROLES.CHEF,
      ROLES.SOUS_CHEF,
      ROLES.ASST_CHEF,
      ROLES.ASST_MANAGER,
    ];

    teamRequiringRoles.forEach((role) => {
      expect(roleRequiresTeam(role)).toBe(true);
    });
  });

  it('should have valid teams for all roles', () => {
    Object.values(ROLES).forEach((role) => {
      // Should not throw
      canRoleBeAssignedToTeam(role, 'FOH');
      canRoleBeAssignedToTeam(role, 'BOH');
    });
  });
});
