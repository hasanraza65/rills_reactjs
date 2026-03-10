/**
 * @fileoverview Validation schemas for authentication.
 */

import { z } from 'zod';

/**
 * Zod schema for the admin login form.
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

/**
 * Type inferred from the login schema.
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Zod schema for CNIC-based login.
 */
export const cnicLoginSchema = z.object({
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'Invalid CNIC format (e.g., 42101-1234567-1'),
});

/**
 * Type inferred from the CNIC login schema.
 */
export type CnicLoginFormData = z.infer<typeof cnicLoginSchema>;
