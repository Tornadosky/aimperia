import jwt from 'jsonwebtoken';
import { env } from '../env.js';

/**
 * Helper function to verify Supabase JWT token
 * @param token - The JWT token to verify
 * @returns The decoded JWT payload
 * @throws Error if token is invalid or expired
 */
export const verifySupabaseJwt = (token: string): any => {
  return jwt.verify(token, env.SUPABASE_JWT_SECRET);
};
