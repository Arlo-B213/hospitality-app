import { Pool, QueryResult } from 'pg';
import { UserRepository } from '../src/models/User';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  const mockPool = {
    query: jest.fn(),
  } as unknown as Pool;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(mockPool);
  });

  describe('findByEmail', () => {
    it('should find active user by email', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'test@example.com',
            password_hash: 'hashed_password',
            first_name: 'John',
            last_name: 'Doe',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email = $1 AND is_active = true'),
        ['test@example.com']
      );
    });

    it('should return null if user not found', async () => {
      const mockResult: QueryResult = {
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find active user by ID', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'test@example.com',
            password_hash: 'hashed_password',
            first_name: 'John',
            last_name: 'Doe',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.findById('123');

      expect(user).toBeDefined();
      expect(user?.id).toBe('123');
    });

    it('should return null if user not found', async () => {
      const mockResult: QueryResult = {
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.findById('nonexistent-id');

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'new_hire',
        phone: '555-1234',
      };

      const mockResult: QueryResult = {
        rows: [
          {
            id: '456',
            ...userData,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.create(userData);

      expect(user.id).toBe('456');
      expect(user.email).toBe(userData.email);
      expect(mockPool.query).toHaveBeenCalled();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      await userRepository.updateLastLogin('123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET last_login = NOW()'),
        ['123']
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'test@example.com',
            password_hash: 'hash',
            first_name: 'Jane',
            last_name: 'Smith',
            phone: '555-1234',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.updateProfile('123', {
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '555-1234',
      });

      expect(user?.first_name).toBe('Jane');
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('should return null if no updates provided', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'test@example.com',
            password_hash: 'hash',
            first_name: 'John',
            last_name: 'Doe',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const user = await userRepository.updateProfile('123', {});

      expect(user).toBeDefined();
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      await userRepository.deactivate('123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET is_active = false'),
        ['123']
      );
    });
  });

  describe('activate', () => {
    it('should activate a user', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      await userRepository.activate('123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET is_active = true'),
        ['123']
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile without password hash', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'manager',
            phone: '555-1234',
            is_active: true,
            last_login: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const profile = await userRepository.getProfile('123');

      expect(profile?.id).toBe('123');
      expect(profile?.email).toBe('test@example.com');
      expect('password_hash' in profile!).toBe(false);
    });
  });

  describe('findByRole', () => {
    it('should find all users with a specific role', async () => {
      const mockResult: QueryResult = {
        rows: [
          {
            id: '123',
            email: 'manager1@example.com',
            first_name: 'Manager',
            last_name: 'One',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '456',
            email: 'manager2@example.com',
            first_name: 'Manager',
            last_name: 'Two',
            role: 'manager',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const users = await userRepository.findByRole('manager');

      expect(users).toHaveLength(2);
      expect(users[0].role).toBe('manager');
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      const mockResult: QueryResult = {
        rows: [{ count: '1' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const exists = await userRepository.emailExists('test@example.com');

      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const mockResult: QueryResult = {
        rows: [{ count: '0' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const exists = await userRepository.emailExists('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({});

      await userRepository.updatePassword('123', 'new_hash');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET password_hash = $1'),
        ['new_hash', '123']
      );
    });
  });
});
