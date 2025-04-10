# Architecture Documentation

This document outlines the architecture of the Customer Management CRM application, describing its main components, data flow, and design patterns.

## System Overview

The Customer Management CRM is a full-stack web application built with Next.js 15 (App Router), React 19, and Supabase. It follows a client-server architecture where:

- Next.js serves as both the frontend framework and API layer
- Supabase provides the database, authentication, and storage services
- TypeScript ensures type safety throughout the application

## Core Architectural Patterns

### Server Components vs. Client Components

The application leverages Next.js 15's server and client components:

- **Server Components**: Used by default for data fetching and rendering static content
- **Client Components**: Used for interactive elements that require client-side state or browser APIs

Components that need interactivity are marked with `'use client'` directive.

### Data Flow

1. **Data Fetching**:
   - Server components fetch data directly from Supabase using server-side client
   - Client components use custom hooks that call API endpoints

2. **State Management**:
   - React Context for global states (authentication, theming)
   - Local component state for UI interactions
   - Custom hooks for reusable state logic

3. **API Layer**:
   - Next.js API routes in `/app/api/`
   - RESTful endpoints for CRUD operations
   - Validation using Zod schemas

## Major Subsystems

### Authentication & Authorization

- **Implementation**: Supabase Auth with custom Next.js middleware
- **User Roles**: Admin, Manager, Viewer roles with different permissions
- **Key Components**:
  - `AuthProvider`: Context provider for authentication state
  - `useAuth` & `useRole`: Hooks for auth operations and role checking
  - `RoleGate`: Component for conditional rendering based on user role

### Customer Management

- **Implementation**: CRUD operations via API endpoints
- **Key Components**:
  - `CustomerForm`: Reusable form for adding/editing customers
  - `CustomerList`: Display customers with pagination and filtering
  - `CustomerCard`: Individual customer display component

### Search and Filtering

- **Implementation**: API-based search with client-side filtering
- **Key Components**:
  - `SearchBar`: Debounced search input
  - `StatusFilter`: Filter customers by status
  - `useSearch` & `useFilters`: Hooks for search and filter operations

## Database Schema

### Users Table

```
users
  - id: uuid (primary key)
  - email: string (unique)
  - created_at: timestamp
  - role: string (enum: 'admin', 'manager', 'viewer')
```

### Customers Table

```
customers
  - id: uuid (primary key)
  - name: string
  - email: string
  - phone: string
  - address: string
  - status: string (enum: 'active', 'inactive', 'pending')
  - created_at: timestamp
  - updated_at: timestamp
  - created_by: uuid (foreign key to users.id)
```

### Customer Managers Table

```
customer_managers
  - id: uuid (primary key)
  - customer_id: uuid (foreign key to customers.id)
  - user_id: uuid (foreign key to users.id)
  - assigned_at: timestamp
```

## Error Handling Strategy

1. **Client-Side Errors**:
   - Form validation with immediate feedback
   - Error boundaries for component-level errors
   - Toast notifications for user feedback

2. **Server-Side Errors**:
   - Structured error responses from API
   - HTTP status codes for error categorization
   - Detailed validation errors for forms

3. **Global Error Handling**:
   - Custom error pages for different error types
   - Fallback UI for error states

## Performance Optimizations

1. **Server Components**: Reduce client-side JavaScript
2. **Image Optimization**: Next.js Image component for optimized loading
3. **Pagination**: Limit data fetching to visible records
4. **Debouncing**: Prevent excessive API calls for search
5. **Optimistic Updates**: Update UI before API response for better UX

## Testing Strategy

1. **Unit Tests**: Test individual components and utility functions
2. **Integration Tests**: Test component interactions and API endpoints
3. **E2E Tests**: Test complete user flows (future enhancement)

## Security Considerations

1. **Authentication**: Secure token-based auth via Supabase
2. **Authorization**: Row-level security in Supabase + middleware checks
3. **Input Validation**: Zod schema validation for all user inputs
4. **API Protection**: Auth checks on all protected endpoints

## Deployment

The application is deployed using a CI/CD pipeline with the following stages:

1. **Build**: Compile TypeScript, bundle assets
2. **Test**: Run automated tests
3. **Deploy**: Deploy to production environment

## Technology Dependencies

- **Next.js 15**: Frontend framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type safety
- **Supabase**: Backend as a service (PostgreSQL, Auth)
- **TailwindCSS 4**: Utility-first CSS framework
- **Zod**: Schema validation
- **Jest & React Testing Library**: Testing