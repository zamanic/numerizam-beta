/**
 * Real API service to connect with Django backend
 * This service fetches live data from the database
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Types for real data
export interface GeneralLedgerEntry {
  entry_no: number;
  company: {
    company_id: number;
    company_name: string;
  };
  date: {
    date: string;
    year: number;
    quarter: string;
    month: string;
  };
  account: {
    account_key: string;
    account: string;
    class_name: string;
    sub_class: string;
  };
  territory?: {
    territory_key: string;
    country: string;
    region: string;
  };
  details: string;
  amount: string;
  transaction_type: 'DEBIT' | 'CREDIT';
  reference_number?: string;
  created_at: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface FinancialSummary {
  total_entries: number;
  total_amount: number;
  total_debits: number;
  total_credits: number;
  average_amount: number;
  largest_transaction: number;
  by_account_class: Array<{
    account__class_name: string;
    count: number;
    total_amount: number;
  }>;
  by_transaction_type: Array<{
    transaction_type: string;
    count: number;
    total_amount: number;
  }>;
}

export interface MonthlyAnalysis {
  month: string;
  total_entries: number;
  total_amount: number;
  total_debits: number;
  total_credits: number;
  unique_accounts: number;
  avg_transaction_size: number;
}

export interface AccountBalance {
  account_key: string;
  account_name: string;
  class_name: string;
  debits: number;
  credits: number;
  balance: number;
  entry_count: number;
}

// Helper function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Real API service
export const realApi = {
  // General Ledger endpoints
  getGeneralLedgerSummary: async (companyId?: number): Promise<FinancialSummary> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/summary/?${params.toString()}`);
  },

  getMonthlyAnalysis: async (companyId?: number): Promise<MonthlyAnalysis[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/monthly_analysis/?${params.toString()}`);
  },

  getAccountBalances: async (companyId?: number): Promise<AccountBalance[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/account_balances/?${params.toString()}`);
  },

  getSummaryByAccount: async (companyId?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/summary_by_account/?${params.toString()}`);
  },

  getSummaryByTerritory: async (companyId?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/summary_by_territory/?${params.toString()}`);
  },

  getSummaryByDate: async (companyId?: number, groupBy: 'day' | 'month' | 'year' = 'month'): Promise<any[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    params.append('group_by', groupBy);
    
    return apiRequest(`/general-ledger/summary_by_date/?${params.toString()}`);
  },

  getSummaryByTransactionType: async (companyId?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company', companyId.toString());
    
    return apiRequest(`/general-ledger/summary_by_transaction_type/?${params.toString()}`);
  },

  // Company statistics
  getCompanyStatistics: async (companyId: number, startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return apiRequest(`/companies/${companyId}/statistics/?${params.toString()}`);
  },

  // Chart data transformation functions
  transformToBarChartData: (data: MonthlyAnalysis[]): ChartData[] => {
    return data.map(item => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: parseFloat(item.total_amount.toString()),
      entries: item.total_entries,
      debits: parseFloat(item.total_debits.toString()),
      credits: parseFloat(item.total_credits.toString()),
    }));
  },

  transformToPieChartData: (data: Array<{ account__class_name?: string; transaction_type?: string; total_amount: number; count: number }>): ChartData[] => {
    return data.map(item => ({
      name: item.account__class_name || item.transaction_type || 'Unknown',
      value: parseFloat(item.total_amount.toString()),
      count: item.count,
    }));
  },

  transformToLineChartData: (data: MonthlyAnalysis[]): ChartData[] => {
    return data.map(item => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: parseFloat(item.total_amount.toString()),
      debits: parseFloat(item.total_debits.toString()),
      credits: parseFloat(item.total_credits.toString()),
      avgTransaction: parseFloat(item.avg_transaction_size.toString()),
    }));
  },

  transformToAreaChartData: (data: MonthlyAnalysis[]): ChartData[] => {
    return data.map(item => ({
      name: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      debits: parseFloat(item.total_debits.toString()),
      credits: parseFloat(item.total_credits.toString()),
      net: parseFloat(item.total_debits.toString()) - parseFloat(item.total_credits.toString()),
    }));
  },

  transformToScatterData: (data: AccountBalance[]): Array<{ x: number; y: number; name: string }> => {
    return data.map(item => ({
      x: item.debits,
      y: item.credits,
      name: item.account_name,
      balance: item.balance,
      entries: item.entry_count,
    }));
  },

  transformToTreemapData: (data: Array<{ account__class_name: string; total_amount: number; count: number }>): Array<{ name: string; size: number; count: number }> => {
    return data.map(item => ({
      name: item.account__class_name,
      size: parseFloat(item.total_amount.toString()),
      count: item.count,
    }));
  },

  // KPI calculations
  calculateKPIs: (summary: FinancialSummary): Record<string, { value: number; change?: number; trend?: 'up' | 'down' }> => {
    const totalRevenue = summary.by_account_class
      .filter(item => item.account__class_name.toLowerCase().includes('revenue') || 
                     item.account__class_name.toLowerCase().includes('income'))
      .reduce((sum, item) => sum + parseFloat(item.total_amount.toString()), 0);

    const totalExpenses = summary.by_account_class
      .filter(item => item.account__class_name.toLowerCase().includes('expense') || 
                     item.account__class_name.toLowerCase().includes('cost'))
      .reduce((sum, item) => sum + parseFloat(item.total_amount.toString()), 0);

    const netIncome = totalRevenue - totalExpenses;
    const cashFlow = summary.total_debits - summary.total_credits;

    return {
      revenue: {
        value: totalRevenue,
        trend: totalRevenue > 0 ? 'up' : 'down',
      },
      expenses: {
        value: totalExpenses,
        trend: totalExpenses > 0 ? 'up' : 'down',
      },
      netIncome: {
        value: netIncome,
        trend: netIncome > 0 ? 'up' : 'down',
      },
      cashFlow: {
        value: Math.abs(cashFlow),
        trend: cashFlow > 0 ? 'up' : 'down',
      },
      totalTransactions: {
        value: summary.total_entries,
        trend: 'up',
      },
      averageTransaction: {
        value: summary.average_amount,
        trend: 'up',
      },
    };
  },

  // Utility function to check if backend is available
  checkBackendHealth: async (): Promise<boolean> => {
    try {
      await apiRequest('/companies/');
      return true;
    } catch (error) {
      console.warn('Backend not available, falling back to mock data');
      return false;
    }
  },
};