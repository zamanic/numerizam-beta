/**
 * API service for LangGraph integration
 * 
 * This service provides functions to interact with the LangGraph AI endpoints
 * for processing natural language queries and creating accounting transactions.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ProcessQueryRequest {
  query: string;
  company_id: number;
}

export interface ProcessQueryResponse {
  success: boolean;
  journal_id?: number;
  debit_entry_id?: number;
  credit_entry_id?: number;
  amount?: number;
  message?: string;
  errors?: string[];
  parsed_data?: any;
}

export interface BatchProcessRequest {
  queries: ProcessQueryRequest[];
}

export interface BatchProcessResponse {
  results: (ProcessQueryResponse & { index: number })[];
  total_processed: number;
  successful: number;
}

export interface ValidateQueryRequest {
  query: string;
  company_id: number;
}

export interface ValidateQueryResponse {
  valid: boolean;
  errors?: string[];
  parsed_data?: any;
  validated_data?: {
    debit_account: string;
    credit_account: string;
    amount: number;
    details: string;
  };
}

export interface AgentStatusResponse {
  status: 'active' | 'error';
  model?: string;
  nodes?: string[];
  message?: string;
  error?: string;
}

class LangGraphAPIService {
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
   * Process a natural language query using the LangGraph agent
   */
  async processQuery(request: ProcessQueryRequest): Promise<ProcessQueryResponse> {
    return this.makeRequest<ProcessQueryResponse>('ai/process-query/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Process multiple queries in batch
   */
  async batchProcessQueries(request: BatchProcessRequest): Promise<BatchProcessResponse> {
    return this.makeRequest<BatchProcessResponse>('ai/batch-process/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Validate a query without executing it
   */
  async validateQuery(request: ValidateQueryRequest): Promise<ValidateQueryResponse> {
    return this.makeRequest<ValidateQueryResponse>('ai/validate-query/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get the status of the LangGraph agent
   */
  async getAgentStatus(): Promise<AgentStatusResponse> {
    return this.makeRequest<AgentStatusResponse>('ai/status/', {
      method: 'GET',
    });
  }

  /**
   * Test the connection to the backend API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAgentStatus();
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const langGraphAPI = new LangGraphAPIService();

// Export utility functions
export const processNaturalLanguageQuery = (query: string, companyId: number) =>
  langGraphAPI.processQuery({ query, company_id: companyId });

export const validateNaturalLanguageQuery = (query: string, companyId: number) =>
  langGraphAPI.validateQuery({ query, company_id: companyId });

export const batchProcessQueries = (queries: ProcessQueryRequest[]) =>
  langGraphAPI.batchProcessQueries({ queries });

export const getAgentStatus = () => langGraphAPI.getAgentStatus();

export const testAPIConnection = () => langGraphAPI.testConnection();