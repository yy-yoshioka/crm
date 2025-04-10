import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CustomerStatus } from '../database.types';

/**
 * Schema for creating a new customer
 */
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional().nullable(),
  address: z.string().max(255, 'Address must be less than 255 characters').optional().nullable(),
  status: z.enum(['active', 'inactive', 'pending'] as const).default('pending'),
});

/**
 * Schema for updating an existing customer
 */
export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().uuid('Invalid ID format'),
});

/**
 * Schema for customer search parameters
 */
export const customerSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending'] as const).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['name', 'email', 'created_at', 'updated_at', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type for customer search parameters
 */
export type CustomerSearchParams = z.infer<typeof customerSearchSchema>;

/**
 * Type for creating a new customer
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/**
 * Type for updating an existing customer
 */
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;