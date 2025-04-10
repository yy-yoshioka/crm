import { createCustomerSchema, updateCustomerSchema } from '../validations/customer';

describe('Customer Validation Schemas', () => {
  describe('createCustomerSchema', () => {
    it('should validate a valid customer input', () => {
      const validCustomer = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, City, State',
        status: 'active'
      };
      
      const result = createCustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });
    
    it('should reject input with missing required fields', () => {
      const invalidCustomer = {
        // Missing name field
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, City, State',
        status: 'active'
      };
      
      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.name).toBeDefined();
      }
    });
    
    it('should reject input with invalid email format', () => {
      const customerWithInvalidEmail = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '123-456-7890',
        address: '123 Main St, City, State',
        status: 'active'
      };
      
      const result = createCustomerSchema.safeParse(customerWithInvalidEmail);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.email).toBeDefined();
      }
    });
    
    it('should reject input with invalid status', () => {
      const customerWithInvalidStatus = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, City, State',
        status: 'invalid_status'
      };
      
      const result = createCustomerSchema.safeParse(customerWithInvalidStatus);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.status).toBeDefined();
      }
    });
  });
  
  describe('updateCustomerSchema', () => {
    it('should validate a valid partial update', () => {
      const validUpdate = {
        name: 'Updated Name',
        email: 'updated.email@example.com'
      };
      
      const result = updateCustomerSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });
    
    it('should allow empty object for no updates', () => {
      const emptyUpdate = {};
      
      const result = updateCustomerSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
    
    it('should reject update with invalid email format', () => {
      const updateWithInvalidEmail = {
        email: 'invalid-email'
      };
      
      const result = updateCustomerSchema.safeParse(updateWithInvalidEmail);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.email).toBeDefined();
      }
    });
  });
});