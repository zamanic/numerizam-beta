import { supabase } from './supabase';
import { 
  Company, 
  Territory, 
  Calendar, 
  ChartOfAccounts, 
  GeneralLedger, 
  AccountantUser,
  TransactionData 
} from '../types/database';

export class SupabaseAccountingService {
  
  // User Management Functions
  
  /**
   * Register a new accountant user
   */
  async registerAccountant(userData: {
    email: string;
    password: string;
    name: string;
    company_name: string;
    country: string;
    region: string;
  }): Promise<{ user: AccountantUser | null; error: string | null }> {
    try {
      // First, create the user in Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            company_name: userData.company_name,
            country: userData.country,
            region: userData.region,
            role: 'Accountant'
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      // The trigger will automatically create the numerizamauth record
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the created user profile
      const { data: profileData, error: profileError } = await supabase
        .from('numerizamauth')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      // Convert to AccountantUser format
      const accountantUser: AccountantUser = {
        id: profileData.auth_user_id,
        email: profileData.email,
        name: profileData.name,
        company_name: profileData.company_name,
        country: profileData.country,
        region: profileData.region,
        role: profileData.role as 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor',
        is_approved: profileData.is_approved,
        created_at: profileData.created_at
      };

      return { user: accountantUser, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  /**
   * Approve an accountant user (Admin only)
   */
  async approveAccountant(userId: string, _adminId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: _data, error } = await supabase
        .from('numerizamauth')
        .update({
          is_approved: true
        })
        .eq('auth_user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get pending accountant registrations (Admin only)
   */
  async getPendingRegistrations(): Promise<{ users: AccountantUser[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('numerizamauth')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) {
        return { users: [], error: error.message };
      }

      // Convert to AccountantUser format
      const accountantUsers: AccountantUser[] = (data || []).map(user => ({
        id: user.auth_user_id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        country: user.country,
        region: user.region,
        role: user.role as 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor',
        is_approved: user.is_approved,
        created_at: user.created_at
      }));

      return { users: accountantUsers, error: null };
    } catch (error) {
      return { users: [], error: (error as Error).message };
    }
  }

  /**
   * Reject an accountant user (Admin only)
   */
  async rejectAccountant(userId: string, _adminId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await supabase
        .from('numerizamauth')
        .delete()
        .eq('auth_user_id', userId);

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Company Management Functions

  /**
   * Create or get company
   */
  async createOrGetCompany(companyName: string): Promise<{ company: Company | null; error: string | null }> {
    try {
      // First, try to find existing company
      const { data: existingCompany, error: findError } = await supabase
        .from('companies')
        .select('*')
        .eq('company_name', companyName)
        .single();

      if (existingCompany && !findError) {
        return { company: existingCompany, error: null };
      }

      // If not found, create new company
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([{ company_name: companyName }])
        .select()
        .single();

      if (createError) {
        return { company: null, error: createError.message };
      }

      return { company: newCompany, error: null };
    } catch (error) {
      return { company: null, error: (error as Error).message };
    }
  }

  // Territory Management Functions

  /**
   * Create or get territory
   */
  async createOrGetTerritory(companyId: number, country: string, region: string): Promise<{ territory: Territory | null; error: string | null }> {
    try {
      // First, try to find existing territory
      const { data: existingTerritory, error: findError } = await supabase
        .from('territory')
        .select('*')
        .eq('company_id', companyId)
        .eq('country', country)
        .eq('region', region)
        .single();

      if (existingTerritory && !findError) {
        return { territory: existingTerritory, error: null };
      }

      // Get the next territory_key for this company
      const { data: maxTerritoryKey } = await supabase
        .from('territory')
        .select('territory_key')
        .eq('company_id', companyId)
        .order('territory_key', { ascending: false })
        .limit(1)
        .single();

      const nextTerritoryKey = ((maxTerritoryKey as { territory_key: number } | null)?.territory_key || 0) + 1;

      // Create new territory
      const { data: newTerritory, error: createError } = await supabase
        .from('territory')
        .insert([{
          company_id: companyId,
          territory_key: nextTerritoryKey,
          country,
          region
        }])
        .select()
        .single();

      if (createError) {
        return { territory: null, error: createError.message };
      }

      return { territory: newTerritory, error: null };
    } catch (error) {
      return { territory: null, error: (error as Error).message };
    }
  }

  // Calendar Management Functions

  /**
   * Create or get calendar entry
   */
  async createOrGetCalendar(companyId: number, calendarData: {
    date: string;
    year: number;
    quarter: string;
    month: string;
    day: string;
  }): Promise<{ calendar: Calendar | null; error: string | null }> {
    try {
      // First, try to find existing calendar entry
      const { data: existingCalendar, error: findError } = await supabase
        .from('calendar')
        .select('*')
        .eq('company_id', companyId)
        .eq('date', calendarData.date)
        .single();

      if (existingCalendar && !findError) {
        return { calendar: existingCalendar, error: null };
      }

      // Create new calendar entry - map to database field names
      const { data: newCalendar, error: createError } = await supabase
        .from('calendar')
        .insert([{
          company_id: companyId,
          date: calendarData.date,
          year: calendarData.year,
          quarter: calendarData.quarter,
          month: calendarData.month,
          day: calendarData.day
        }])
        .select()
        .single();

      if (createError) {
        return { calendar: null, error: createError.message };
      }

      return { calendar: newCalendar, error: null };
    } catch (error) {
      return { calendar: null, error: (error as Error).message };
    }
  }

  // Chart of Accounts Management Functions

  /**
   * Create or get chart of accounts entry
   */
  async createOrGetChartOfAccounts(companyId: number, accountData: {
    account_key: number;
    report: string;
    class: string;
    subclass: string;
    subclass2: string;
    account: string;
    subaccount: string;
  }): Promise<{ account: ChartOfAccounts | null; error: string | null }> {
    try {
      // First, try to find existing account
      const { data: existingAccount, error: findError } = await supabase
        .from('chartofaccounts')
        .select('*')
        .eq('company_id', companyId)
        .eq('account_key', accountData.account_key)
        .single();

      if (existingAccount && !findError) {
        return { account: existingAccount, error: null };
      }

      // Create new account entry - map to database field names
      const { data: newAccount, error: createError } = await supabase
        .from('chartofaccounts')
        .insert([{
          company_id: companyId,
          account_key: accountData.account_key,
          report: accountData.report,
          class: accountData.class,
          subclass: accountData.subclass,
          subclass2: accountData.subclass2,
          account: accountData.account,
          subaccount: accountData.subaccount
        }])
        .select()
        .single();

      if (createError) {
        return { account: null, error: createError.message };
      }

      return { account: newAccount, error: null };
    } catch (error) {
      return { account: null, error: (error as Error).message };
    }
  }

  // General Ledger Management Functions

  /**
   * Create general ledger entry
   */
  async createGeneralLedgerEntry(companyId: number, territoryKey: number, entryData: {
    date: string;
    account_key: number;
    details: string;
    amount: number;
    type: 'Debit' | 'Credit';
  }): Promise<{ entry: GeneralLedger | null; error: string | null }> {
    try {
      const { data: newEntry, error: createError } = await supabase
        .from('generalledger')
        .insert([{
          company_id: companyId,
          territory_key: territoryKey,
          ...entryData
        }])
        .select()
        .single();

      if (createError) {
        return { entry: null, error: createError.message };
      }

      return { entry: newEntry, error: null };
    } catch (error) {
      return { entry: null, error: (error as Error).message };
    }
  }

  // Transaction Processing Functions

  /**
   * Process and save complete transaction data
   */
  async saveTransactionData(userId: string, transactionData: TransactionData): Promise<{ success: boolean; error: string | null; entryNumbers?: number[] }> {
    try {
      // Skip user validation for demo mode
      if (userId !== 'demo-user') {
        // Get user information for real users
        const { data: user, error: userError } = await supabase
          .from('numerizamauth')
          .select('*')
          .eq('id', userId)
          .eq('is_approved', true)
          .single();

        if (userError || !user) {
          return { success: false, error: 'User not found or not approved' };
        }
      }

      // 1. Create or get company
      const { company, error: companyError } = await this.createOrGetCompany(transactionData.company_data.company_name);
      if (companyError || !company) {
        return { success: false, error: companyError || 'Failed to create company' };
      }

      // 2. Create or get territory
      const { territory, error: territoryError } = await this.createOrGetTerritory(
        company.company_id,
        transactionData.territory_data.country,
        transactionData.territory_data.region
      );
      if (territoryError || !territory) {
        return { success: false, error: territoryError || 'Failed to create territory' };
      }

      // 3. Create or get calendar entry
      const { calendar, error: calendarError } = await this.createOrGetCalendar(
        company.company_id,
        transactionData.calendar_data
      );
      if (calendarError || !calendar) {
        return { success: false, error: calendarError || 'Failed to create calendar entry' };
      }

      // 4. Create or get chart of accounts entries
      for (const accountData of transactionData.chart_of_accounts_data) {
        const { error: accountError } = await this.createOrGetChartOfAccounts(company.company_id, accountData);
        if (accountError) {
          return { success: false, error: `Failed to create chart of accounts: ${accountError}` };
        }
      }

      // 5. Create general ledger entries
      const entryNumbers: number[] = [];
      for (const ledgerEntry of transactionData.general_ledger_entries) {
        const { entry, error: ledgerError } = await this.createGeneralLedgerEntry(
          company.company_id,
          territory.territory_key,
          {
            date: transactionData.calendar_data.date,
            account_key: ledgerEntry.account_key,
            details: ledgerEntry.details,
            amount: ledgerEntry.amount,
            type: ledgerEntry.type
          }
        );

        if (ledgerError || !entry) {
          return { success: false, error: `Failed to create general ledger entry: ${ledgerError}` };
        }

        entryNumbers.push(entry.entryno);
      }

      return { success: true, error: null, entryNumbers };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Income Statement Functions

  /**
   * Get companies for dropdown selection
   */
  async getCompanies(): Promise<{ companies: Company[] | null; error: string | null }> {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('company_name');

      if (error) {
        return { companies: null, error: error.message };
      }

      return { companies, error: null };
    } catch (error) {
      return { companies: null, error: (error as Error).message };
    }
  }

  /**
   * Get available years from the database
   */
  async getAvailableYears(): Promise<{ years: number[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('generalledger')
        .select('date')
        .not('date', 'is', null);

      if (error) {
        return { years: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { years: [], error: null };
      }

      // Extract unique years from the dates
      const years = [...new Set(data.map(row => new Date(row.date).getFullYear()))]
        .filter(year => !isNaN(year))
        .sort((a, b) => a - b);

      return { years, error: null };
    } catch (error) {
      return { years: null, error: (error as Error).message };
    }
  }

  /**
   * Get available countries from the database
   */
  async getAvailableCountries(): Promise<{ countries: string[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('territory')
        .select('country')
        .not('country', 'is', null);

      if (error) {
        return { countries: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { countries: [], error: null };
      }

      // Extract unique countries
      const countries = [...new Set(data.map(row => row.country))]
        .filter(country => country && country.trim() !== '')
        .sort();

      return { countries, error: null };
    } catch (error) {
      return { countries: null, error: (error as Error).message };
    }
  }

  /**
   * Generate Income Statement data with country filter
   */
  async generateIncomeStatement(
    companyName: string,
    startDate: string,
    endDate: string,
    years: number[],
    country?: string
  ): Promise<{ data: any[] | null; error: string | null }> {
    try {
      // First, get the company ID
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('company_id')
        .eq('company_name', companyName)
        .single();

      if (companyError || !company) {
        return { data: null, error: companyError?.message || 'Company not found' };
      }

      // Build the query with country filter if specified
      let query = supabase
        .from('generalledger')
        .select(`
          account_key,
          date,
          amount,
          chartofaccounts!inner (
            report,
            class,
            account
          ),
          territory!inner (
            country
          )
        `)
        .eq('company_id', company.company_id)
        .eq('chartofaccounts.report', 'Income Statement')
        .gte('date', startDate)
        .lte('date', endDate);

      // Add country filter if specified
      if (country && country !== 'All Countries') {
        query = query.eq('territory.country', country);
      }

      const { data: rawData, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      if (!rawData || rawData.length === 0) {
        return { data: [], error: null };
      }

      // Group and aggregate the data by account_key
      const groupedData = rawData.reduce((acc: any, row: any) => {
        const key = row.account_key;
        const year = new Date(row.date).getFullYear();
        
        if (!acc[key]) {
          acc[key] = {
            account_key: row.account_key,
            report: row.chartofaccounts.report,
            class: row.chartofaccounts.class,
            account: row.chartofaccounts.account,
            yearTotals: {}
          };
        }

        // Initialize year total if not exists
        if (!acc[key].yearTotals[year]) {
          acc[key].yearTotals[year] = 0;
        }

        // Add amount to year total
        acc[key].yearTotals[year] += row.amount || 0;

        return acc;
      }, {});

      // Convert to array and format the year columns
      const formattedData = Object.values(groupedData).map((item: any) => {
        const result: any = {
          account_key: item.account_key,
          report: item.report,
          class: item.class,
          account: item.account
        };

        // Add year columns with proper property names
        years.forEach(year => {
          const amount = item.yearTotals[year] || 0;
          // Use year as property name (not year_XXXX) to match the component expectations
          result[year] = amount;
        });

        return result;
      });

      // Sort by class and account_key
      formattedData.sort((a, b) => {
        if (a.class !== b.class) {
          return a.class.localeCompare(b.class);
        }
        return a.account_key - b.account_key;
      });

      return { data: formattedData, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get transaction details for drill-down functionality
   */
  async getTransactionDetails(
    companyName: string,
    accountKey: number,
    year: number
  ): Promise<{ data: any[] | null; error: string | null }> {
    try {
      // First, get the company ID
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('company_id')
        .eq('company_name', companyName)
        .single();

      if (companyError || !company) {
        return { data: null, error: companyError?.message || 'Company not found' };
      }

      // Get transaction details for the specific account and year
      const { data: transactions, error } = await supabase
        .from('generalledger')
        .select(`
          entryno,
          date,
          details,
          amount,
          type,
          chartofaccounts!inner (
            account,
            class,
            subclass,
            subaccount
          )
        `)
        .eq('company_id', company.company_id)
        .eq('account_key', accountKey)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Format the transaction data to match TransactionDetail interface
      const formattedTransactions = (transactions || []).map(transaction => ({
        transaction_id: transaction.entryno?.toString() || 'N/A',
        date: new Date(transaction.date).toLocaleDateString(),
        description: transaction.details || 'No description',
        amount: transaction.amount || 0,
        reference: transaction.type || 'N/A'
      }));

      return { data: formattedTransactions, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Helper Functions

  /**
   * Validate transaction data for missing required fields
   */
  validateTransactionData(transactionData: TransactionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check company name
    if (!transactionData.company_data?.company_name?.trim()) {
      errors.push('Company name is required');
    }

    // Check territory data
    if (!transactionData.territory_data?.country?.trim()) {
      errors.push('Country is required');
    }
    if (!transactionData.territory_data?.region?.trim()) {
      errors.push('Region is required');
    }

    // Check calendar data
    if (!transactionData.calendar_data?.date) {
      errors.push('Transaction date is required');
    }

    // Check chart of accounts
    if (!transactionData.chart_of_accounts_data || transactionData.chart_of_accounts_data.length === 0) {
      errors.push('Chart of accounts data is required');
    } else {
      transactionData.chart_of_accounts_data.forEach((account, index) => {
        if (!account.account_key) {
          errors.push(`Account key is required for chart of accounts entry ${index + 1}`);
        }
        if (!account.account?.trim()) {
          errors.push(`Account name is required for chart of accounts entry ${index + 1}`);
        }
        if (!account.subclass2?.trim()) {
          // Auto-fill subclass2 with subclass if empty
          account.subclass2 = account.subclass;
        }
        if (!account.subaccount?.trim()) {
          // Auto-fill subaccount with account if empty
          account.subaccount = account.account;
        }
      });
    }

    // Check general ledger entries
    if (!transactionData.general_ledger_entries || transactionData.general_ledger_entries.length === 0) {
      errors.push('General ledger entries are required');
    } else {
      let totalDebits = 0;
      let totalCredits = 0;

      transactionData.general_ledger_entries.forEach((entry, index) => {
        if (!entry.account_key) {
          errors.push(`Account key is required for general ledger entry ${index + 1}`);
        }
        if (!entry.details?.trim()) {
          errors.push(`Details are required for general ledger entry ${index + 1}`);
        }
        if (!entry.amount || entry.amount <= 0) {
          errors.push(`Valid amount is required for general ledger entry ${index + 1}`);
        }
        if (!entry.type || !['Debit', 'Credit'].includes(entry.type)) {
          errors.push(`Valid type (Debit/Credit) is required for general ledger entry ${index + 1}`);
        }

        // Calculate totals for balance check
        if (entry.type === 'Debit') {
          totalDebits += entry.amount;
        } else if (entry.type === 'Credit') {
          totalCredits += entry.amount;
        }
      });

      // Check if debits equal credits
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        errors.push(`Transaction is not balanced. Total debits (${totalDebits}) must equal total credits (${totalCredits})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const supabaseAccountingService = new SupabaseAccountingService();