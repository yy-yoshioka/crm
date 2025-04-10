# Supabase Database Setup

This directory contains the database schema for the Customer Management CRM application.

## Setting Up the Database

### Option 1: Using SQL Editor (Recommended for Development)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `migrations/schema.sql`
5. Run the query

### Option 2: Using Migrations (Recommended for Production)

1. Install Supabase CLI (if not already installed)

   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase (if not already initialized)

   ```bash
   supabase init
   ```

3. Link to your Supabase project

   ```bash
   supabase link --project-ref your-project-reference
   ```

4. Push the migrations
   ```bash
   supabase db push
   ```

## Database Schema

The database consists of three main tables:

1. `users` - Stores user information and roles
2. `customers` - Stores customer information
3. `customer_managers` - Manages the many-to-many relationship between customers and users who manage them

### Roles and Permissions

The schema uses Row Level Security (RLS) policies to control access:

- **Admin**: Can manage all customers and users
- **Manager**: Can manage assigned customers and create new customers
- **Viewer**: Can only view customers they created or are assigned to

### Important Notes

- Make sure to replace `'your-super-secret-jwt-secret'` in the SQL file with a secure secret
- The database types are defined in `app/lib/database.types.ts`
- The Row Level Security (RLS) policies ensure data is only accessible to authorized users
