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
          role: "Accountant" | "Auditor" | "Admin";
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
          role?: "Accountant" | "Auditor" | "Admin";
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
          role?: "Accountant" | "Auditor" | "Admin";
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
      approval_requests: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          user_name: string;
          company_name: string;
          requested_role: "Accountant" | "Auditor" | "Admin";
          business_justification: string;
          experience: string;
          additional_info: string | null;
          status: "pending" | "approved" | "rejected";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          user_name: string;
          company_name: string;
          requested_role: "Accountant" | "Auditor" | "Admin";
          business_justification: string;
          experience: string;
          additional_info?: string | null;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          user_name?: string;
          company_name?: string;
          requested_role?: "Accountant" | "Auditor" | "Admin";
          business_justification?: string;
          experience?: string;
          additional_info?: string | null;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      approval_notifications: {
        Row: {
          id: string;
          admin_email: string;
          request_id: string;
          user_name: string;
          user_email: string;
          requested_role: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_email: string;
          request_id: string;
          user_name: string;
          user_email: string;
          requested_role: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string;
          request_id?: string;
          user_name?: string;
          user_email?: string;
          requested_role?: string;
          is_read?: boolean;
          created_at?: string;
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
