-- Schema for Customer Management CRM

-- Enable Row Level Security (RLS)
-- Note: JWT secret is managed by Supabase automatically, no need to set it manually

-- Create role enum type
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');

-- Create customer status enum type
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'pending');

-- Create users table with role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role user_role DEFAULT 'viewer'::user_role
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status customer_status DEFAULT 'pending'::customer_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create customer_managers table for many-to-many relationship
CREATE TABLE IF NOT EXISTS customer_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, user_id)
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS) policies

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_managers ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (true);  -- Everyone can read users

CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (auth.uid()::uuid = id);  -- Users can only insert themselves

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (
    auth.uid()::uuid = id  -- Users can update their own records
    OR
    EXISTS (  -- Admins can update any user
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Customers table policies
CREATE POLICY customers_select_policy ON customers
  FOR SELECT USING (
    created_by = auth.uid()::uuid  -- Users can read their own customers
    OR
    EXISTS (  -- Managers and admins can read all customers
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role IN ('manager', 'admin')
    )
    OR
    EXISTS (  -- Users can read customers they manage
      SELECT 1 FROM customer_managers
      WHERE customer_id = customers.id AND user_id = auth.uid()::uuid
    )
  );

CREATE POLICY customers_insert_policy ON customers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL  -- Any authenticated user can create customers
  );

CREATE POLICY customers_update_policy ON customers
  FOR UPDATE USING (
    created_by = auth.uid()::uuid  -- Users can update their own customers
    OR
    EXISTS (  -- Admins can update any customer
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
    OR
    EXISTS (  -- Managers can update customers they manage
      SELECT 1 FROM customer_managers
      WHERE customer_id = customers.id AND user_id = auth.uid()::uuid AND
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'manager')
    )
  );

CREATE POLICY customers_delete_policy ON customers
  FOR DELETE USING (
    created_by = auth.uid()::uuid  -- Users can delete their own customers
    OR
    EXISTS (  -- Admins can delete any customer
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Customer Managers table policies
CREATE POLICY customer_managers_select_policy ON customer_managers
  FOR SELECT USING (true);  -- Everyone can read customer_managers

CREATE POLICY customer_managers_insert_policy ON customer_managers
  FOR INSERT WITH CHECK (
    EXISTS (  -- Only admins and managers can assign managers
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY customer_managers_delete_policy ON customer_managers
  FOR DELETE USING (
    EXISTS (  -- Only admins and managers can unassign managers
      SELECT 1 FROM users
      WHERE id = auth.uid()::uuid AND role IN ('admin', 'manager')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_customers_created_by ON customers(created_by);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customer_managers_customer_id ON customer_managers(customer_id);
CREATE INDEX idx_customer_managers_user_id ON customer_managers(user_id);