import { z } from 'zod';

// Schema for signup request
export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['teacher', 'student'], {
    errorMap: () => ({ message: 'Role must be either "teacher" or "student"' }),
  }),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
});

// Schema for login request
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for password reset request
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Schema for password update request
export const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Response schemas
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(['teacher', 'student']),
    firstName: z.string(),
    lastName: z.string(),
    displayName: z.string(),
  }),
  token: z.string(),
  expiresAt: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['teacher', 'student']),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  createdAt: z.string(),
});

// Types derived from schemas
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateRequest = z.infer<typeof passwordUpdateSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
