import { z } from 'zod';

/**
 * Schema for customer form validation
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(255, { message: 'Name must be less than 255 characters' }),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .or(z.literal(''))
    .nullable()
    .transform(val => (val === '' ? null : val)),
  phone: z
    .string()
    .max(20, { message: 'Phone must be less than 20 characters' })
    .or(z.literal(''))
    .nullable()
    .transform(val => (val === '' ? null : val)),
  address: z
    .string()
    .max(255, { message: 'Address must be less than 255 characters' })
    .or(z.literal(''))
    .nullable()
    .transform(val => (val === '' ? null : val)),
  status: z.enum(['active', 'inactive', 'pending'] as const).default('pending'),
});

/**
 * Status options for form select
 */
export const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

/**
 * Type for form data
 */
export type CustomerFormData = z.infer<typeof customerFormSchema>;

/**
 * Type for form errors
 */
export type CustomerFormErrors = {
  [K in keyof CustomerFormData]?: string;
} & {
  general?: string;
};