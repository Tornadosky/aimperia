import { z } from 'zod';

// Schema for updating user profile
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  role: z
    .enum(['teacher', 'student', 'pending'], {
      errorMap: () => ({
        message: 'Role must be either "teacher", "student", or "pending"',
      }),
    })
    .optional(),
});

// Schema for user response (from profiles table)
export const userResponseSchema = z.object({
  id: z.string(),
  role: z.enum(['teacher', 'student', 'pending']),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  createdAt: z.string(),
});

// Schema for complete user profile (with auth info)
export const userProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  profile: userResponseSchema,
});

// Schema for user creation (internal use)
export const createUserSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
  role: z.enum(['teacher', 'student', 'pending']),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
});

// Schema for user query parameters
export const userQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  role: z.enum(['teacher', 'student', 'pending']).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

// Types derived from schemas
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;

// Legacy exports for backward compatibility (keeping profile names for API compatibility)
export const updateProfileSchema = updateUserSchema;
export const profileResponseSchema = userResponseSchema;
export const createProfileSchema = createUserSchema;
export const profileQuerySchema = userQuerySchema;

export type UpdateProfileRequest = UpdateUserRequest;
export type ProfileResponse = UserResponse;
export type CreateProfileRequest = CreateUserRequest;
export type ProfileQuery = UserQuery;
