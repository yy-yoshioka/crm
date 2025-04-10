import { z } from 'zod';

/**
 * Common validation rules
 */
export const email = z
  .string()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Please enter a valid email address' });

export const password = z
  .string()
  .min(1, { message: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

export const name = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must be less than 100 characters' });

export const phone = z
  .string()
  .min(1, { message: 'Phone number is required' })
  .regex(/^[+\-\(\)\d\s.]+$/, {
    message:
      'Please enter a valid phone number (digits, spaces, and +-() allowed)',
  });

export const url = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .optional()
  .or(z.literal(''));

/**
 * Helper to make schemas with optional fields
 */
export function makeOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(z.literal(''));
}

/**
 * Helper to transform empty strings to null
 */
export function emptyStringToNull<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(val => {
    if (val === '') return null;
    return val;
  }, schema.nullable());
}

/**
 * Helper to transform string to Date
 */
export function stringToDate(dateSchema = z.date()) {
  return z.preprocess(val => {
    if (typeof val === 'string' || val instanceof Date) return new Date(val);
    return val;
  }, dateSchema);
}

/**
 * Helper to transform string to number
 */
export function stringToNumber(numberSchema = z.number()) {
  return z.preprocess(val => {
    if (typeof val === 'string') return Number(val);
    return val;
  }, numberSchema);
}

/**
 * Custom error map for better error messages
 */
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // Custom error messages based on validation issues
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string') {
        return { message: 'This field is required' };
      }
      if (issue.expected === 'number') {
        return { message: 'Please enter a valid number' };
      }
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: 'This field is required' };
        }
        return { message: `Must be at least ${issue.minimum} characters` };
      }
      if (issue.type === 'number') {
        return { message: `Must be at least ${issue.minimum}` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Must be at most ${issue.maximum} characters` };
      }
      if (issue.type === 'number') {
        return { message: `Must be at most ${issue.maximum}` };
      }
      break;
  }

  // Fall back to default message
  return { message: ctx.defaultError };
};

// Set the custom error map as the default
z.setErrorMap(customErrorMap);
