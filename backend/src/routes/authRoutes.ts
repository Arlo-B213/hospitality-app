import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../models/User';
import { requireAuth, requireRole } from '../middleware/auth';

export function createAuthRoutes(pool: Pool): Router {
  const router = Router();
  const userRepository = new UserRepository(pool);
  const authService = new AuthService(userRepository);

  /**
   * POST /auth/register
   * Public user registration - RESTRICTED TO new_hire ROLE ONLY
   * Attempting to register with other roles will be rejected
   */
  router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: email, password, firstName, lastName',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Note: role and team are ignored in public registration
      // All public registrations are created as new_hire with no team
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      res.status(201).json({
        token: result.token,
        user: result.user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const statusCode = message.includes('already registered') ? 409 : 400;
      res.status(statusCode).json({
        error: statusCode === 409 ? 'Conflict' : 'Registration Failed',
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/admin/create-user
   * Admin-only: Create users with privileged roles (manager, asst_manager, leads, chefs)
   * Requires authentication and admin role
   */
  router.post(
    '/admin/create-user',
    requireAuth,
    requireRole('admin'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, password, firstName, lastName, role, team, phone } = req.body;

        if (!email || !password || !firstName || !lastName || !role) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required fields: email, password, firstName, lastName, role',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const result = await authService.createUser({
          email,
          password,
          firstName,
          lastName,
          role,
          team,
          phone,
        });

        res.status(201).json({
          token: result.token,
          user: result.user,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'User creation failed';
        const statusCode = message.includes('already registered') ? 409 : 400;
        res.status(statusCode).json({
          error: statusCode === 409 ? 'Conflict' : 'User Creation Failed',
          message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /auth/login
   * Login with email and password
   */
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        token: result.token,
        user: result.user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        error: 'Unauthorized',
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/change-password
   * Change user password (requires authentication)
   */
  router.post('/change-password', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'currentPassword and newPassword are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      res.status(200).json({
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      res.status(400).json({
        error: 'Password Change Failed',
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  /**
   * POST /auth/reset-password
   * Reset user password (admin only)
   */
  router.post(
    '/reset-password',
    requireAuth,
    requireRole('admin'),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'userId and newPassword are required',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        await authService.resetPassword(userId, newPassword);

        res.status(200).json({
          message: 'Password reset successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset failed';
        res.status(400).json({
          error: 'Password Reset Failed',
          message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /auth/profile
   * Get current user profile (requires authentication)
   */
  router.get('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await userRepository.getProfile(req.user.userId);

      if (!profile) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User profile not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        user: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      res.status(500).json({
        error: 'Internal Server Error',
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
