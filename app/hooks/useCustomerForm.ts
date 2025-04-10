'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { customerFormSchema, CustomerFormData, CustomerFormErrors } from '@/app/components/customers/CustomerFormSchema';

/**
 * Custom hook for managing customer form state and submission
 * Supports both creating new customers and editing existing ones
 */
export default function useCustomerForm(customerId?: string) {
  const router = useRouter();
  const supabase = createClient();
  
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: null,
    phone: null,
    address: null,
    status: 'pending',
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  
  /**
   * Fetch customer data for editing
   */
  const fetchCustomerData = useCallback(async (id: string) => {
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
        });
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setErrors({ general: 'Failed to load customer data' });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);
  
  // Load customer data if editing
  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    }
  }, [customerId, fetchCustomerData]);
  
  /**
   * Handle form field changes
   */
  const handleChange = (field: keyof CustomerFormData, value: string | null) => {
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
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(validatedData)
          .eq('id', customerId);
        
        if (error) throw error;
        
        router.push(`/customers/${customerId}`);
        router.refresh();
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert(validatedData);
        
        if (error) throw error;
        
        router.push('/customers');
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      
      // Handle validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const validationError = error as { errors: Array<{ path: string[]; message: string }> };
        const formattedErrors: CustomerFormErrors = {};
        
        validationError.errors.forEach((err) => {
          const path = err.path?.[0];
          if (path && typeof path === 'string') {
            formattedErrors[path as keyof CustomerFormData] = err.message;
          }
        });
        
        setErrors(formattedErrors);
      } else {
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
      email: null,
      phone: null,
      address: null,
      status: 'pending',
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