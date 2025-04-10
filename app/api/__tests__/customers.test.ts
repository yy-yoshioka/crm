import { NextRequest } from 'next/server';
import { GET, POST } from '../../api/customers/route';
import * as supabaseServer from '../../lib/supabase/server';

// Mock the supabase server module
jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Customers API', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/customers', () => {
    it('should return customers with pagination', async () => {
      // Mock data
      const mockCustomers = [
        { id: '1', name: 'Customer 1', status: 'active' },
        { id: '2', name: 'Customer 2', status: 'inactive' },
      ];

      // Mock the Supabase client
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue({ count: 10 }),
        data: mockCustomers,
      };

      // Setup the createClient mock to return our mockSupabase
      (supabaseServer.createClient as jest.Mock).mockReturnValue({
        ...mockSupabase,
      });

      // Create mock request
      const req = new NextRequest(
        'http://localhost:3000/api/customers?page=1&limit=10'
      );

      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockCustomers);
      expect(responseData.totalPages).toBeDefined();
      expect(responseData.currentPage).toBe(1);

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('customers');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.order).toHaveBeenCalled();
      expect(mockSupabase.range).toHaveBeenCalled();
    });

    it('should handle filter by status', async () => {
      // Mock data
      const mockCustomers = [{ id: '1', name: 'Customer 1', status: 'active' }];

      // Mock the Supabase client
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue({ count: 5 }),
        data: mockCustomers,
      };

      // Setup the createClient mock
      (supabaseServer.createClient as jest.Mock).mockReturnValue({
        ...mockSupabase,
      });

      // Create mock request with status filter
      const req = new NextRequest(
        'http://localhost:3000/api/customers?page=1&limit=10&status=active'
      );

      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockCustomers);

      // Verify filter was applied
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer successfully', async () => {
      // Mock the new customer data
      const newCustomer = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '123-456-7890',
        address: '123 New St',
        status: 'active',
      };

      // Mock Supabase response
      const mockInsertResponse = {
        data: {
          ...newCustomer,
          id: '123',
          created_at: new Date().toISOString(),
        },
        error: null,
      };

      // Mock the Supabase client
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockInsertResponse),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
          }),
        },
      };

      // Setup the createClient mock
      (supabaseServer.createClient as jest.Mock).mockReturnValue(mockSupabase);

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      });

      // Call the API function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(201);
      expect(responseData.data).toEqual(mockInsertResponse.data);

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('customers');
      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return validation error for invalid data', async () => {
      // Invalid customer data missing required fields
      const invalidCustomer = {
        // Missing name
        email: 'new@example.com',
        status: 'active',
      };

      // Create mock request with invalid data
      const req = new NextRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify(invalidCustomer),
      });

      // Call the API function
      const response = await POST(req);
      const responseData = await response.json();

      // Verify response indicates validation error
      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
      expect(responseData.validationErrors).toBeDefined();
    });
  });
});
