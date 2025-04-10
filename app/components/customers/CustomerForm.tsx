'use client';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { statusOptions } from './CustomerFormSchema';
import useCustomerForm from '@/app/hooks/useCustomerForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FormField, FormErrors } from '@/app/components/ui/FormError';

interface CustomerFormProps {
  /**
   * Customer ID for editing (omit for new customer)
   */
  customer?: { id?: string };
  /**
   * Called when form is cancelled
   */
  onCancel?: () => void;
}

/**
 * Form for creating or editing a customer
 */
export function CustomerForm({ customer, onCancel }: CustomerFormProps) {
  const {
    formData,
    isLoading,
    isSubmitting,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  } = useCustomerForm(customer?.id);

  // Handle cancel button click
  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Format errors for FormErrors component
  const formattedErrors = errors.general ? { general: [errors.general] } : {};
  Object.entries(errors).forEach(([key, value]) => {
    if (key !== 'general' && value) {
      formattedErrors[key] = [value];
    }
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4 sm:space-y-6"
    >
      {/* General error messages */}
      <FormErrors errors={formattedErrors} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Name field */}
          <FormField name="name" label="Name" error={errors.name} required>
            <Input
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </FormField>

          {/* Email field */}
          <FormField
            name="email"
            label="Email"
            error={errors.email}
            description="We'll never share your email with anyone else."
          >
            <Input
              type="email"
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
            />
          </FormField>

          {/* Phone field */}
          <FormField name="phone" label="Phone" error={errors.phone}>
            <Input
              value={formData.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
            />
          </FormField>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Address field */}
          <FormField name="address" label="Address" error={errors.address}>
            <Input
              value={formData.address || ''}
              onChange={e => handleChange('address', e.target.value)}
            />
          </FormField>

          {/* Status field */}
          <FormField name="status" label="Status" error={errors.status}>
            <Select
              value={formData.status}
              options={statusOptions}
              onChange={value => handleChange('status', value)}
            />
          </FormField>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
