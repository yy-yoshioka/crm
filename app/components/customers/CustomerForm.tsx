'use client';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { statusOptions } from './CustomerFormSchema';
import useCustomerForm from '@/app/hooks/useCustomerForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {/* General error message */}
      {errors.general && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
          {errors.general}
        </div>
      )}
      
      {/* Name field */}
      <Input
        label="Name"
        id="name"
        name="name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />
      
      {/* Email field */}
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
      />
      
      {/* Phone field */}
      <Input
        label="Phone"
        id="phone"
        name="phone"
        value={formData.phone || ''}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
      />
      
      {/* Address field */}
      <Input
        label="Address"
        id="address"
        name="address"
        value={formData.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
      />
      
      {/* Status field */}
      <Select
        label="Status"
        id="status"
        name="status"
        value={formData.status}
        options={statusOptions}
        onChange={(value) => handleChange('status', value)}
        error={errors.status}
      />
      
      {/* Form actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}