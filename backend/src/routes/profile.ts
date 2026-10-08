import { Router, type Router as ExpressRouter } from 'express';
import asyncHandler from 'express-async-handler';
import { validateRequest } from 'zod-express-middleware';
import { db } from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  updateProfileSchema,
  type UpdateProfileRequest,
} from '../schemas/profile.js';

const router: ExpressRouter = Router();

// PATCH /profile - Update current user's profile
router.patch(
  '/',
  authenticateToken,
  validateRequest({
    body: updateProfileSchema,
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const { firstName, lastName, role } = req.body as UpdateProfileRequest;

    try {
      // Fetch current user to check existing role and permissions
      const currentUser = await db.users.findById(userId);

      if (!currentUser) {
        res.status(404).json({
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND',
        });
        return;
      }

      // Prepare update data - only include provided fields
      const updateData: Record<string, any> = {};

      // Handle name updates - any authenticated user can update their name
      if (firstName !== undefined) {
        updateData['first_name'] = firstName;
      }
      if (lastName !== undefined) {
        updateData['last_name'] = lastName;
      }

      // Handle role updates with specific business logic
      if (role !== undefined) {
        // Allow role update if:
        // 1. Current role is 'pending' (first-time OAuth users)
        // 2. Current role is 'student' and wanting to become 'teacher' (allow upgrade)
        // 3. Current role is 'teacher' and user has admin privileges (future enhancement)

        if (currentUser.role === 'pending') {
          // First-time OAuth users can set any valid role
          updateData['role'] = role;
        } else if (currentUser.role === 'student' && role === 'teacher') {
          // Allow students to upgrade to teacher
          updateData['role'] = role;
        } else if (currentUser.role === 'teacher' && role === 'student') {
          // Prevent teachers from downgrading to student (could be enhanced for admins)
          res.status(403).json({
            error: 'Teachers cannot downgrade their role to student',
            code: 'ROLE_DOWNGRADE_FORBIDDEN',
          });
          return;
        } else if (currentUser.role === role) {
          // No change needed, but don't error
          // Don't add to updateData to avoid unnecessary DB call
        } else {
          // Any other role change not explicitly allowed
          res.status(403).json({
            error: 'Role change not permitted',
            code: 'ROLE_CHANGE_FORBIDDEN',
          });
          return;
        }
      }

      // If no fields to update, return current profile
      if (Object.keys(updateData).length === 0) {
        res.json({
          id: currentUser.id,
          role: currentUser.role,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          displayName: currentUser.display_name,
          createdAt: currentUser.created_at,
        });
        return;
      }

      // Update the user profile
      const updatedUser = await db.users.update(userId, updateData);

      // Return updated profile
      res.json({
        id: updatedUser.id,
        role: updatedUser.role,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        displayName: updatedUser.display_name,
        createdAt: updatedUser.created_at,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR',
      });
    }
  })
);

export default router;
