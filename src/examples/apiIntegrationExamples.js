// Frontend API Integration Examples for Numerizam Accounting System
// This file demonstrates how to use the comprehensive API from the React frontend

import apiService from '../services/apiService';

/**
 * Company Management Examples
 */
export const companyExamples = {
  // Get all companies
  async getAllCompanies() {
    try {
      const response = await apiService.get('/companies/');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Search companies by name
  async searchCompanies(searchTerm) {
    try {
      const response = await apiService.get('/companies/', {
        params: {
          company_name__icontains: searchTerm
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  },

  // Get company statistics
  async getCompanyStatistics(companyId) {
    try {
      const response = await apiService.get(`/companies/${companyId}/statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company statistics:', error);
      throw error;
    }
  }
};

/**
 * Chart of Accounts Examples
 */
export const chartOfAccountsExamples = {
  // Get all accounts for a company
  async getAccountsByCompany(companyId) {
    try {
      const response = await apiService.get('/chart-of-accounts/', {
        params: {
          company: companyId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Get accounts by class (Assets, Liabilities, etc.)
  async getAccountsByClass(companyId, className) {
    try {
      const response = await apiService.get('/chart-of-accounts/', {
        params: {
          company: companyId,
          class_name: className
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts by class:', error);
      throw error;
    }
  },

  // Search accounts
  async searchAccounts(companyId, searchTerm) {
    try {
      const response = await apiService.get('/chart-of-accounts/', {
        params: {
          company: companyId,
          search: searchTerm
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching accounts:', error);
      throw error;
    }
  },

  // Get account hierarchy
  async getAccountHierarchy(companyId) {
    try {
      const response = await apiService.get('/chart-of-accounts/hierarchy/', {
        params: {
          company: companyId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching account hierarchy:', error);
      throw error;
    }
  },

  // Get accounts within a key range
  async getAccountsByKeyRange(companyId, minKey, maxKey) {
    try {
      const response = await apiService.get('/chart-of-accounts/', {
        params: {
          company: companyId,
          account_key__gte: minKey,
          account_key__lte: maxKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts by key range:', error);
      throw error;
    }
  }
};

/**
 * General Ledger Examples
 */
export const generalLedgerExamples = {
  // Get ledger entries for a specific account
  async getEntriesByAccount(companyId, accountKey) {
    try {
      const response = await apiService.get('/general-ledger/', {
        params: {
          company: companyId,
          account__account_key: accountKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      throw error;
    }
  },

  // Get entries by amount range
  async getEntriesByAmountRange(companyId, minAmount, maxAmount) {
    try {
      const response = await apiService.get('/general-ledger/', {
        params: {
          company: companyId,
          amount__gte: minAmount,
          amount__lte: maxAmount
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching entries by amount:', error);
      throw error;
    }
  },

  // Get debit or credit entries only
  async getEntriesByType(companyId, debitCredit) {
    try {
      const response = await apiService.get('/general-ledger/', {
        params: {
          company: companyId,
          debit_credit: debitCredit // 'D' for debit, 'C' for credit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching entries by type:', error);
      throw error;
    }
  },

  // Get monthly analysis
  async getMonthlyAnalysis(companyId, year) {
    try {
      const response = await apiService.get('/general-ledger/monthly_analysis/', {
        params: {
          company: companyId,
          year: year
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly analysis:', error);
      throw error;
    }
  },

  // Get account balances
  async getAccountBalances(companyId) {
    try {
      const response = await apiService.get('/general-ledger/account_balances/', {
        params: {
          company: companyId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  },

  // Export to CSV
  async exportToCSV(companyId, filters = {}) {
    try {
      const response = await apiService.get('/general-ledger/export_csv/', {
        params: {
          company: companyId,
          ...filters
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'general_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
};

/**
 * Financial Analysis Examples
 */
export const financialAnalysisExamples = {
  // Generate Profit & Loss statement
  async getProfitLoss(companyId, startDate, endDate, territoryId = null) {
    try {
      const params = {
        company: companyId,
        start_date: startDate,
        end_date: endDate
      };
      
      if (territoryId) {
        params.territory = territoryId;
      }
      
      const response = await apiService.get('/financial-analysis/profit_loss/', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error generating P&L:', error);
      throw error;
    }
  },

  // Generate Balance Sheet
  async getBalanceSheet(companyId, asOfDate, territoryId = null) {
    try {
      const params = {
        company: companyId,
        as_of_date: asOfDate
      };
      
      if (territoryId) {
        params.territory = territoryId;
      }
      
      const response = await apiService.get('/financial-analysis/balance_sheet/', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error generating Balance Sheet:', error);
      throw error;
    }
  }
};

/**
 * Calendar and Date Range Examples
 */
export const calendarExamples = {
  // Get calendar entries for a date range
  async getCalendarByDateRange(companyId, startDate, endDate) {
    try {
      const response = await apiService.get('/calendar/', {
        params: {
          company: companyId,
          date__gte: startDate,
          date__lte: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar entries:', error);
      throw error;
    }
  },

  // Get entries for a specific quarter
  async getCalendarByQuarter(companyId, year, quarter) {
    try {
      const response = await apiService.get('/calendar/', {
        params: {
          company: companyId,
          year: year,
          quarter: quarter // Q1, Q2, Q3, Q4
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar by quarter:', error);
      throw error;
    }
  },

  // Get available date ranges
  async getDateRanges(companyId) {
    try {
      const response = await apiService.get('/calendar/date_ranges/', {
        params: {
          company: companyId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching date ranges:', error);
      throw error;
    }
  }
};

/**
 * Advanced Query Examples
 */
export const advancedQueryExamples = {
  // Complex filtering example
  async getComplexQuery(companyId) {
    try {
      const response = await apiService.get('/general-ledger/', {
        params: {
          company: companyId,
          account__class_name: 'Assets',
          amount__gte: 1000,
          calendar__date__gte: '2024-01-01',
          calendar__date__lte: '2024-12-31',
          debit_credit: 'D',
          ordering: '-amount',
          page_size: 50
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error executing complex query:', error);
      throw error;
    }
  },

  // Pagination example
  async getPaginatedResults(endpoint, params, page = 1, pageSize = 100) {
    try {
      const response = await apiService.get(endpoint, {
        params: {
          ...params,
          page: page,
          page_size: pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated results:', error);
      throw error;
    }
  },

  // Search with ordering
  async searchWithOrdering(endpoint, searchTerm, orderBy, params = {}) {
    try {
      const response = await apiService.get(endpoint, {
        params: {
          ...params,
          search: searchTerm,
          ordering: orderBy
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching with ordering:', error);
      throw error;
    }
  }
};

/**
 * React Hook Examples
 */
export const useAccountingAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = async (queryFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    executeQuery,
    // Convenience methods
    getCompanies: (...args) => executeQuery(companyExamples.getAllCompanies, ...args),
    getAccounts: (...args) => executeQuery(chartOfAccountsExamples.getAccountsByCompany, ...args),
    getLedgerEntries: (...args) => executeQuery(generalLedgerExamples.getEntriesByAccount, ...args),
    getProfitLoss: (...args) => executeQuery(financialAnalysisExamples.getProfitLoss, ...args),
    getBalanceSheet: (...args) => executeQuery(financialAnalysisExamples.getBalanceSheet, ...args)
  };
};

// Export all examples
export default {
  companyExamples,
  chartOfAccountsExamples,
  generalLedgerExamples,
  financialAnalysisExamples,
  calendarExamples,
  advancedQueryExamples,
  useAccountingAPI
};