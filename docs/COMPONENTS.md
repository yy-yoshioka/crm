# Components Documentation

This document provides an overview of the key components in the Customer Management CRM application.

## UI Components

### Button

A versatile button component with different variants and sizes.

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'destructive' | 'link'
- `size`: 'default' | 'sm' | 'lg'
- `isLoading`: boolean
- `disabled`: boolean
- `className`: string

**Usage:**

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Input

A reusable input component with validation support.

**Props:**

- `id`: string
- `label`: string
- `type`: string
- `error`: string
- `className`: string
- Plus standard input attributes

**Usage:**

```tsx
<Input
  id="email"
  label="Email Address"
  type="email"
  error={errors.email}
  {...register('email')}
/>
```

### Select

A dropdown select component.

**Props:**

- `id`: string
- `label`: string
- `options`: Array of { value: string, label: string }
- `error`: string
- `className`: string
- Plus standard select attributes

**Usage:**

```tsx
<Select
  id="status"
  label="Customer Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  error={errors.status}
  {...register('status')}
/>
```

### Modal

A modal dialog component.

**Props:**

- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `children`: React.ReactNode
- `className`: string

**Usage:**

```tsx
<Modal isOpen={isOpen} onClose={closeModal} title="Customer Details">
  <p>Modal content goes here</p>
</Modal>
```

### Toast

Notification toast component.

**Props:**

- `message`: string
- `type`: 'success' | 'error' | 'info'
- `onClose`: () => void

**Usage:**

```tsx
<Toast
  message="Customer saved successfully!"
  type="success"
  onClose={closeToast}
/>
```

### LoadingSpinner

Loading indicator component.

**Props:**

- `size`: 'sm' | 'md' | 'lg'
- `className`: string

**Usage:**

```tsx
<LoadingSpinner size="md" />
```

### Pagination

Component for navigating through pages of data.

**Props:**

- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void
- `className`: string

**Usage:**

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

### SearchBar

Search input component with debounced search.

**Props:**

- `placeholder`: string
- `onSearch`: (term: string) => void
- `className`: string

**Usage:**

```tsx
<SearchBar placeholder="Search customers..." onSearch={handleSearch} />
```

## Layout Components

### Navbar

Navigation bar component with authentication state.

**Props:**

- None (uses AuthContext internally)

**Usage:**

```tsx
<Navbar />
```

### PageContainer

Standard page container with consistent padding and max-width.

**Props:**

- `children`: React.ReactNode
- `className`: string

**Usage:**

```tsx
<PageContainer>
  <h1>Page Title</h1>
  <p>Page content</p>
</PageContainer>
```

## Customer Components

### CustomerForm

Form for creating and editing customer records.

**Props:**

- `initialData`: Customer (optional)
- `onSubmit`: (data: CustomerFormData) => Promise<void>
- `isSubmitting`: boolean

**Usage:**

```tsx
<CustomerForm
  initialData={customer}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
/>
```

### CustomerList

Component for displaying a list of customers with pagination.

**Props:**

- `customers`: Customer[]
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void
- `onDelete`: (id: string) => void

**Usage:**

```tsx
<CustomerList
  customers={customers}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  onDelete={handleDelete}
/>
```

### CustomerCard

Card component for displaying customer summary information.

**Props:**

- `customer`: Customer
- `onDelete`: (id: string) => void
- `className`: string

**Usage:**

```tsx
<CustomerCard customer={customer} onDelete={handleDelete} />
```

### StatusFilter

Component for filtering customers by status.

**Props:**

- `selectedStatus`: string | null
- `onStatusChange`: (status: string | null) => void
- `className`: string

**Usage:**

```tsx
<StatusFilter
  selectedStatus={selectedStatus}
  onStatusChange={handleStatusChange}
/>
```

## Authentication Components

### RoleGate

Component for conditional rendering based on user role.

**Props:**

- `allowedRole`: 'admin' | 'manager' | 'viewer'
- `children`: React.ReactNode

**Usage:**

```tsx
<RoleGate allowedRole="admin">
  <AdminOnlyComponent />
</RoleGate>
```

### AuthProvider

Context provider for authentication state.

**Props:**

- `children`: React.ReactNode

**Usage:**

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```
