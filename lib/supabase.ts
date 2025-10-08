import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please add them to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          created_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      organization_users: {
        Row: {
          organization_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          organization_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      couriers: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          balance?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          amount: number;
          description: string | null;
          courier_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: string;
          amount: number;
          description?: string | null;
          courier_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          type?: string;
          amount?: number;
          description?: string | null;
          courier_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
