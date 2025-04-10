import { NextRequest } from 'next/server';
import { GET } from '../../api/customers/search/route';
import * as supabaseServer from '../../lib/supabase/server';

// Mock the supabase server module
jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Customers Search API', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/customers/search', () => {
    it('should search customers by term', async () => {
      // Mock search results
      const mockSearchResults = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
      ];

      // Mock the Supabase client
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        data: mockSearchResults,
      };

      // Setup the createClient mock to return our mockSupabase
      (supabaseServer.createClient as jest.Mock).mockReturnValue({
        ...mockSupabase,
      });

      // Create mock request with search term
      const req = new NextRequest(
        'http://localhost:3000/api/customers/search?term=doe'
      );

      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockSearchResults);

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('customers');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.or).toHaveBeenCalled();
      expect(mockSupabase.limit).toHaveBeenCalled();
    });

    it('should return empty array when no search term is provided', async () => {
      // Create mock request without search term
      const req = new NextRequest('http://localhost:3000/api/customers/search');

      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual([]);

      // Verify Supabase was NOT called
      expect(supabaseServer.createClient).not.toHaveBeenCalled();
    });

    it('should filter search results by status if provided', async () => {
      // Mock search results
      const mockSearchResults = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
        },
      ];

      // Mock the Supabase client
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        data: mockSearchResults,
      };

      // Setup the createClient mock
      (supabaseServer.createClient as jest.Mock).mockReturnValue({
        ...mockSupabase,
      });

      // Create mock request with search term and status
      const req = new NextRequest(
        'http://localhost:3000/api/customers/search?term=doe&status=active'
      );

      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockSearchResults);

      // Verify filter was applied
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
    });
  });
});
