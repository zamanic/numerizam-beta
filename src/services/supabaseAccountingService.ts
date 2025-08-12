import { supabase } from "./supabase";
import {
  Company,
  Territory,
  Calendar,
  ChartOfAccounts,
  GeneralLedger,
  AccountantUser,
  TransactionData,
} from "../types/database";

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
            role: "Accountant",
          },
        },
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      // The trigger will automatically create the numerizamauth record
      // Wait a moment for the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the created user profile
      const { data: profileData, error: profileError } = await supabase
        .from("numerizamauth")
        .select("*")
        .eq("email", userData.email)
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
        role: profileData.role as
          | "Admin"
          | "Accountant"
          | "Viewer"
          | "Auditor"
          | "Investor",
        is_approved: profileData.is_approved,
        created_at: profileData.created_at,
      };

      return { user: accountantUser, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  /**
   * Approve an accountant user (Admin only)
   */
  async approveAccountant(
    userId: string,
    _adminId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: _data, error } = await supabase
        .from("numerizamauth")
        .update({
          is_approved: true,
        })
        .eq("auth_user_id", userId)
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
  async getPendingRegistrations(): Promise<{
    users: AccountantUser[];
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("numerizamauth")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) {
        return { users: [], error: error.message };
      }

      // Convert to AccountantUser format
      const accountantUsers: AccountantUser[] = (data || []).map((user) => ({
        id: user.auth_user_id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        country: user.country,
        region: user.region,
        role: user.role as
          | "Admin"
          | "Accountant"
          | "Viewer"
          | "Auditor"
          | "Investor",
        is_approved: user.is_approved,
        created_at: user.created_at,
      }));

      return { users: accountantUsers, error: null };
    } catch (error) {
      return { users: [], error: (error as Error).message };
    }
  }

  /**
   * Reject an accountant user (Admin only)
   */
  async rejectAccountant(
    userId: string,
    _adminId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await supabase
        .from("numerizamauth")
        .delete()
        .eq("auth_user_id", userId);

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
  async createOrGetCompany(
    companyName: string
  ): Promise<{ company: Company | null; error: string | null }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('createOrGetCompany: User not authenticated');
        return { company: null, error: 'User not authenticated' };
      }

      // First, try to find existing company
      const { data: existingCompany, error: findError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_name", companyName)
        .maybeSingle();

      if (existingCompany && !findError) {
        return { company: existingCompany, error: null };
      }

      // If not found, create new company
      const { data: newCompany, error: createError } = await supabase
        .from("companies")
        .insert([{ company_name: companyName }])
        .select()
        .single();

      if (createError) {
        console.error('createOrGetCompany: Error creating company:', createError);
        return { company: null, error: createError.message };
      }

      return { company: newCompany, error: null };
    } catch (error) {
      console.error('createOrGetCompany: Exception:', error);
      return { company: null, error: (error as Error).message };
    }
  }

  // Territory Management Functions

  /**
   * Create or get territory
   */
  async createOrGetTerritory(
    companyId: number,
    country: string,
    region: string
  ): Promise<{ territory: Territory | null; error: string | null }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('createOrGetTerritory: User not authenticated');
        return { territory: null, error: 'User not authenticated' };
      }

      // First, try to find existing territory
      const { data: existingTerritory, error: findError } = await supabase
        .from("territory")
        .select("*")
        .eq("company_id", companyId)
        .eq("country", country)
        .eq("region", region)
        .maybeSingle();

      if (existingTerritory && !findError) {
        return { territory: existingTerritory, error: null };
      }

      // Get the next territory_key globally
      const { data: maxTerritoryKey } = await supabase
        .from("territory")
        .select("territory_key")
        .order("territory_key", { ascending: false })
        .limit(1)
        .single();

      const nextTerritoryKey =
        ((maxTerritoryKey as { territory_key: number } | null)?.territory_key ||
          0) + 1;

      // Create new territory
      const { data: newTerritory, error: createError } = await supabase
        .from("territory")
        .insert([
          {
            company_id: companyId,
            territory_key: nextTerritoryKey,
            country,
            region,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('createOrGetTerritory: Error creating territory:', createError);
        // Handle race condition - check if territory was created by another process
        if (createError.code === '23505') { // Unique constraint violation
          const { data: existingTerritory, error: findError2 } = await supabase
            .from("territory")
            .select("*")
            .eq("company_id", companyId)
            .eq("country", country)
            .eq("region", region)
            .maybeSingle();
          
          if (existingTerritory && !findError2) {
            return { territory: existingTerritory, error: null };
          }
        }
        return { territory: null, error: createError.message };
      }

      return { territory: newTerritory, error: null };
    } catch (error) {
      console.error('createOrGetTerritory: Exception:', error);
      return { territory: null, error: (error as Error).message };
    }
  }

  // Calendar Management Functions

  /**
   * Create or get calendar entry
   */
  async createOrGetCalendar(
    companyId: number,
    calendarData: {
      date: string;
      year: number;
      quarter: string;
      month: string;
      day: string;
    }
  ): Promise<{ calendar: Calendar | null; error: string | null }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('createOrGetCalendar: User not authenticated');
        return { calendar: null, error: 'User not authenticated' };
      }

      // First, try to find existing calendar entry
      const { data: existingCalendar, error: findError } = await supabase
        .from("calendar")
        .select("*")
        .eq("company_id", companyId)
        .eq("date", calendarData.date)
        .maybeSingle();

      if (existingCalendar && !findError) {
        return { calendar: existingCalendar, error: null };
      }

      // Create new calendar entry - map to database field names
      const { data: newCalendar, error: createError } = await supabase
        .from("calendar")
        .insert([
          {
            company_id: companyId,
            date: calendarData.date,
            year: calendarData.year,
            quarter: calendarData.quarter,
            month: calendarData.month,
            day: calendarData.day,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('createOrGetCalendar: Error creating calendar:', createError);
        return { calendar: null, error: createError.message };
      }

      return { calendar: newCalendar, error: null };
    } catch (error) {
      console.error('createOrGetCalendar: Exception:', error);
      return { calendar: null, error: (error as Error).message };
    }
  }

  // Chart of Accounts Management Functions

  /**
   * Create or get chart of accounts entry
   */
  async createOrGetChartOfAccounts(
    companyId: number,
    accountData: {
      account_key: number;
      report: string;
      class: string;
      subclass: string;
      subclass2: string;
      account: string;
      subaccount: string;
    }
  ): Promise<{ account: ChartOfAccounts | null; error: string | null }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('createOrGetChartOfAccounts: User not authenticated');
        return { account: null, error: 'User not authenticated' };
      }

      // First, try to find existing account
      const { data: existingAccount, error: findError } = await supabase
        .from("chartofaccounts")
        .select("*")
        .eq("company_id", companyId)
        .eq("account_key", accountData.account_key)
        .maybeSingle();

      if (existingAccount && !findError) {
        return { account: existingAccount, error: null };
      }

      // Create new account entry - map to database field names
      const { data: newAccount, error: createError } = await supabase
        .from("chartofaccounts")
        .insert([
          {
            company_id: companyId,
            account_key: accountData.account_key,
            report: accountData.report,
            class: accountData.class,
            subclass: accountData.subclass,
            subclass2: accountData.subclass2,
            account: accountData.account,
            subaccount: accountData.subaccount,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('createOrGetChartOfAccounts: Error creating chart of accounts:', createError);
        return { account: null, error: createError.message };
      }

      return { account: newAccount, error: null };
    } catch (error) {
      console.error('createOrGetChartOfAccounts: Exception:', error);
      return { account: null, error: (error as Error).message };
    }
  }

  // General Ledger Management Functions

  /**
   * Create general ledger entry
   */
  async createGeneralLedgerEntry(
    companyId: number,
    territoryKey: number,
    entryData: {
      date: string;
      account_key: number;
      details: string;
      amount: number;
      type: "Debit" | "Credit";
    }
  ): Promise<{ entry: GeneralLedger | null; error: string | null }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('createGeneralLedgerEntry: User not authenticated');
        return { entry: null, error: 'User not authenticated' };
      }

      // First, ensure the account exists in chartofaccounts for this company
      const { data: accountExists, error: accountCheckError } = await supabase
        .from("chartofaccounts")
        .select("account_key")
        .eq("company_id", companyId)
        .eq("account_key", entryData.account_key)
        .single();

      if (!accountExists || accountCheckError) {
        console.error('createGeneralLedgerEntry: Account key not found in chartofaccounts for this company:', entryData.account_key, accountCheckError);
        return { entry: null, error: `Account key ${entryData.account_key} not found for company ${companyId}` };
      }

      const { data: newEntry, error: createError } = await supabase
        .from("generalledger")
        .insert([
          {
            company_id: companyId,
            territory_key: territoryKey,
            ...entryData,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('createGeneralLedgerEntry: Error creating general ledger entry:', createError);
        return { entry: null, error: createError.message };
      }

      return { entry: newEntry, error: null };
    } catch (error) {
      console.error('createGeneralLedgerEntry: Exception:', error);
      return { entry: null, error: (error as Error).message };
    }
  }

  // Transaction Processing Functions

  /**
   * Process and save complete transaction data
   */
  async saveTransactionData(
    userId: string,
    transactionData: TransactionData
  ): Promise<{
    success: boolean;
    error: string | null;
    entryNumbers?: number[];
  }> {
    try {
      // Skip user validation for demo mode
      if (userId !== "demo-user") {
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('saveTransactionData: User not authenticated');
          return { success: false, error: 'User not authenticated' };
        }

        // Get user information for real users
        const { data: user, error: userError } = await supabase
          .from("numerizamauth")
          .select("*")
          .eq("id", userId)
          .eq("is_approved", true)
          .single();

        if (userError || !user) {
          console.error('saveTransactionData: User not found or not approved:', userError);
          return { success: false, error: "User not found or not approved" };
        }
      }

      console.log('saveTransactionData: Starting to save transaction data...');
      
      // 1. Create or get company
      console.log('saveTransactionData: Creating or getting company:', transactionData.company_data.company_name);
      const { company, error: companyError } = await this.createOrGetCompany(
        transactionData.company_data.company_name
      );
      if (companyError || !company) {
        console.error('saveTransactionData: Failed to create company:', companyError);
        return {
          success: false,
          error: companyError || "Failed to create company",
        };
      }
      console.log('saveTransactionData: Company created/found:', company.company_id);

      // 2. Create or get territory
      console.log('saveTransactionData: Creating or getting territory:', transactionData.territory_data.country, transactionData.territory_data.region);
      const { territory, error: territoryError } =
        await this.createOrGetTerritory(
          company.company_id,
          transactionData.territory_data.country,
          transactionData.territory_data.region
        );
      if (territoryError || !territory) {
        console.error('saveTransactionData: Failed to create territory:', territoryError);
        return {
          success: false,
          error: territoryError || "Failed to create territory",
        };
      }
      console.log('saveTransactionData: Territory created/found:', territory.territory_key);

      // 3. Create or get calendar entry
      console.log('saveTransactionData: Creating or getting calendar:', transactionData.calendar_data.date);
      const { calendar, error: calendarError } = await this.createOrGetCalendar(
        company.company_id,
        transactionData.calendar_data
      );
      if (calendarError || !calendar) {
        console.error('saveTransactionData: Failed to create calendar:', calendarError);
        return {
          success: false,
          error: calendarError || "Failed to create calendar entry",
        };
      }
      console.log('saveTransactionData: Calendar created/found:', calendar.calendar_id);

      // 4. Create or get chart of accounts entries
      console.log('saveTransactionData: Creating chart of accounts entries...');
      for (const accountData of transactionData.chart_of_accounts_data) {
        console.log('saveTransactionData: Creating account:', accountData.account_key, accountData.account);
        const { error: accountError } = await this.createOrGetChartOfAccounts(
          company.company_id,
          accountData
        );
        if (accountError) {
          console.error('saveTransactionData: Failed to create chart of accounts:', accountError);
          return {
            success: false,
            error: `Failed to create chart of accounts: ${accountError}`,
          };
        }
        console.log('saveTransactionData: Account created/found:', accountData.account_key);
      }

      // 5. Create general ledger entries
      const entryNumbers: number[] = [];
      for (const ledgerEntry of transactionData.general_ledger_entries) {
        console.log('saveTransactionData: Creating general ledger entry:', {
          company_id: company.company_id,
          territory_key: territory.territory_key,
          account_key: ledgerEntry.account_key,
          date: transactionData.calendar_data.date,
          type: ledgerEntry.type
        });

        const { entry, error: ledgerError } =
          await this.createGeneralLedgerEntry(
            company.company_id,
            territory.territory_key,
            {
              date: transactionData.calendar_data.date,
              account_key: ledgerEntry.account_key,
              details: ledgerEntry.details,
              amount: ledgerEntry.amount,
              type: ledgerEntry.type,
            }
          );

        if (ledgerError || !entry) {
          console.error('saveTransactionData: Failed to create general ledger entry:', ledgerError);
          return {
            success: false,
            error: `Failed to create general ledger entry: ${ledgerError}`,
          };
        }

        if (entry) {
          console.log('saveTransactionData: Successfully created general ledger entry:', entry.entryno);
          entryNumbers.push(entry.entryno);
        }
      }

      console.log('saveTransactionData: Successfully saved all transaction data');
      return { success: true, error: null, entryNumbers };
    } catch (error) {
      console.error('saveTransactionData: Exception in save process:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Income Statement Functions

  /**
   * Get companies for dropdown selection
   */
  async getCompanies(): Promise<{
    companies: Company[] | null;
    error: string | null;
  }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('getCompanies: User not authenticated');
        return { companies: null, error: 'User not authenticated' };
      }

      console.log('getCompanies: Making request to companies table...');
      const { data: companies, error } = await supabase
        .from("companies")
        .select("*")
        .order("company_name");

      if (error) {
        console.error('getCompanies: Error fetching companies:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return { companies: null, error: error.message };
      }

      console.log('getCompanies: Successfully fetched', companies?.length || 0, 'companies');
      return { companies, error: null };
    } catch (error) {
      console.error('getCompanies: Exception in getCompanies:', error);
      return { companies: null, error: (error as Error).message };
    }
  }

  /**
   * Get available years from the database
   */
  async getAvailableYears(): Promise<{
    years: number[] | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch available years');
        return { years: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from("generalledger")
        .select("date")
        .not("date", "is", null);

      if (error) {
        return { years: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { years: [], error: null };
      }

      // Extract unique years from the dates
      const years = [
        ...new Set(data.map((row) => new Date(row.date).getFullYear())),
      ]
        .filter((year) => !isNaN(year))
        .sort((a, b) => a - b);

      return { years, error: null };
    } catch (error) {
      return { years: null, error: (error as Error).message };
    }
  }

  /**
   * Get available countries from the database
   */
  async getAvailableCountries(): Promise<{
    countries: string[] | null;
    error: string | null;
  }> {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('getAvailableCountries: User not authenticated');
        return { countries: null, error: 'User not authenticated' };
      }

      console.log('getAvailableCountries: Making request to territory table...');
      const { data, error } = await supabase
        .from("territory")
        .select("country")
        .not("country", "is", null);

      if (error) {
        console.error('getAvailableCountries: Error fetching countries:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return { countries: null, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log('getAvailableCountries: No countries found');
        return { countries: [], error: null };
      }

      // Extract unique countries
      const countries = [...new Set(data.map((row) => row.country))]
        .filter((country) => country && country.trim() !== "")
        .sort();

      console.log('getAvailableCountries: Successfully fetched', countries.length, 'countries');
      return { countries, error: null };
    } catch (error) {
      console.error('getAvailableCountries: Exception in getAvailableCountries:', error);
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
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot generate income statement');
        return { data: [], error: 'User not authenticated' };
      }

      // First, get the company ID
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("company_id")
        .eq("company_name", companyName)
        .single();

      if (companyError || !company) {
        return {
          data: null,
          error: companyError?.message || "Company not found",
        };
      }

      // Build the query with country filter if specified
      let query = supabase
        .from("generalledger")
        .select(
          `
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
        `
        )
        .eq("company_id", company.company_id)
        .eq("chartofaccounts.report", "Income Statement")
        .gte("date", startDate)
        .lte("date", endDate);

      // Add country filter if specified
      if (country && country !== "All Countries") {
        query = query.eq("territory.country", country);
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
            yearTotals: {},
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
          account: item.account,
        };

        // Add year columns with proper property names
        years.forEach((year) => {
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
   * Generate Balance Sheet data for a company
   */
  async generateBalanceSheet(
    companyId: string,
    startYear: number,
    endYear: number,
    country?: string
  ): Promise<{ data: any[] | null; error: string | null }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot generate balance sheet');
        return { data: [], error: 'User not authenticated' };
      }

      // Convert companyId to number
      const companyIdNum = parseInt(companyId);
      if (isNaN(companyIdNum)) {
        return { data: null, error: "Invalid company ID" };
      }

      // Build the query with joins
      let query = supabase
        .from("generalledger")
        .select(
          `
          amount,
          date,
          chartofaccounts!inner (
            account_key,
            report,
            class,
            subclass,
            subclass2,
            account,
            subaccount
          ),
          territory!inner (
            country
          )
        `
        )
        .eq("company_id", companyIdNum)
        .eq("chartofaccounts.report", "Balance Sheet")
        .gte("date", `${startYear}-01-01`)
        .lte("date", `${endYear}-12-31`);

      // Add country filter if provided
      if (country) {
        query = query.eq("territory.country", country);
      }

      const { data: balanceSheetData, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      if (!balanceSheetData || balanceSheetData.length === 0) {
        return { data: [], error: null };
      }

      // Generate array of years for the report
      const years = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }

      // Group and aggregate data by account_key and year
      const groupedData = balanceSheetData.reduce((acc: any, row: any) => {
        const accountKey = row.chartofaccounts.account_key;
        const year = new Date(row.date).getFullYear();
        const amount = parseFloat(row.amount) || 0;

        if (!acc[accountKey]) {
          acc[accountKey] = {
            account_key: accountKey,
            report: row.chartofaccounts.report,
            class: row.chartofaccounts.class,
            subclass: row.chartofaccounts.subclass,
            subclass2: row.chartofaccounts.subclass2,
            account: row.chartofaccounts.account,
            subaccount: row.chartofaccounts.subaccount,
            yearTotals: {},
          };
        }

        if (!acc[accountKey].yearTotals[year]) {
          acc[accountKey].yearTotals[year] = 0;
        }

        acc[accountKey].yearTotals[year] += amount;

        return acc;
      }, {});

      // Convert to array and format with year columns
      const formattedData = Object.values(groupedData).map((item: any) => {
        const result: any = {
          account_key: item.account_key,
          report: item.report,
          class: item.class,
          subclass: item.subclass,
          subclass2: item.subclass2,
          account: item.account,
          subaccount: item.subaccount,
        };

        // Add year columns with formatted numbers (thousands separators)
        years.forEach((year) => {
          const amount = item.yearTotals[year] || 0;
          // Format with thousands separators like the PostgreSQL query
          result[year.toString()] = new Intl.NumberFormat("en-US").format(
            Math.round(amount)
          );
        });

        return result;
      });

      // Sort by class (Assets, Liabilities, Equity) and then by account details
      formattedData.sort((a, b) => {
        // Define the order for balance sheet sections
        const classOrder = ["Assets", "Liabilities", "Equity"];
        const aIndex = classOrder.indexOf(a.class);
        const bIndex = classOrder.indexOf(b.class);

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        // Within the same class, sort by subclass, subclass2, account, subaccount
        if (a.subclass !== b.subclass) {
          return a.subclass.localeCompare(b.subclass);
        }
        if (a.subclass2 !== b.subclass2) {
          return a.subclass2.localeCompare(b.subclass2);
        }
        if (a.account !== b.account) {
          return a.account.localeCompare(b.account);
        }
        return a.subaccount.localeCompare(b.subaccount);
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
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch transaction details');
        return { data: [], error: 'User not authenticated' };
      }

      // First, get the company ID
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("company_id")
        .eq("company_name", companyName)
        .single();

      if (companyError || !company) {
        return {
          data: null,
          error: companyError?.message || "Company not found",
        };
      }

      // Get transaction details for the specific account and year
      const { data: transactions, error } = await supabase
        .from("generalledger")
        .select(
          `
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
        `
        )
        .eq("company_id", company.company_id)
        .eq("account_key", accountKey)
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`)
        .order("date", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Format the transaction data to match TransactionDetail interface
      const formattedTransactions = (transactions || []).map((transaction) => ({
        transaction_id: transaction.entryno?.toString() || "N/A",
        date: new Date(transaction.date).toLocaleDateString(),
        description: transaction.details || "No description",
        amount: transaction.amount || 0,
        reference: transaction.type || "N/A",
      }));

      return { data: formattedTransactions, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get revenue by year for the admin dashboard
   */
  async getRevenueByYear(): Promise<{
    data: Array<{ year: number; sales: number }> | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch revenue by year');
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_revenue_by_year');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get revenue growth for the last two years
   */
  async getRevenueGrowth(): Promise<{
    data: Array<{
      year: number;
      current_year_sales: string;
      previous_year_sales: string;
      revenue_growth_percentage: string;
    }> | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch revenue growth');
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_revenue_growth');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get current year revenue total
   */
  async getCurrentYearRevenue(): Promise<number> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch current year revenue');
        return 0;
      }

      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('generalledger')
        .select(`
          amount,
          chartofaccounts!inner(subclass)
        `)
        .eq('chartofaccounts.subclass', 'Operating Revenue')
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`);

      if (error) {
        console.error('Error fetching current year revenue:', error);
        return 0;
      }

      const totalRevenue = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;
      return totalRevenue;
    } catch (error) {
      console.error('Error in getCurrentYearRevenue:', error);
      return 0;
    }
  }

  /**
   * Get current year expenses total
   */
  async getCurrentYearExpenses(): Promise<number> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch current year expenses');
        return 0;
      }

      const { data, error } = await supabase.rpc('get_current_year_expenses');

      if (error) {
        console.error('Error fetching current year expenses:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentYearExpenses:', error);
      return 0;
    }
  }

  /**
   * Get current year profit total
   */
  async getCurrentYearProfit(): Promise<number> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch current year profit');
        return 0;
      }

      const { data, error } = await supabase.rpc('get_current_year_profit');

      if (error) {
        console.error('Error fetching current year profit:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentYearProfit:', error);
      return 0;
    }
  }

  /**
   * Get current year cash flow total
   */
  async getCurrentYearCashFlow(): Promise<number> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch current year cash flow');
        return 0;
      }

      const { data, error } = await supabase.rpc('get_current_year_cash_flow');

      if (error) {
        console.error('Error fetching current year cash flow:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentYearCashFlow:', error);
      return 0;
    }
  }

  /**
   * Get expenses growth for the last two years
   */
  async getExpensesGrowth(): Promise<{
    data: Array<{
      year: number;
      current_year_expenses: string;
      previous_year_expenses: string;
      expenses_growth_percentage: string;
    }> | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch expenses growth');
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_expenses_growth');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get profit growth for the last two years
   */
  async getProfitGrowth(): Promise<{
    data: Array<{
      year: number;
      current_year_profit: string;
      previous_year_profit: string;
      profit_growth_percentage: string;
    }> | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch profit growth');
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_profit_growth');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Get cash flow growth for the last two years
   */
  async getCashFlowGrowth(): Promise<{
    data: Array<{
      year: number;
      current_year_cash_flow: string;
      previous_year_cash_flow: string;
      cash_flow_growth_percentage: string;
    }> | null;
    error: string | null;
  }> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('User not authenticated, cannot fetch cash flow growth');
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('get_cash_flow_growth');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Helper Functions

  /**
   * Validate transaction data for missing required fields
   */
  validateTransactionData(transactionData: TransactionData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check company name
    if (!transactionData.company_data?.company_name?.trim()) {
      errors.push("Company name is required");
    }

    // Check territory data
    if (!transactionData.territory_data?.country?.trim()) {
      errors.push("Country is required");
    }
    if (!transactionData.territory_data?.region?.trim()) {
      errors.push("Region is required");
    }

    // Check calendar data
    if (!transactionData.calendar_data?.date) {
      errors.push("Transaction date is required");
    }

    // Check chart of accounts
    if (
      !transactionData.chart_of_accounts_data ||
      transactionData.chart_of_accounts_data.length === 0
    ) {
      errors.push("Chart of accounts data is required");
    } else {
      transactionData.chart_of_accounts_data.forEach((account, index) => {
        if (!account.account_key) {
          errors.push(
            `Account key is required for chart of accounts entry ${index + 1}`
          );
        }
        if (!account.account?.trim()) {
          errors.push(
            `Account name is required for chart of accounts entry ${index + 1}`
          );
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
    if (
      !transactionData.general_ledger_entries ||
      transactionData.general_ledger_entries.length === 0
    ) {
      errors.push("General ledger entries are required");
    } else {
      let totalDebits = 0;
      let totalCredits = 0;

      transactionData.general_ledger_entries.forEach((entry, index) => {
        if (!entry.account_key) {
          errors.push(
            `Account key is required for general ledger entry ${index + 1}`
          );
        }
        if (!entry.details?.trim()) {
          errors.push(
            `Details are required for general ledger entry ${index + 1}`
          );
        }
        if (!entry.amount || entry.amount <= 0) {
          errors.push(
            `Valid amount is required for general ledger entry ${index + 1}`
          );
        }
        if (!entry.type || !["Debit", "Credit"].includes(entry.type)) {
          errors.push(
            `Valid type (Debit/Credit) is required for general ledger entry ${
              index + 1
            }`
          );
        }

        // Calculate totals for balance check
        if (entry.type === "Debit") {
          totalDebits += entry.amount;
        } else if (entry.type === "Credit") {
          totalCredits += entry.amount;
        }
      });

      // Check if debits equal credits
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        errors.push(
          `Transaction is not balanced. Total debits (${totalDebits}) must equal total credits (${totalCredits})`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const supabaseAccountingService = new SupabaseAccountingService();
