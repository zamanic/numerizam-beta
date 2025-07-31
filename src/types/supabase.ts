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
      numerizamauth: {
        Row: {
          id: string;
          email: string;
          name: string;
          company_name: string;
          country: string;
          region: string;
          role: "Accountant" | "Admin";
          is_approved: boolean;
          created_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          company_name: string;
          country: string;
          region: string;
          role?: "Accountant" | "Admin";
          is_approved?: boolean;
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          company_name?: string;
          country?: string;
          region?: string;
          role?: "Accountant" | "Admin";
          is_approved?: boolean;
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
      calendar: {
        Row: {
          company_id: number;
          date: string;
          year: number;
          quarter: string;
          month: string;
          day: string;
        };
        Insert: {
          company_id: number;
          date: string;
          year: number;
          quarter: string;
          month: string;
          day: string;
        };
        Update: {
          company_id?: number;
          date?: string;
          year?: number;
          quarter?: string;
          month?: string;
          day?: string;
        };
      };
      chartofaccounts: {
        Row: {
          company_id: number;
          account_key: number;
          report: string;
          class: string;
          subclass: string;
          subclass2: string;
          account: string;
          subaccount: string;
        };
        Insert: {
          company_id: number;
          account_key: number;
          report: string;
          class: string;
          subclass: string;
          subclass2: string;
          account: string;
          subaccount: string;
        };
        Update: {
          company_id?: number;
          account_key?: number;
          report?: string;
          class?: string;
          subclass?: string;
          subclass2?: string;
          account?: string;
          subaccount?: string;
        };
      };
      companies: {
        Row: {
          company_id: number;
          company_name: string;
          created_at: string | null;
        };
        Insert: {
          company_id?: number;
          company_name: string;
          created_at?: string | null;
        };
        Update: {
          company_id?: number;
          company_name?: string;
          created_at?: string | null;
        };
      };
      generalledger: {
        Row: {
          entryno: number;
          company_id: number;
          date: string;
          account_key: number;
          details: string;
          amount: number;
          territory_key: number;
        };
        Insert: {
          entryno?: number;
          company_id: number;
          date: string;
          account_key: number;
          details: string;
          amount: number;
          territory_key: number;
        };
        Update: {
          entryno?: number;
          company_id?: number;
          date?: string;
          account_key?: number;
          details?: string;
          amount?: number;
          territory_key?: number;
        };
      };
      territory: {
        Row: {
          company_id: number;
          territory_key: number;
          country: string;
          region: string;
        };
        Insert: {
          company_id: number;
          territory_key: number;
          country: string;
          region: string;
        };
        Update: {
          company_id?: number;
          territory_key?: number;
          country?: string;
          region?: string;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
