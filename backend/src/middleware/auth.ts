import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/supabase.js';
import { env } from '../env.js';
import type { JwtPayload, UserRole } from '../types/index.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Helper function to extract bearer token from Authorization header
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' && token ? token : null;
};

// Helper function to extract token from either Authorization header or cookies
const extractToken = (req: Request): string | null => {
  // First try Authorization header (Bearer token)
  const bearerToken = extractBearerToken(req.headers.authorization);
  if (bearerToken) return bearerToken;

  // Then try JWT cookie
  if (req.cookies && req.cookies['jwt']) {
    return req.cookies['jwt'];
  }

  return null;
};

// Middleware to verify JWT token and attach user to request
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Access token is required',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    // Verify the JWT token using Supabase's JWT secret
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as any;

    // Extract user information from the token
    const userId = decoded.sub;
    const email = decoded.email;

    if (!userId || !email) {
      res.status(401).json({
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Fetch user profile to get role information
    const user = await db.users.findById(userId);

    if (!user) {
      res.status(401).json({
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND',
      });
      return;
    }

    // Create JWT payload with user information
    const userPayload: JwtPayload = {
      sub: userId,
      email,
      role: user.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    // Attach user to request object
    req.user = userPayload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      console.log('❌ No user found in request');
      res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // DEBUG: Log user role and required roles
    console.log(
      `🔍 User role: "${user.role}", Required roles: [${allowedRoles.join(', ')}], Email: ${user.email}`
    );

    if (!allowedRoles.includes(user.role)) {
      console.log(
        `❌ Access denied - User role "${user.role}" not in allowed roles [${allowedRoles.join(', ')}]`
      );
      res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    console.log(`✅ Access granted for role "${user.role}"`);
    next();
  };
};

// Middleware to check if user is a teacher
export const requireTeacher = requireRole(['teacher']);

// Middleware to check if user is a student
export const requireStudent = requireRole(['student']);

// Middleware to check if user is teacher or student (any authenticated user)
export const requireAuthenticated = requireRole(['teacher', 'student']);

// Middleware to check if user can access a specific lesson
export const requireLessonAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lessonId = req.params['id'];
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!lessonId) {
      res.status(400).json({
        error: 'Lesson ID is required',
        code: 'MISSING_LESSON_ID',
      });
      return;
    }

    // Fetch lesson details
    const lesson = await db.lessons.findById(lessonId);

    if (!lesson) {
      res.status(404).json({
        error: 'Lesson not found',
        code: 'LESSON_NOT_FOUND',
      });
      return;
    }

    // Check if user is the teacher who created the lesson
    if (lesson.teacher_id === user.sub) {
      next();
      return;
    }

    // Check if user is a participant in the lesson
    const isParticipant = await db.participants.isParticipant(
      lessonId,
      user.sub
    );

    if (!isParticipant) {
      res.status(403).json({
        error: 'Access denied. You are not a participant in this lesson',
        code: 'NOT_LESSON_PARTICIPANT',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Lesson access check error:', error);
    res.status(500).json({
      error: 'Failed to verify lesson access',
      code: 'LESSON_ACCESS_ERROR',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      next();
      return;
    }

    // Try to verify the token, but don't fail if it's invalid
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as any;
    const userId = decoded.sub;
    const email = decoded.email;

    if (userId && email) {
      const user = await db.users.findById(userId);

      if (user) {
        req.user = {
          sub: userId,
          email,
          role: user.role,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      }
    }

    next();
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    next();
  }
};

// Legacy exports for backward compatibility
export const requireTutor = requireTeacher;
