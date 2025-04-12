'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  customerFormSchema,
  CustomerFormData,
  CustomerFormErrors,
} from '@/app/components/customers/CustomerFormSchema';
import { supabase } from '../lib/supabase/client';
import useAuth from './useAuth';

/**
 * Custom hook for managing customer form state and submission
 * Supports both creating new customers and editing existing ones
 */
export default function useCustomerForm(customerId?: string) {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: null,
    address: null,
    status: 'pending',
    created_by: user?.id || '',
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  /**
   * Fetch customer data for editing
   */
  const fetchCustomerData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            status: data.status,
            created_by: data.created_by,
          });
        } else {
          throw new Error('Customer not found');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);

        // Determine a user-friendly error message based on the error
        if (error && typeof error === 'object' && 'code' in error) {
          const supabaseError = error as { code: string; message?: string };

          if (supabaseError.code === 'PGRST116') {
            setErrors({ general: 'Customer not found' });
          } else if (supabaseError.code === 'PGRST301') {
            setErrors({
              general: 'You are not authorized to view this customer',
            });
          } else {
            setErrors({
              general: 'Failed to load customer data. Please try again later.',
            });
          }
        } else {
          setErrors({ general: 'Failed to load customer data' });
        }

        // Redirect to the customers list after a short delay if customer not found
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'PGRST116'
        ) {
          setTimeout(() => {
            router.push('/customers');
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Load customer data if editing
  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    }
  }, [customerId, fetchCustomerData]);

  /**
   * Handle form field changes
   */
  const handleChange = (
    field: keyof CustomerFormData,
    value: string | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when value changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Form submission handler
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = customerFormSchema.parse(formData);
      if (customerId) {
        // Update existing customer (still using Supabase directly)
        const { error } = await supabase
          .from('customers')
          .update(validatedData)
          .eq('id', customerId);

        if (error) throw error;

        router.push(`/customers/${customerId}`);
        router.refresh();
      } else {
        // Create new customer using the API endpoint (bypasses RLS)

        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('API error:', result);
          throw new Error(result.error || 'Failed to create customer');
        }

        router.push('/customers');
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);

      // Handle Zod validation errors
      if (
        error instanceof Error &&
        'format' in error &&
        typeof error.format === 'function'
      ) {
        try {
          // This is a Zod error - format it in a friendly way
          const zodError = error as { format: () => Record<string, unknown> };
          const formattedError = zodError.format();
          const newErrors: CustomerFormErrors = {};

          // Process the formatted Zod error
          Object.entries(formattedError).forEach(([key, value]) => {
            if (key === '_errors') {
              if (Array.isArray(value) && value.length > 0) {
                newErrors.general = value[0] as string;
              }
            } else {
              const fieldErrors = value as { _errors: string[] };
              if (fieldErrors._errors && fieldErrors._errors.length > 0) {
                newErrors[key as keyof CustomerFormData] =
                  fieldErrors._errors[0];
              }
            }
          });

          setErrors(newErrors);
        } catch {
          // If we can't parse the Zod error, fall back to a generic error
          setErrors({
            general: 'Invalid form data. Please check your entries.',
          });
        }
      }
      // Handle Supabase or API errors
      else if (
        error &&
        typeof error === 'object' &&
        ('code' in error || 'message' in error)
      ) {
        if (error instanceof Error) {
          setErrors({
            general:
              error.message || 'An error occurred while saving the customer',
          });
        } else if ('code' in error) {
          // Determine user-friendly error based on error code
          if (error.code === '23505') {
            // Unique constraint violation
            setErrors({
              general: 'A customer with this information already exists.',
            });
          } else if (error.code === '23503') {
            // Foreign key constraint
            setErrors({
              general: 'Invalid reference to another record.',
            });
          } else if (error.code === '42501') {
            // Permission denied
            setErrors({
              general:
                'You do not have permission to create customers. Please contact an administrator.',
            });
          } else {
            setErrors({
              general: 'A database error occurred. Please try again later.',
            });
          }
        }
      }
      // Handle other errors
      else {
        setErrors({
          general: 'An error occurred while saving the customer',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset the form
   */
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: null,
      address: null,
      status: 'pending',
      created_by: user?.id || '',
    });
    setErrors({});
  };

  return {
    formData,
    isLoading,
    isSubmitting,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
