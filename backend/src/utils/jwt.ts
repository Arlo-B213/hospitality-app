import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  team?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token with the given payload
 * @param payload Token payload containing userId, email, role, and optional team
 * @returns Signed JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRATION || '7d';

  return jwt.sign(payload, secret, { expiresIn } as any);
}

/**
 * Verify a JWT token and return the payload
 * @param token JWT token string to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extract Bearer token from Authorization header
 * @param req Express request object
 * @returns Token string or null if not found
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Extract and verify token from request
 * @param req Express request object
 * @returns Decoded token payload
 * @throws Error if token is missing or invalid
 */
export function extractAndVerifyToken(req: Request): TokenPayload {
  const token = extractToken(req);
  if (!token) {
    throw new Error('No authorization token provided');
  }

  return verifyToken(token);
}
