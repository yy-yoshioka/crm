import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserRole } from '../database.types';

/**
 * Schema for user profile data
 */
export const userProfileSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'viewer'] as const),
});

/**
 * Schema for updating a user role
 */
export const updateUserRoleSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  role: z.enum(['admin', 'manager', 'viewer'] as const),
});

/**
 * Schema for user sign in
 */
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Schema for user sign up
 */
export const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    passwordConfirm: z.string(),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

/**
 * Type for user profile data
 */
export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Type for updating a user role
 */
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

/**
 * Type for user sign in
 */
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Type for user sign up
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
