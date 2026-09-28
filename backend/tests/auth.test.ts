import { Pool } from 'pg';
import { generateToken, verifyToken, extractToken, TokenPayload } from '../src/utils/jwt';
import { UserRepository } from '../src/models/User';
import { AuthService } from '../src/services/AuthService';
import { AuditService } from '../src/services/AuditService';
import { Request, Response } from 'express';
import { requireAuth, requireRole } from '../src/middleware/auth';

// Mock setup
const mockPool = {
  query: jest.fn(),
} as unknown as Pool;

describe('JWT Utils', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-min-32';
    process.env.JWT_EXPIRATION = '7d';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
        team: 'FOH',
      };

      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should throw error if JWT_SECRET is not configured', () => {
      delete process.env.JWT_SECRET;
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      expect(() => generateToken(payload)).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
        team: 'FOH',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.team).toBe(payload.team);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error if JWT_SECRET is not configured', () => {
      delete process.env.JWT_SECRET;
      const token = 'some.valid.looking.token';

      expect(() => verifyToken(token)).toThrow('JWT_SECRET is not configured');
    });

    it('should throw specific error for expired token', () => {
      process.env.JWT_EXPIRATION = '-1h'; // Expired token
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      const expiredToken = generateToken(payload);

      // Reset expiration to normal
      process.env.JWT_EXPIRATION = '7d';

      // Wait a bit to ensure expiration
      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });

  describe('extractToken', () => {
    it('should extract token from Authorization header', () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token-string',
        },
      } as Request;

      const token = extractToken(mockReq);
      expect(token).toBe('valid-token-string');
    });

    it('should return null if no Authorization header', () => {
      const mockReq = {
        headers: {},
      } as Request;

      const token = extractToken(mockReq);
      expect(token).toBeNull();
    });

    it('should return null if Authorization header is malformed', () => {
      const mockReq = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      } as Request;

      const token = extractToken(mockReq);
      expect(token).toBeNull();
    });

    it('should return null if Bearer prefix is missing', () => {
      const mockReq = {
        headers: {
          authorization: 'token-without-bearer-prefix',
        },
      } as Request;

      const token = extractToken(mockReq);
      expect(token).toBeNull();
    });
  });
});

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let auditService: AuditService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-min-32';
    process.env.BCRYPT_ROUNDS = '10'; // Faster for tests

    userRepository = new UserRepository(mockPool);
    auditService = new AuditService(mockPool);
    authService = new AuthService(userRepository, auditService);
  });

  describe('register', () => {
    it('should register a new user as new_hire (forced role)', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe',
        // role is ignored in public registration
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: '123',
        email: userData.email,
        password_hash: 'hashed_password',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'new_hire', // Always new_hire for public signup
        team: undefined,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await authService.register(userData);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.role).toBe('new_hire');
    });

    it('should REJECT privilege escalation - admin role in public register', async () => {
      const userData = {
        email: 'attacker@example.com',
        password: 'SecurePassword123',
        firstName: 'Attacker',
        lastName: 'User',
        role: 'admin', // PRIVILEGE ESCALATION ATTEMPT
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.register(userData)).rejects.toThrow(
        'Public registration only allows new_hire role'
      );
    });

    it('should REJECT privilege escalation - manager role in public register', async () => {
      const userData = {
        email: 'fake@example.com',
        password: 'SecurePassword123',
        firstName: 'Fake',
        lastName: 'Manager',
        role: 'manager',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.register(userData)).rejects.toThrow(
        'Public registration only allows new_hire role'
      );
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: 'existing-id',
        email: userData.email,
        password_hash: 'hash',
        first_name: 'Jane',
        last_name: 'Doe',
        role: 'manager',
        team: 'FOH',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
    });

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        role: 'new_hire',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.register(userData)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error for missing required fields', async () => {
      const userData = {
        email: '',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(authService.register(userData)).rejects.toThrow('Missing required fields');
    });
  });

  describe('createUser (admin-only)', () => {
    it('should create user with privileged role and team', async () => {
      const userData = {
        email: 'manager@example.com',
        password: 'SecurePassword123',
        firstName: 'Jane',
        lastName: 'Manager',
        role: 'manager',
        team: undefined, // Managers don't require team
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: '456',
        email: userData.email,
        password_hash: 'hashed_password',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        team: userData.team,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await authService.createUser(userData);

      expect(result.token).toBeDefined();
      expect(result.user.role).toBe('manager');
    });

    it('should create chef with BOH team', async () => {
      const userData = {
        email: 'chef@example.com',
        password: 'SecurePassword123',
        firstName: 'Bob',
        lastName: 'Chef',
        role: 'chef',
        team: 'BOH',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: '789',
        email: userData.email,
        password_hash: 'hashed_password',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        team: userData.team,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await authService.createUser(userData);

      expect(result.user.role).toBe('chef');
      expect(result.user.team).toBe('BOH');
    });

    it('should reject invalid role', async () => {
      const userData = {
        email: 'fake@example.com',
        password: 'SecurePassword123',
        firstName: 'Fake',
        lastName: 'Role',
        role: 'invalid_role',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.createUser(userData)).rejects.toThrow('Invalid role');
    });

    it('should reject invalid team assignment for role', async () => {
      const userData = {
        email: 'chef@example.com',
        password: 'SecurePassword123',
        firstName: 'Bob',
        lastName: 'Chef',
        role: 'chef',
        team: 'FOH', // INVALID: Chef can only be BOH
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.createUser(userData)).rejects.toThrow(
        'cannot be assigned to team'
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      };

      const hashedPassword = await authService.hashPassword(loginData.password);

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '123',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.spyOn(userRepository, 'updateLastLogin').mockResolvedValueOnce();

      const result = await authService.login(loginData);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.user.role).toBe('manager');
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const correctPassword = 'SecurePassword123';
      const hashedPassword = await authService.hashPassword(correctPassword);

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '123',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(authService.login(loginData)).rejects.toThrow('Invalid email or password');
    });

    it('should update last login on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      };

      const hashedPassword = await authService.hashPassword(loginData.password);

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '123',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        team: undefined,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const updateLastLoginSpy = jest
        .spyOn(userRepository, 'updateLastLogin')
        .mockResolvedValueOnce();

      await authService.login(loginData);

      expect(updateLastLoginSpy).toHaveBeenCalledWith('123');
    });

    it('should persist team across login/logout/login cycle', async () => {
      const loginData = {
        email: 'chef@example.com',
        password: 'SecurePassword123',
      };

      const hashedPassword = await authService.hashPassword(loginData.password);

      // First login
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '789',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'Bob',
        last_name: 'Chef',
        role: 'chef',
        team: 'BOH', // PERSISTED TEAM
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.spyOn(userRepository, 'updateLastLogin').mockResolvedValueOnce();

      const result1 = await authService.login(loginData);

      // Verify team is in token
      expect(result1.user.team).toBe('BOH');

      // Simulate logout and second login
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '789',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'Bob',
        last_name: 'Chef',
        role: 'chef',
        team: 'BOH', // Team still persisted
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.spyOn(userRepository, 'updateLastLogin').mockResolvedValueOnce();

      const result2 = await authService.login(loginData);

      // Verify team persisted after logout/login cycle
      expect(result2.user.team).toBe('BOH');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const oldPassword = 'OldPassword123';
      const newPassword = 'NewPassword456';
      const hashedOldPassword = await authService.hashPassword(oldPassword);

      jest.spyOn(userRepository, 'findByIdIncludeInactive').mockResolvedValueOnce({
        id: '123',
        email: 'test@example.com',
        password_hash: hashedOldPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.spyOn(userRepository, 'updatePassword').mockResolvedValueOnce();

      await authService.changePassword('123', oldPassword, newPassword);

      expect(userRepository.updatePassword).toHaveBeenCalled();
    });

    it('should throw error if current password is incorrect', async () => {
      const oldPassword = 'OldPassword123';
      const wrongPassword = 'WrongPassword999';
      const newPassword = 'NewPassword456';
      const hashedOldPassword = await authService.hashPassword(oldPassword);

      jest.spyOn(userRepository, 'findByIdIncludeInactive').mockResolvedValueOnce({
        id: '123',
        email: 'test@example.com',
        password_hash: hashedOldPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        authService.changePassword('123', wrongPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if new password is too weak', async () => {
      const oldPassword = 'OldPassword123';
      const newPassword = 'weak';

      await expect(
        authService.changePassword('123', oldPassword, newPassword)
      ).rejects.toThrow('New password must be at least 8 characters long');
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findByIdIncludeInactive').mockResolvedValueOnce(null);

      await expect(
        authService.changePassword('nonexistent', 'oldpass', 'NewPassword456')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if missing required parameters', async () => {
      await expect(authService.changePassword('123', '', 'NewPassword456')).rejects.toThrow(
        'Current and new passwords are required'
      );

      await expect(authService.changePassword('123', 'OldPassword123', '')).rejects.toThrow(
        'Current and new passwords are required'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      jest.spyOn(userRepository, 'findByIdIncludeInactive').mockResolvedValueOnce({
        id: '123',
        email: 'test@example.com',
        password_hash: 'old_hash',
        first_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      jest.spyOn(userRepository, 'updatePassword').mockResolvedValueOnce();

      await authService.resetPassword('123', 'NewPassword456');

      expect(userRepository.updatePassword).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findByIdIncludeInactive').mockResolvedValueOnce(null);

      await expect(authService.resetPassword('nonexistent', 'NewPassword456')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if new password is too weak', async () => {
      await expect(authService.resetPassword('123', 'weak')).rejects.toThrow(
        'New password must be at least 8 characters long'
      );
    });

    it('should throw error if new password is missing', async () => {
      await expect(authService.resetPassword('123', '')).rejects.toThrow(
        'New password is required'
      );
    });
  });;

  describe('hashPassword and verifyPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
});

describe('Authentication Middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-min-32';
  });

  describe('requireAuth', () => {
    it('should call next() if token is valid', (done) => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      const token = generateToken(payload);

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext = jest.fn(() => {
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user?.userId).toBe('123');
        done();
      });

      requireAuth(mockReq, mockRes, mockNext);
    });

    it('should return 401 if no token provided', (done) => {
      const mockReq = {
        headers: {},
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((_data) => {
          expect(mockRes.status).toHaveBeenCalledWith(401);
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      requireAuth(mockReq, mockRes, mockNext);
    });

    it('should return 401 if token is invalid', (done) => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((_data) => {
          expect(mockRes.status).toHaveBeenCalledWith(401);
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      requireAuth(mockReq, mockRes, mockNext);
    });
  });

  describe('requireOwnership', () => {
    it('should call next() if user owns the resource', (done) => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      const mockReq = {
        headers: {
          authorization: `Bearer ${generateToken(payload)}`,
        },
        user: payload,
        params: { userId: '123' },
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext = jest.fn(() => done());

      const { requireOwnership } = require('../src/middleware/auth');
      const middleware = requireOwnership();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should deny access if user does not own the resource', (done) => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      const mockReq = {
        user: payload,
        params: { userId: '456' },
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((_data) => {
          expect(mockRes.status).toHaveBeenCalledWith(403);
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      const { requireOwnership } = require('../src/middleware/auth');
      const middleware = requireOwnership();
      middleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 if user is not authenticated', (done) => {
      const mockReq = {
        params: { userId: '123' },
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((_data) => {
          expect(mockRes.status).toHaveBeenCalledWith(401);
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      const { requireOwnership } = require('../src/middleware/auth');
      const middleware = requireOwnership();
      middleware(mockReq, mockRes, mockNext);
    });
  });

  describe('requireRole', () => {
    it('should call next() if user has required role', (done) => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'manager',
      };

      const token = generateToken(payload);

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        user: payload,
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext = jest.fn(() => done());

      const middleware = requireRole('manager', 'admin');
      middleware(mockReq, mockRes, mockNext);
    });

    it('should return 403 if user does not have required role', (done) => {
      const payload: TokenPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'new_hire',
      };

      const mockReq = {
        user: payload,
      } as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(mockRes.status).toHaveBeenCalledWith(403);
          expect(data.error).toBe('Forbidden');
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      const middleware = requireRole('manager', 'admin');
      middleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 if user is not authenticated', (done) => {
      const mockReq = {} as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((_data) => {
          expect(mockRes.status).toHaveBeenCalledWith(401);
          done();
        }),
      } as unknown as Response;

      const mockNext = jest.fn();

      const middleware = requireRole('manager', 'admin');
      middleware(mockReq, mockRes, mockNext);
    });
  });
});
