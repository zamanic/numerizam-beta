import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

// TypeScript interfaces for the transaction payload structure
export interface CompanyData {
  company_name: string;
}

export interface TerritoryData {
  country: string;
  region: string;
}

export interface CalendarData {
  date: string;
  year: number;
  quarter: string;
  month: string;
  day: string;
}

export interface ChartOfAccountsData {
  account_key: number;
  report: string;
  class: string;
  subclass: string;
  subclass2: string;
  account: string;
  subaccount: string;
}

export interface GeneralLedgerEntry {
  account_key: number;
  details: string;
  amount: number;
  type: "Debit" | "Credit";
}

export interface TransactionPayload {
  company_data: CompanyData;
  territory_data: TerritoryData;
  calendar_data: CalendarData;
  chart_of_accounts_data: ChartOfAccountsData[];
  general_ledger_entries: GeneralLedgerEntry[];
}

export interface ReportParams {
  report_type: "profit_and_loss" | "balance_sheet" | "ratio_analysis";
  parameters: {
    country?: string;
    year?: number;
    years?: number[];
  };
}

export interface NumerizamResponse {
  transaction_payload?: TransactionPayload;
  report_type?: string;
  parameters?: any;
}

export interface ParsedResponse {
  jsonData: NumerizamResponse | null;
  displayContent?: string;
}

// Legacy interfaces for backward compatibility with QueryPage
export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  account: string;
  category: string;
}

// This function calls the OpenAI API to process accounting queries
export const askNumerizam = async (
  solMessage: string,
  queryType: "reporting" | "transactional" = "reporting"
): Promise<string> => {
  const SECRET_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!SECRET_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables."
    );
  }

  const chat = new ChatOpenAI({
    apiKey: SECRET_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0.1,
  });

  // System prompt for handling TRANSACTIONS
  const transactionalSystemPrompt = `
# ROLE: You are an expert accountant and bookkeeper AI.
# OBJECTIVE: Your goal is to parse a raw accounting transaction from a user query and create a single, structured JSON object. This JSON will contain all the necessary data to populate five related database tables: Companies, ChartOfAccounts, Territory, Calendar, and GeneralLedger.

# CONTEXT:
## 1. Standard Chart of Accounts (COA)
You MUST use the following standardized Account Keys. Do NOT invent new ones. If a suitable account doesn't exist, use the closest match.
### ASSETS (1000-1999)
- 1000: Cash
- 1001: Cash at Bank - Checking
- 1002: Cash at Bank - Savings
- 1003: Petty Cash
- 1004: Cash equivalents
- 1010: Accounts Receivable
- 1011: Allowance for Doubtful Debts
- 1012: Legal fees receivable
- 1013: Interest receivable
- 1014: Rent receivable
- 1015: Notes receivable
- 1016: Short-term investments
- 1017: Fair value adjustment, securities (S-T)
- 1020: Merchandise inventory
- 1021: Finished goods inventory
- 1022: Goods in process inventory
- 1030: Office supplies
- 1031: Store supplies
- 1032: Prepaid insurance
- 1033: Prepaid interest
- 1034: Prepaid rent
- 1040: Advance to Suppliers
- 1050: Input GST - CGST
- 1051: Input GST - SGST
- 1052: Input GST - IGST
- 1100: Long-term investments
- 1101: Fair value adjustment, securities (L-T)
- 1102: Investment in
- 1103: Bond sinking fund
- 1200: Furniture and Fixtures
- 1201: Office Equipment
- 1202: Store equipment
- 1203: Buildings
- 1204: Land
- 1205: Vehicles
- 1206: Automobiles
- 1207: Trucks
- 1208: Boats
- 1209: Professional library
- 1210: Law library
- 1211: Accumulated depreciation-Automobiles
- 1212: Accumulated depreciation-Trucks
- 1213: Accumulated depreciation-Boats
- 1214: Accumulated depreciation-Professional library
- 1215: Accumulated depreciation-Law library
- 1216: Accumulated depreciation-Furniture
- 1217: Accumulated depreciation-Office equipment
- 1218: Accumulated depreciation-Store equipment
- 1219: Accumulated depreciation-Machinery
- 1220: Accumulated depreciation-Building
- 1221: Accumulated depreciation-Land improvements
- 1300: Mineral deposit
- 1301: Accumulated depletion-Mineral deposit
- 1400: Patents
- 1401: Leasehold
- 1402: Franchise
- 1403: Copyrights
- 1404: Leasehold improvements
- 1405: Licenses
- 1410: Accumulated amortization

### LIABILITIES (2000-2999)
- 2000: Accounts Payable
- 2001: Insurance payable
- 2002: Interest payable
- 2003: Legal fees payable
- 2004: Office salaries payable
- 2005: Rent payable
- 2006: Wages payable
- 2007: Accrued payroll payable
- 2008: Estimated warranty liability
- 2009: Income taxes payable
- 2010: Common dividend payable
- 2011: Preferred dividend payable
- 2012: State unemployment taxes payable
- 2013: Employee federal income taxes payable
- 2014: Employee medical insurance payable
- 2015: Employee retirement program payable
- 2016: Employee union dues payable
- 2017: Federal unemployment taxes payable
- 2018: FICA taxes payable
- 2019: Estimated vacation pay liability
- 2020: Unearned consulting fees
- 2021: Unearned legal fees
- 2022: Unearned property management fees
- 2023: Unearned fees
- 2024: Unearned janitorial revenue
- 2025: Unearned rent
- 2030: Short-term notes payable
- 2031: Discount on short-term notes payable
- 2032: Notes payable
- 2100: Long-term notes payable
- 2101: Discount on long-term notes payable
- 2102: Long-term lease liability
- 2103: Bonds payable
- 2104: Discount on bonds payable
- 2105: Premium on bonds payable
- 2106: Deferred income tax liability

### OWNER'S EQUITY (3000-3999)
- 3000: Owner's Capital
- 3001: Withdrawals
- 3010: Common stock, $ or BD tk. par value
- 3011: Common stock, no-par value
- 3012: Common stock, $ or BD tk. stated value
- 3013: Common stock dividend distributable
- 3020: Paid-in capital in excess of par value, Common stock
- 3021: Paid-in capital in excess of stated value, No-par common stock
- 3022: Paid-in capital from retirement of common stock
- 3023: Paid-in capital, Treasury stock
- 3030: Preferred stock
- 3031: Paid-in capital in excess of par value, Preferred stock
- 3003: Retained Earnings
- 3040: Cash dividends
- 3041: Stock dividends
- 3050: Treasury stock, Common
- 3060: Unrealized gain Equity
- 3061: Unrealized loss-Equity

### REVENUE (4000-4999)
- 4000: Sales Revenue
- 4001: Services revenue
- 4002: Commissions earned
- 4003: Rent revenue
- 4004: Interest Income
- 4005: Commission Income
- 4006: Discount Received
- 4007: Gain on Sale of Asset
- 4010: Sales returns and allowances
- 4011: Sales discounts

### EXPENSES (5000-5999)
- 5000: Cost of Goods Sold (COGS)
- 5001: Purchases - Materials
- 5002: Freight & Shipping Inward
- 5003: Packaging Costs
- 5100: Rent Expense
- 5101: Salaries and Wages
- 5102: Employee Benefits
- 5103: Office Supplies
- 5104: Utilities
- 5105: Telephone & Internet
- 5106: Postage & Courier
- 5107: Repairs and Maintenance
- 5108: Printing & Stationery
- 5109: Insurance Expense
- 5110: Bank Charges
- 5111: Professional Fees
- 5112: Legal fees expense
- 5113: Depreciation Expense
- 5114: Amortization expense
- 5115: Miscellaneous Expenses
- 5200: Advertising & Promotion
- 5201: Travel & Entertainment
- 5202: Commission to Agents
- 5203: Customer Discounts Allowed
- 5300: Interest Expense
- 5301: Finance Charges
- 5302: Foreign Exchange Loss
- 5400: Income taxes expense

## 2. Table Schemas & Defaulting Rules
- **Companies**:
  - \`company_name\`: Extract from the query or if not available then from Accountant's registration storage / database.
  - Omit \`company_id\` (auto-increment).
- **Territory**:
  - \`country\`: Extract from the query. If missing, default to "Bangladesh".
  - \`region\`: Infer from country or use a general region. Default to "Asia".
  - Omit \`Territory_key\` (the backend will handle this mapping).
- **Calendar**:
  - \`date\`: Extract from the query in "YYYY-MM-DD" format.
  - From the date, derive \`year\`, \`quarter\` (e.g., "Q3"), \`month\` (e.g., "July"), \`day\` (e.g., "Monday").
- **ChartOfAccounts**:
  - For each account involved in the transaction, create an entry.
  - Use the standard \`account_key\` from the list above.
  - Fill in \`report\`, \`class\`, \`subclass\`, etc., based on the account type.
- **GeneralLedger**:
  - Every transaction will have at least two entries: one Debit (Dr) and one Credit (Cr).
  - The sum of debits must equal the sum of credits.
  - Link to the correct \`account_key\` for each leg of the entry.

# INSTRUCTIONS:
1.  Analyze the user's transactional query.
2.  Generate a single JSON object with a root key named \`transaction_payload\`.
3.  Inside \`transaction_payload\`, create keys for each table: \`company_data\`, \`chart_of_accounts_data\` (this will be an array of objects), \`territory_data\`, \`calendar_data\`, and \`general_ledger_entries\` (an array for Dr/Cr).
4.  Follow all defaulting rules for missing information.
5.  Return ONLY the raw JSON object and nothing else.

## Example
User Query: "On July 26, 2025, Numerizam Inc. performed services for a client and received $1,500 cash in the USA."

Your Output:

{{
  "transaction_payload": {{
    "companies": {{
      "company_id": 0001,
      "company_name": "Numerizam Inc.",
      "created_at": "2025-07-26 12:00:00"
    }},
    "territory": {{
      "company_id": 0001,
      "territory_key": 008, 
      "country": "USA",
      "region": "North America"
    }},
    "calendar": {{
      "company_id": 0001,
      "date": "2025-07-26",
      "year": 2025,
      "quarter": "Q3",
      "month": "July",
      "day": "Saturday"
    }},
    "chartofaccounts": [
      {
        "company_id": 0001,
        "account_key": 1000,
        "report": "Balance Sheet",
        "class": "Assets",
        "subclass": "Current Assets",
        "subclass2": "Current Assets",
        "account": "Cash",
        "subcccount": "Cash"
      },
      {
        "company_id": 0001,
        "account_key": 4000,
        "report": "Profit and Loss",
        "class": "Revenue",
        "subclass": "Sales Revenue",
        "subclass2": "Sales Revenue",
        "account": "Sales Revenue",
        "subaccount": "Sales Revenue"
      }
    ],
    "generalledger": [
      {
        "entryno": 025,
        "company_id": 0001,
        "date": "2025-07-26",
        "account_key": 1000,
        "details": "Cash received for services rendered",
        "amount": 1500,
        "type": "Debit",
        "territory_key": 008
      },
      {
        "entryno": 025,
        "company_id": 0001,
        "date": "2025-07-26",      
        "account_key": 4000,
        "details": "Revenue from services rendered",
        "amount": 1500,
        "type": "Credit",
        "territory_key": 008
      }}
    ]
  }}
}}
`;

  const reportingSystemPrompt = `
# ROLE: You are an expert financial analyst AI.
# OBJECTIVE: Your goal is to translate a user's plain-language request for a financial report into a structured JSON object. 
             This JSON object will be used to call a backend API. You MUST ONLY return the JSON object and nothing else.

# CONTEXT: You can request data from the following API reports. You must identify the correct report and the necessary parameters based on the user's query.

1.  **Report Type: 'profit_and_loss'**
    * Description: Generates a standard Profit and Loss statement.
    * API Endpoint: \`/api/reports/profit-loss/\`
    * Parameters:
        * \`country\` (string, optional): Filter by a specific country (e.g., "France").
        * \`year\` (integer, optional): Filter for a single year (e.g., 2024).
        * \`years\` (array of integers, optional): Filter for multiple years (e.g., [2024, 2023, 2022]).

2.  **Report Type: 'balance_sheet'**
    * Description: Generates a cumulative Balance Sheet.
    * API Endpoint: \`/api/reports/balance-sheet/\`
    * Parameters:
        * \`country\` (string, optional): Filter by a specific country.
        * \`year\` (integer, required): The "as at" year for the report.

3.  **Report Type: 'ratio_analysis'**
    * Description: Calculates key financial ratios.
    * API Endpoint: \`/api/reports/ratio-analysis/\`
    * Parameters:
        * \`country\` (string, optional): Filter for a specific country.
        * \`year\` (integer, optional): Calculate ratios for a single year.
        * \`years\` (array of integers, optional): Compare ratios over multiple years.

# INSTRUCTIONS:
1.  Analyze the user's query to determine which report they need.
2.  Extract all relevant parameters (like countries or years).
3.  Construct a single, valid JSON object with two keys: "report_type" and "parameters".
4.  You MUST NOT return any other text, explanation, or markdown. Only the raw JSON object.

## Example 1
User Query: "Show me the P&L for Germany for 2023"
Your Output:
{{
  "report_type": "profit_and_loss",
  "parameters": {{
    "country": "Germany",
    "year": 2023
  }}
}}

## Example 2
User Query: "I need to see the balance sheet for last year"
Your Output:
{{
  "report_type": "balance_sheet",
  "parameters": {{
    "year": 2024
  }}
}}

## Example 3
User Query: "Compare financial ratios for Australia over the last 3 years"
Your Output:
{{
  "report_type": "ratio_analysis",
  "parameters": {{
    "country": "Australia",
    "years": [2024, 2023, 2022]
  }}
}}
`;

  // Choose the prompt based on the type of query
  const systemPrompt =
    queryType === "transactional"
      ? transactionalSystemPrompt
      : reportingSystemPrompt;

  const systemMessagePrompt =
    SystemMessagePromptTemplate.fromTemplate(systemPrompt);
  const userMessagePrompt =
    HumanMessagePromptTemplate.fromTemplate("{asked_sol}");
  const chatPrompt = ChatPromptTemplate.fromMessages([
    systemMessagePrompt,
    userMessagePrompt,
  ]);

  const formattedChatPrompt = await chatPrompt.formatMessages({
    asked_sol: solMessage,
  });

  const response = await chat.invoke(formattedChatPrompt);

  // Return the response content as string
  return response.content as string;
};

// Parse the response from the AI and return structured data
export const parseNumerizamResponse = (response: string): ParsedResponse => {
  if (!response) {
    console.error("❌ LLM response is empty.");
    return {
      displayContent: "Error: LLM response was empty.",
      jsonData: null,
    };
  }

  try {
    // Clean the response to handle potential markdown formatting
    let cleanedResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const parsedData: NumerizamResponse = JSON.parse(cleanedResponse);

    return {
      jsonData: parsedData,
    };
  } catch (err) {
    console.error("❌ Failed to parse JSON from response:", err);
    return {
      displayContent: `Failed to parse JSON. Raw data received: \n\n ${response}`,
      jsonData: null,
    };
  }
};
