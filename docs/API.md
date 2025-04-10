# API Documentation

This document outlines the API endpoints available in the Customer Management CRM application.

## Authentication

Authentication is handled by Supabase Auth. The application uses JWT tokens for authentication, which are automatically included in requests to the API endpoints.

## API Endpoints

### Customers

#### GET /api/customers

Retrieves a paginated list of customers.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional: 'active', 'inactive', 'pending')

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "123-456-7890",
      "address": "123 Main St",
      "status": "active",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "created_by": "user-uuid"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalCount": 47
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 500: Server Error

#### GET /api/customers/[id]

Retrieves a specific customer by ID.

**URL Parameters:**

- `id`: Customer UUID

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "status": "active",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "created_by": "user-uuid"
  }
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

#### POST /api/customers

Creates a new customer.

**Request Body:**

```json
{
  "name": "New Customer",
  "email": "newcustomer@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "status": "active"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "New Customer",
    "email": "newcustomer@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "status": "active",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "created_by": "user-uuid"
  }
}
```

**Status Codes:**

- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 500: Server Error

#### PUT /api/customers/[id]

Updates an existing customer.

**URL Parameters:**

- `id`: Customer UUID

**Request Body:**

```json
{
  "name": "Updated Customer Name",
  "email": "updated@example.com",
  "status": "inactive"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Updated Customer Name",
    "email": "updated@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "status": "inactive",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z",
    "created_by": "user-uuid"
  }
}
```

**Status Codes:**

- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

#### DELETE /api/customers/[id]

Deletes a customer.

**URL Parameters:**

- `id`: Customer UUID

**Response:**

```json
{
  "success": true
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

#### GET /api/customers/search

Searches for customers by name, email, etc.

**Query Parameters:**

- `term`: Search term
- `status`: Filter by status (optional)
- `limit`: Maximum results to return (default: 5)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "status": "active"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 500: Server Error

### User and Roles

#### GET /api/user

Retrieves the current user's information.

**Response:**

```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "admin",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 500: Server Error

#### GET /api/roles

Retrieves the list of available roles.

**Response:**

```json
{
  "data": [
    {
      "id": "admin",
      "name": "Administrator"
    },
    {
      "id": "manager",
      "name": "Manager"
    },
    {
      "id": "viewer",
      "name": "Viewer"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 500: Server Error

#### GET /api/roles/users

Retrieves users with their roles (admin only).

**Response:**

```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "admin@example.com",
      "role": "admin"
    },
    {
      "id": "user-uuid",
      "email": "manager@example.com",
      "role": "manager"
    }
  ]
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not admin)
- 500: Server Error

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "validationErrors": {
    "field": ["Error message for field"]
  }
}
```

The `validationErrors` object is only included for validation errors (400 Bad Request responses).
