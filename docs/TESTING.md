# Testing Guide

This document outlines the testing approach used in the Customer Management CRM application.

## Testing Stack

- **Jest**: Testing framework
- **React Testing Library**: Testing React components
- **MSW (Mock Service Worker)**: Mocking API requests (not yet implemented)

## Running Tests

Run all tests:

```bash
yarn test
# or
npm run test
```

Run tests in watch mode:

```bash
yarn test:watch
# or
npm run test:watch
```

Run tests with coverage report:

```bash
yarn test:coverage
# or
npm run test:coverage
```

## Test Structure

Tests are organized according to the following structure:

- **Component Tests**: `/app/components/__tests__/*.test.(ts|tsx)`
- **Utility Function Tests**: `/app/lib/__tests__/*.test.ts`
- **API Endpoint Tests**: `/app/api/__tests__/*.test.ts`

## Testing Approach

### Component Testing

Component tests verify that components render correctly and respond appropriately to user interactions.

Example component test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../ui/SearchBar';

describe('SearchBar Component', () => {
  it('renders correctly with default props', () => {
    render(<SearchBar placeholder="Search customers..." />);
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    expect(searchInput).toBeInTheDocument();
  });

  it('allows user to input search term', () => {
    const handleSearchMock = jest.fn();
    
    render(
      <SearchBar 
        placeholder="Search customers..." 
        onSearch={handleSearchMock}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    expect(handleSearchMock).toHaveBeenCalledWith('test search');
  });
});
```

### Utility Function Testing

Tests for utility functions verify that they work correctly with various inputs.

Example utility function test:

```ts
import { debounce, formatDate } from '../utils';

jest.useFakeTimers();

describe('Utils', () => {
  describe('debounce function', () => {
    it('should call the function after the specified delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('formatDate function', () => {
    it('should format a date string correctly', () => {
      const mockDate = new Date('2023-05-15T12:30:45Z');
      const formattedDate = formatDate(mockDate.toISOString());
      
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});
```

### API Endpoint Testing

API endpoint tests verify that the API routes handle requests correctly and return the expected responses.

Example API endpoint test:

```ts
import { NextRequest } from 'next/server';
import { GET } from '../../api/customers/route';
import * as supabaseServer from '../../lib/supabase/server';

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Customers API', () => {
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
        count: jest.fn().mockResolvedValue({ count: 10 }),
        data: mockCustomers,
      };

      (supabaseServer.createClient as jest.Mock).mockReturnValue({
        ...mockSupabase,
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/customers?page=1&limit=10');
      
      // Call the API function
      const response = await GET(req);
      const responseData = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockCustomers);
    });
  });
});
```

## Mocking

We use Jest's mocking capabilities to mock:

1. **External Dependencies**: Such as Supabase client
2. **Custom Hooks**: When testing components that use them
3. **Context Providers**: For testing components that consume context

Example of mocking a custom hook:

```tsx
// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com', role: 'admin' },
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
}));
```

## Test Coverage

We aim for high test coverage, especially for:

1. **Critical Business Logic**: Customer CRUD operations
2. **Authentication Components**: Role-based access control
3. **Utility Functions**: Reused throughout the application

## Future Testing Improvements

1. **Integration Tests**: More comprehensive tests across component boundaries
2. **E2E Testing**: Add Playwright or Cypress for end-to-end testing
3. **Mock Service Worker**: Implement MSW for better API mocking