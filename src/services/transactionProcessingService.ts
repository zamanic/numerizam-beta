import { supabaseAccountingService } from './supabaseAccountingService';
import { langGraphAPI } from './langGraphAPI';
import { TransactionData, QueryResponse } from '../types/database';

export class TransactionProcessingService {
  constructor() {
    // Using the singleton instance from langGraphAPI
  }

  /**
   * Process natural language query and save to Supabase
   */
  async processQuery(
    query: string, 
    companyName: string, 
    country: string, 
    region: string,
    userId?: string
  ): Promise<{
    success: boolean;
    data?: QueryResponse;
    error?: string;
    entryNumbers?: number[];
  }> {
    try {
      console.log('Processing query:', query);
      
      // Step 1: Send query to LangGraph API for processing
      const langGraphResponse = await langGraphAPI.processQuery({
        query,
        company_id: 1 // For now using default company ID, could be derived from companyName
      });
      
      console.log('LangGraph response:', langGraphResponse);
      
      if (!langGraphResponse.success) {
        console.log('LangGraph failed:', langGraphResponse.message);
        return {
          success: false,
          error: langGraphResponse.message || 'Failed to process query with LangGraph'
        };
      }

      // Step 2: Parse the response to extract transaction data
      // Handle both new and legacy response formats
      const responseData = langGraphResponse.parsed_data || langGraphResponse;
      console.log('Response data for parsing:', responseData);
      
      const transactionData = await this.parseLangGraphResponse(responseData, companyName, country, region);
      
      console.log('Parsed transaction data:', transactionData);
      
      if (!transactionData) {
        console.log('Failed to parse transaction data');
        return {
          success: false,
          error: 'Failed to parse transaction data from LangGraph response'
        };
      }

      // Step 3: Validate transaction data
      const validation = supabaseAccountingService.validateTransactionData(transactionData);
      
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          data: {
            transactions: [transactionData],
            validation_errors: validation.errors
          }
        };
      }

      // Step 4: Save to Supabase (use userId if provided, otherwise use a default)
      const saveResult = await supabaseAccountingService.saveTransactionData(userId || 'default-user', transactionData);
      
      console.log('Save result:', saveResult);
      
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save transaction data'
        };
      }

      console.log('Successfully processed query, returning data');
      return {
        success: true,
        data: {
          transactions: [transactionData]
        },
        entryNumbers: saveResult.entryNumbers
      };

    } catch (error) {
      console.error('Error processing query:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Process multiple transactions from a single query
   */
  async processMultipleTransactions(userId: string, query: string): Promise<{
    success: boolean;
    data?: QueryResponse;
    error?: string;
    entryNumbers?: number[];
  }> {
    try {
      // Send query to LangGraph API
      const langGraphResponse = await langGraphAPI.processQuery({
        query,
        company_id: 1 // Default company ID, should be passed as parameter
      });
      
      if (!langGraphResponse.success) {
        return {
          success: false,
          error: langGraphResponse.message || 'Failed to process query with LangGraph'
        };
      }

      // Parse multiple transactions
      // Handle both new and legacy response formats
      const responseData = langGraphResponse.parsed_data || langGraphResponse;
      const transactions = await this.parseMultipleTransactions(responseData);
      
      if (!transactions || transactions.length === 0) {
        return {
          success: false,
          error: 'No valid transactions found in the query'
        };
      }

      const allEntryNumbers: number[] = [];
      const validationErrors: string[] = [];
      const processedTransactions: TransactionData[] = [];

      // Process each transaction
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        
        // Validate each transaction
        const validation = supabaseAccountingService.validateTransactionData(transaction);
        
        if (!validation.isValid) {
          validationErrors.push(`Transaction ${i + 1}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Save valid transactions
        const saveResult = await supabaseAccountingService.saveTransactionData(userId, transaction);
        
        if (saveResult.success && saveResult.entryNumbers) {
          allEntryNumbers.push(...saveResult.entryNumbers);
          processedTransactions.push(transaction);
        } else {
          validationErrors.push(`Transaction ${i + 1}: ${saveResult.error || 'Failed to save'}`);
        }
      }

      if (processedTransactions.length === 0) {
        return {
          success: false,
          error: 'No transactions could be processed',
          data: {
            transactions: transactions,
            validation_errors: validationErrors
          }
        };
      }

      return {
        success: true,
        data: {
          transactions: processedTransactions,
          validation_errors: validationErrors.length > 0 ? validationErrors : undefined
        },
        entryNumbers: allEntryNumbers
      };

    } catch (error) {
      console.error('Error processing multiple transactions:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Fetch chart of accounts data for accounts used in a transaction
   */
  private async fetchChartOfAccountsForTransaction(response: any): Promise<TransactionData['chart_of_accounts_data']> {
    try {
      // For now, create a simplified chart of accounts data structure
      // based on the known accounts used in the transaction
      const chartOfAccountsData = [];
      
      // We know from the LangGraph response that we have debit and credit entries
      // Let's create basic chart of accounts data for common accounts
      if (response.debit_entry_id && response.credit_entry_id) {
        // For a sale transaction, typically we have Cash (debit) and Sales Revenue (credit)
        chartOfAccountsData.push(
          {
            account_key: 1000,
            report: 'Balance Sheet',
            class: 'Assets',
            subclass: 'Current Assets',
            subclass2: 'Current Assets',
            account: 'Cash',
            subaccount: 'Cash'
          },
          {
            account_key: 4000,
            report: 'Income Statement',
            class: 'Revenue',
            subclass: 'Operating Revenue',
            subclass2: 'Operating Revenue',
            account: 'Sales Revenue',
            subaccount: 'Sales Revenue'
          }
        );
      }

      return chartOfAccountsData;
    } catch (error) {
      console.error('Error creating chart of accounts data:', error);
      return [];
    }
  }

  /**
   * Parse LangGraph response to extract transaction data
   */
  private async parseLangGraphResponse(
    response: any, 
    companyName?: string, 
    country?: string, 
    region?: string
  ): Promise<TransactionData | null> {
    try {
      // Handle the new LangGraph response format
      if (response && response.success && response.journal_id) {
        // New format: { success: true, journal_id: 6, debit_entry_id: 11, credit_entry_id: 12, amount: 100.0, message: "..." }
        // We need to construct a TransactionData object from this response
        
        // Fetch chart of accounts data for the accounts used in this transaction
        const chartOfAccountsData = await this.fetchChartOfAccountsForTransaction(response);
        
        const result: TransactionData = {
          company_data: {
            company_name: companyName || 'Default Company'
          },
          territory_data: {
            country: country || 'Bangladesh',
            region: region || 'Asia'
          },
          calendar_data: {
            date: new Date().toISOString().split('T')[0], // Current date as fallback
            year: new Date().getFullYear(),
            quarter: this.getQuarter(new Date()),
            month: new Date().toLocaleString('default', { month: 'long' }),
            day: new Date().toLocaleString('default', { weekday: 'long' })
          },
          chart_of_accounts_data: chartOfAccountsData,
          general_ledger_entries: [
            {
              account_key: 1000, // Cash account
              details: response.message || 'Transaction processed by LangGraph',
              amount: response.amount || 0,
              type: 'Debit'
            },
            {
              account_key: 4000, // Sales Revenue account
              details: response.message || 'Transaction processed by LangGraph',
              amount: response.amount || 0,
              type: 'Credit'
            }
          ]
        };

        return result;
      }

      // Handle legacy response formats
      let transactionData: any;

      if (response.transactions && Array.isArray(response.transactions) && response.transactions.length > 0) {
        transactionData = response.transactions[0];
      } else if (response.transaction) {
        transactionData = response.transaction;
      } else if (response.companies || response.territory || response.calendar_data) {
        transactionData = response;
      } else {
        console.error('Unexpected response format:', response);
        return null;
      }

      // Ensure required structure for legacy formats
      const result: TransactionData = {
        company_data: {
          company_name: transactionData.companies?.company_name || transactionData.company_name || companyName || ''
        },
        territory_data: {
          country: transactionData.territory?.country || country || 'Bangladesh',
          region: transactionData.territory?.region || region || 'Asia'
        },
        calendar_data: {
          date: transactionData.calendar_data?.date || transactionData.calendar?.date || transactionData.date || '',
          year: transactionData.calendar_data?.year || transactionData.calendar?.year || new Date().getFullYear(),
          quarter: transactionData.calendar_data?.quarter || transactionData.calendar?.quarter || this.getQuarter(new Date()),
          month: transactionData.calendar_data?.month || transactionData.calendar?.month || new Date().toLocaleString('default', { month: 'long' }),
          day: transactionData.calendar_data?.day || transactionData.calendar?.day || new Date().toLocaleString('default', { weekday: 'long' })
        },
        chart_of_accounts_data: this.normalizeChartOfAccounts(
          transactionData.chart_of_accounts_data || 
          transactionData.chartofaccounts || 
          transactionData.accounts || 
          []
        ),
        general_ledger_entries: this.normalizeGeneralLedgerEntries(
          transactionData.general_ledger_entries || 
          transactionData.generalledger || 
          transactionData.entries || 
          []
        )
      };

      return result;
    } catch (error) {
      console.error('Error parsing LangGraph response:', error);
      return null;
    }
  }

  /**
   * Parse multiple transactions from LangGraph response
   */
  private async parseMultipleTransactions(response: any): Promise<TransactionData[] | null> {
    try {
      // Handle new LangGraph format (single transaction)
      if (response && response.success && response.journal_id) {
        const singleTransaction = await this.parseLangGraphResponse(response);
        return singleTransaction ? [singleTransaction] : null;
      }

      // Handle legacy format with multiple transactions
      if (response.transactions && Array.isArray(response.transactions)) {
        const transactions = [];
        for (const transaction of response.transactions) {
          const parsed = await this.parseLangGraphResponse({ transaction });
          if (parsed) transactions.push(parsed);
        }
        return transactions;
      } else {
        // Single transaction in legacy format
        const singleTransaction = await this.parseLangGraphResponse(response);
        return singleTransaction ? [singleTransaction] : null;
      }
    } catch (error) {
      console.error('Error parsing multiple transactions:', error);
      return null;
    }
  }

  /**
   * Normalize chart of accounts data
   */
  private normalizeChartOfAccounts(accounts: any[]): TransactionData['chart_of_accounts_data'] {
    return accounts.map(account => ({
      account_key: account.account_key || 0,
      report: account.report || 'Balance Sheet',
      class: account.class || '',
      subclass: account.subclass || '',
      subclass2: account.subclass2 || account.subclass || '',
      account: account.account || '',
      subaccount: account.subaccount || account.account || ''
    }));
  }

  /**
   * Normalize general ledger entries
   */
  private normalizeGeneralLedgerEntries(entries: any[]): TransactionData['general_ledger_entries'] {
    return entries.map(entry => ({
      account_key: entry.account_key || 0,
      details: entry.details || entry.description || '',
      amount: parseFloat(entry.amount) || 0,
      type: entry.type === 'Debit' || entry.type === 'Credit' ? entry.type : 'Debit'
    }));
  }

  /**
   * Get quarter from date
   */
  private getQuarter(date: Date): string {
    const month = date.getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  /**
   * Validate query before processing
   */
  validateQuery(query: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!query || query.trim().length === 0) {
      errors.push('Query cannot be empty');
    }

    if (query.trim().length < 10) {
      errors.push('Query is too short. Please provide more details about the transaction.');
    }

    // Check for basic transaction elements
    const hasAmount = /\d+/.test(query);
    const hasDate = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)/i.test(query);
    
    if (!hasAmount) {
      errors.push('Please include transaction amounts in your query');
    }

    if (!hasDate) {
      errors.push('Please include transaction dates in your query');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const transactionProcessingService = new TransactionProcessingService();