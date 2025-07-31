// Database types for Supabase tables

export interface Company {
  company_id: number;
  company_name: string;
  created_at?: string;
}

export interface Territory {
  company_id: number;
  territory_key: number;
  country: string;
  region: string;
}

export interface Calendar {
  company_id: number;
  date: string;
  year: number;
  quarter: string;
  month: string;
  day: string;
}

export interface ChartOfAccounts {
  company_id: number;
  account_key: number;
  report: string;
  class: string;
  subclass: string;
  subclass2: string;
  account: string;
  subaccount: string;
}

export interface GeneralLedger {
  entryno: number;
  company_id: number;
  date: string;
  account_key: number;
  details: string;
  amount: number;
  type: 'Debit' | 'Credit';
  territory_key: number;
}

// User management types
export interface AccountantUser {
  id: string;
  email: string;
  name: string;
  company_name: string;
  country: string;
  region: string;
  role: 'Accountant' | 'Admin' | 'Viewer' | 'Auditor' | 'Investor';
  is_approved: boolean;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

// Transaction processing types - Updated to match database schema
export interface TransactionData {
  company_data: {
    company_name: string;
  };
  territory_data: {
    country: string;
    region: string;
  };
  calendar_data: {
    date: string;
    year: number;
    quarter: string;
    month: string;
    day: string;
  };
  chart_of_accounts_data: Array<{
    account_key: number;
    report: string;
    class: string;
    subclass: string;
    subclass2: string;
    account: string;
    subaccount: string;
  }>;
  general_ledger_entries: Array<{
    account_key: number;
    details: string;
    amount: number;
    type: 'Debit' | 'Credit';
  }>;
}

export interface QueryResponse {
  transactions: TransactionData[];
  validation_errors?: string[];
  missing_data?: string[];
}