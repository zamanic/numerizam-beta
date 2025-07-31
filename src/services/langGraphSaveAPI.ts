/**
 * API service for saving LangGraph query results to the database
 * 
 * This service provides functions to save confirmed query results from the frontend
 * to the PostgreSQL database via Django REST API endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface SaveQueryResultsRequest {
  company_id: number;
  query_type: 'transaction' | 'report';
  query_text: string;
  results: any;
  metadata?: {
    processed_at?: string;
    user_confirmed?: boolean;
    user?: string;
    [key: string]: any;
  };
}

export interface SaveQueryResultsResponse {
  success: boolean;
  message: string;
  journal_id?: number;
  log_id?: number;
  total_entries?: number;
  total_amount?: number;
  entries?: Array<{
    entry_no: number;
    account: string;
    amount: number;
    transaction_type: string;
  }>;
  is_balanced?: boolean;
  results_summary?: {
    total_records: number;
    query_type: string;
  };
  logged_at?: string;
}

export interface SavedQuery {
  journal_id: number;
  description: string;
  reference_number: string;
  date: string;
  created_at: string;
  created_by: string;
  is_balanced: boolean;
  total_debits: number;
  total_credits: number;
  entry_count: number;
}

export interface GetSavedQueriesResponse {
  success: boolean;
  company_id: number;
  company_name: string;
  total_entries: number;
  entries: SavedQuery[];
}

export interface SaveServiceStatusResponse {
  status: 'active' | 'error';
  service: string;
  version: string;
  endpoints: string[];
  supported_query_types: string[];
  database_models: string[];
}

class LangGraphSaveAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Save confirmed query results to the database
   */
  async saveQueryResults(request: SaveQueryResultsRequest): Promise<SaveQueryResultsResponse> {
    // Add metadata if not provided
    const requestWithMetadata = {
      ...request,
      metadata: {
        processed_at: new Date().toISOString(),
        user_confirmed: true,
        user: 'Frontend User',
        ...request.metadata,
      },
    };

    return this.makeRequest<SaveQueryResultsResponse>('save/query-results/', {
      method: 'POST',
      body: JSON.stringify(requestWithMetadata),
    });
  }

  /**
   * Get saved queries for a company
   */
  async getSavedQueries(companyId: number): Promise<GetSavedQueriesResponse> {
    return this.makeRequest<GetSavedQueriesResponse>(
      `save/saved-queries/?company_id=${companyId}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get the status of the save service
   */
  async getSaveServiceStatus(): Promise<SaveServiceStatusResponse> {
    return this.makeRequest<SaveServiceStatusResponse>('save/status/', {
      method: 'GET',
    });
  }

  /**
   * Test the connection to the save service
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getSaveServiceStatus();
      return true;
    } catch (error) {
      console.error('Save service connection test failed:', error);
      return false;
    }
  }

  /**
   * Save transaction results specifically
   */
  async saveTransactionResults(
    companyId: number,
    queryText: string,
    journalEntry: {
      description: string;
      reference_number?: string;
      date: string;
      entries: Array<{
        account_key: number;
        amount: number;
        transaction_type: 'DEBIT' | 'CREDIT';
        details: string;
        territory_key?: number;
      }>;
    },
    metadata?: any
  ): Promise<SaveQueryResultsResponse> {
    return this.saveQueryResults({
      company_id: companyId,
      query_type: 'transaction',
      query_text: queryText,
      results: {
        journal_entry: journalEntry,
      },
      metadata,
    });
  }

  /**
   * Save report results specifically
   */
  async saveReportResults(
    companyId: number,
    queryText: string,
    reportData: any,
    metadata?: any
  ): Promise<SaveQueryResultsResponse> {
    return this.saveQueryResults({
      company_id: companyId,
      query_type: 'report',
      query_text: queryText,
      results: reportData,
      metadata,
    });
  }
}

// Export singleton instance
export const langGraphSaveAPI = new LangGraphSaveAPIService();

// Export utility functions
export const saveQueryResults = (request: SaveQueryResultsRequest) =>
  langGraphSaveAPI.saveQueryResults(request);

export const getSavedQueries = (companyId: number) =>
  langGraphSaveAPI.getSavedQueries(companyId);

export const saveTransactionResults = (
  companyId: number,
  queryText: string,
  journalEntry: any,
  metadata?: any
) => langGraphSaveAPI.saveTransactionResults(companyId, queryText, journalEntry, metadata);

export const saveReportResults = (
  companyId: number,
  queryText: string,
  reportData: any,
  metadata?: any
) => langGraphSaveAPI.saveReportResults(companyId, queryText, reportData, metadata);

export const getSaveServiceStatus = () => langGraphSaveAPI.getSaveServiceStatus();

export const testSaveServiceConnection = () => langGraphSaveAPI.testConnection();