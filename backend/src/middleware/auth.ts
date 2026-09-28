import { Request, Response, NextFunction } from 'express';
import { extractAndVerifyToken, TokenPayload } from '../utils/jwt';

/**
 * Extend Express Request to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to require authentication via JWT token
 * Verifies the token and attaches user info to req.user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const payload = extractAndVerifyToken(req);
    req.user = payload;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Higher-order function to create a middleware that requires specific roles
 * @param allowedRoles Array of allowed role strings
 * @returns Middleware function that checks role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // First ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to verify user ownership (userId from token matches resource owner)
 * Useful for users to access only their own resources
 * @param userIdParam Name of the userId parameter in req.params (default: 'userId')
 * @returns Middleware function that checks ownership
 */
export function requireOwnership(userIdParam: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // First ensure user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user is trying to access their own resource
    const requestedUserId = req.params[userIdParam];
    if (req.user.userId !== requestedUserId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
