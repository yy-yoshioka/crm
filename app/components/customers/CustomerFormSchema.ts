import { z } from 'zod';
import {
  name as nameSchema,
  email as emailSchema,
  phone as phoneSchema,
  makeOptional,
} from '@/app/lib/validations';

/**
 * Customer status type
 */
export const statusEnum = z.enum(['active', 'inactive', 'pending'] as const);
export type CustomerStatus = z.infer<typeof statusEnum>;

/**
 * Schema for customer form validation
 */
export const customerFormSchema = z
  .object({
    name: nameSchema.max(255, {
      message: 'Name must be less than 255 characters',
    }),
    email: makeOptional(emailSchema),
    phone: makeOptional(phoneSchema).transform(val =>
      val === '' ? null : val
    ),
    address: z
      .string()
      .max(255, { message: 'Address must be less than 255 characters' })
      .optional()
      .or(z.literal(''))
      .transform(val => (val === '' ? null : val)),
    status: statusEnum.default('pending'),
  })
  .refine(
    data => {
      // Require at least an email or phone number for contact
      return data.email || data.phone;
    },
    {
      message: 'Either email or phone number is required',
      path: ['email'], // This will highlight the email field
    }
  );

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
