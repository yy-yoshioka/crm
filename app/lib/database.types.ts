export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          role: 'admin' | 'manager' | 'viewer';
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          role?: 'admin' | 'manager' | 'viewer';
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          role?: 'admin' | 'manager' | 'viewer';
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      customer_managers: {
        Row: {
          id: string;
          customer_id: string;
          user_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          user_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          user_id?: string;
          assigned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'manager' | 'viewer';
      customer_status: 'active' | 'inactive' | 'pending';
    };
  };
}

// Helper types for Supabase tables
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type NewCustomer = Database['public']['Tables']['customers']['Insert'];
export type UpdateCustomer =
  Database['public']['Tables']['customers']['Update'];

export type CustomerManager =
  Database['public']['Tables']['customer_managers']['Row'];
export type NewCustomerManager =
  Database['public']['Tables']['customer_managers']['Insert'];
export type UpdateCustomerManager =
  Database['public']['Tables']['customer_managers']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type CustomerStatus = Database['public']['Enums']['customer_status'];
