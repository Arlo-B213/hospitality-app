import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { UserRepository } from '../models/User';
import { isValidRole, canRoleBeAssignedToTeam, ROLES } from '../middleware/rbac';
import { AuditService } from './AuditService';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string; // Optional, defaults to new_hire for public signup
  phone?: string;
  team?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string; // Required for admin endpoint
  team?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    team?: string;
  };
}

/**
 * Authentication Service
 * Handles user registration, login, and password management
 */
export class AuthService {
  private userRepository: UserRepository;
  private auditService: AuditService;
  private bcryptRounds: number;

  constructor(userRepository: UserRepository, auditService: AuditService) {
    this.userRepository = userRepository;
    this.auditService = auditService;
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  }

  /**
   * Validate password complexity requirements
   * Minimum: 12 chars, 1 uppercase, 1 number, 1 special character
   * @param password Password to validate
   * @returns Object with valid flag and array of error messages
   */
  private validatePasswordComplexity(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must include at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must include at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must include at least one special character (!@#$%^&* etc)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Public user registration - RESTRICTED TO NEW_HIRE ROLE ONLY
   * @param request Registration request with user details
   * @returns AuthResponse with token and user info
   * @throws Error if email already exists or validation fails
   */
  async register(request: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Validate input
    if (!request.email || !request.password || !request.firstName || !request.lastName) {
      throw new Error('Missing required fields: email, password, firstName, lastName');
    }

    // Validate password complexity
    const passwordValidation = this.validatePasswordComplexity(request.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // SECURITY: Public signup is ONLY for new_hire role
    const role = ROLES.NEW_HIRE; // Force new_hire role
    if (request.role && request.role !== ROLES.NEW_HIRE) {
      throw new Error('Public registration only allows new_hire role. Contact admin for privileged role creation.');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcryptjs
    const passwordHash = await this.hashPassword(request.password);

    // new_hire role doesn't require team, so ignore any team parameter
    const team = undefined;

    // Create user
    const user = await this.userRepository.create({
      email: request.email,
      password_hash: passwordHash,
      first_name: request.firstName,
      last_name: request.lastName,
      role,
      team,
      phone: request.phone,
    });

    // Log user creation
    await this.auditService.logUserCreation(
      user.id,
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      user.id, // Self-created during registration
      ipAddress,
      userAgent
    );

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      team: user.team,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        team: user.team,
      },
    };
  }

  /**
   * Admin-only: Create user with privileged roles (manager, asst_manager, leads, chefs)
   * MUST be called from authenticated admin endpoint only
   * @param request User creation request with full details
   * @returns AuthResponse with token and user info
   * @throws Error if validation fails
   */
  async createUser(request: CreateUserRequest, adminUserId?: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Validate input
    if (!request.email || !request.password || !request.firstName || !request.lastName || !request.role) {
      throw new Error('Missing required fields: email, password, firstName, lastName, role');
    }

    // Validate password complexity
    const passwordValidation = this.validatePasswordComplexity(request.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // SECURITY: Validate role is legal
    if (!isValidRole(request.role)) {
      throw new Error(`Invalid role: ${request.role}`);
    }

    // SECURITY: Validate team assignment for this role
    if (request.team && !canRoleBeAssignedToTeam(request.role, request.team)) {
      throw new Error(`Role ${request.role} cannot be assigned to team ${request.team}`);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcryptjs
    const passwordHash = await this.hashPassword(request.password);

    // Create user with specified role and team
    const user = await this.userRepository.create({
      email: request.email,
      password_hash: passwordHash,
      first_name: request.firstName,
      last_name: request.lastName,
      role: request.role,
      team: request.team,
      phone: request.phone,
    });

    // Log user creation
    if (adminUserId) {
      await this.auditService.logUserCreation(
        user.id,
        {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          team: user.team,
        },
        adminUserId,
        ipAddress,
        userAgent
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      team: user.team,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        team: user.team,
      },
    };
  }

  /**
   * Login with email and password
   * @param request Login request with credentials
   * @returns AuthResponse with token and user info (including team from database)
   * @throws Error if credentials are invalid
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    // Validate input
    if (!request.email || !request.password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(request.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // SECURITY: Fetch team from database (persisted at registration/creation)
    const team = user.team;

    // Generate token with team from database
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      team,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        team,
      },
    };
  }

  /**
   * Hash a password using bcryptjs
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify a password against a hash
   * @param password Plain text password
   * @param hash Password hash
   * @returns true if password matches hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Change user password
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password
   * @throws Error if current password is invalid
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required');
    }

    // Validate password complexity
    const passwordValidation = this.validatePasswordComplexity(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Get user
    const user = await this.userRepository.findByIdIncludeInactive(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update new password
    const newPasswordHash = await this.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newPasswordHash);

    // Log password change
    await this.auditService.logPasswordChange(userId, userId, ipAddress, userAgent);
  }

  /**
   * Reset user password (admin only)
   * @param userId User ID
   * @param newPassword New password
   */
  async resetPassword(userId: string, newPassword: string, adminUserId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Validate input
    if (!newPassword) {
      throw new Error('New password is required');
    }

    // Validate password complexity
    const passwordValidation = this.validatePasswordComplexity(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Get user
    const user = await this.userRepository.findByIdIncludeInactive(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash and update password
    const newPasswordHash = await this.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newPasswordHash);

    // Log password reset
    if (adminUserId) {
      await this.auditService.logPasswordChange(userId, adminUserId, ipAddress, userAgent);
    }
  }
}
