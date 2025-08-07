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
  console.log("🚀 askNumerizam called with:", { solMessage, queryType });

  const SECRET_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!SECRET_KEY) {
    console.error("❌ OpenAI API key not found");
    throw new Error(
      "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables."
    );
  }

  console.log("✅ OpenAI API key found, initializing chat...");

  const chat = new ChatOpenAI({
    apiKey: SECRET_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0.1,
  });

  // System prompt for handling TRANSACTIONS
  const transactionalSystemPrompt = `
  
### ROLE: You are an expert financial accountant, bookkeeper, and financial data analyst.
### OBJECTIVE: Your goal is to parse raw accounting transactions from users' query and 
create a single, structured JSON object. This JSON will contain all the necessary data 
to populate related database tables: Companies, ChartOfAccounts, Territory, Calendar, 
and GeneralLedger.
### CONTEXT:
### 1. Identify Standard Chart of Account numbers i.e. account_key, class, subclass for any given accounts (from transactions) for consistency: 
You MUST use the following standardized Account Keys which is the standardized chart of account code or number from the 
following tables of Account categories: ASSETS, LIABILITIES, OWNER'S EQUITY, REVENUES, EXPENSES, OTHER INCOMES EXPENSES and TEMPORARY CLOSING ACCOUNT. 
Do NOT invent new account keys (account_key) if you have already designated each account with a standardized chart of account_key. 
If you don't find suitable account name in the table below to match the transactions in the query, use the closest match account name in the table to get the account_key.

### ASSETS (1000-1999)
following table is the standardized classification list of asset accounts classified by account, account_key, class, and subclass separated by pipe '|':

## 1. Standard Chart of Accounts (COA)
  You MUST use the following standardized Account Keys. Do NOT invent new ones. If a suitable account doesn't exist, use the closest match.
  - **Assets (1000-1999):**
    - 1010: Cash
    - 1100: Accounts Receivable
    - 1200: Inventory
    - 1500: Equipment
  - **Liabilities (2000-2999):**
    - 2010: Accounts Payable
    - 2100: Unearned Revenue
  - **Equity (3000-3999):**
    - 3010: Common Stock / Capital
  - **Revenue (4000-4999):**
    - 4010: Sales Revenue
    - 4020: Service Revenue
  - **Expenses (5000-5999):**
    - 5010: Cost of Goods Sold (COGS)
    - 5100: Advertising Expense
    - 5200: Rent Expense
    - 5300: Salaries Expense
  - **Other Incomes Expenses (6000-6999):**
    - 6010: Interest Income
    - 6020: Dividend Income
    - 6030: Other Income
    - 6040: Other Expense
  - **Temporary Closing Account (9000-9999):**
    - 9010: Closing Stock
    - 9020: Closing Accounts Receivable
    - 9030: Closing Accounts Payable
    - 9040: Closing Liabilities
    - 9050: Closing Equity
    - 9060: Closing Revenue
    - 9070: Closing Expenses


### 2. Table Schemas & Defaulting Rules
- **Companies**:
  - \`company_name\`: Extract from the query.
  - Omit \`company_id\` (auto-increment).
- **Territory**:
  - \`Country\`: Extract from the query. If missing, default to "Bangladesh".
  - \`Region\`: Infer from country or use a general region. Default to "Asia".
  - Omit \`Territory_key\` (the backend will handle this mapping).
- **Calendar**:
  - \`Date\`: Extract from the query in "YYYY-MM-DD" format.
  - From the date, derive \`Year\`, \`Quarter\` (e.g., "Q3"), \`Month\` (e.g., "July"), \`Day\` (e.g., "Monday").
- **ChartOfAccounts**:
  - For each account involved in the transaction, create an entry.
  - Use the standard \`Account_key\` from the list above.
  - Fill in \`Report\`, \`Class\`, \`SubClass\`, etc., based on the account type.
- **GeneralLedger**:
  - There could be many transactions in the query. 
  - Every transactions will have at least two entries: one Debit (Dr) and one Credit (Cr).
  - The sum of debits must equal the sum of credits. But in the process of edit no need for equality. 
  - Link to the correct \`Account_key\` for each leg of the entry.

## INSTRUCTIONS:
1.  Analyze the user's transactional query.
2.  Generate a single JSON object with a root key named \`transaction_payload\`.
3.  Inside \`transaction_payload\`, create keys for each table: \`companies\`, \`chartofaccounts\` (this will be an array of objects), \`territory\`, \`calendar\`, and \`generalledger\` (an array for Dr/Cr).
4.  Follow all defaulting rules for missing information.
5.  Return ONLY the raw JSON object and nothing else.

## Example
User Query: "On 24 January 2025, Patrick Incitti company made following 5 transactions: 
1. Invested 999 to open his law practice.
2. Bought office supplies on account, 999.
3. Received 999 in fees earned during the month.
4. Paid 999 on the account for the office supplies.
5. Withdrew 999 for personal use."

Your Output:

[{{
  "transaction_payload": {{
"companies": {{
"company_name": "Patrick Incitti"
}},
"territory": {{
"country": "Bangladesh",
"region": "Asia"
}},
"calendar": {{
"date": "24-01-2024",
"year": 2025,
"quarter": "Q1",
"month": "January",
"day": "Friday"
}},
"chartofaccounts": [
{{
"account_key": 1000,
"report": "Balance Sheet",
"class": "Asset",
"subclass": "Current Asset",
"account": "Cash"
}},
{{
"account_key": 3000,
"report": "Balance Sheet",
"class": "Owner's Equity",
"subclass": "Owner's Equity",
"account": "Owner's Capital"
}},
{{
"account_key": 1030,
"report": "Balance Sheet",
"class": "Asset",
"subclass": "Current Asset",
"account": "Office supplies"
}},
{{
"account_key": 2000,
"report": "Balance Sheet",
"class": "Liability",
"subclass": "Current Liability",
"account": "Accounts Payable"
}},
{{
"account_key": 4000,
"report": "Profit and Loss",
"class": "Revenue",
"subclass": "Operating Revenue",
"account": "Fees earned"
}}],
{{
"account_key": 3001,
"report": "Balance Sheet",
"class": "Owner's Equity",
"subclass": "Owner's Equity",
"account": "Withdrawals"
}}
],
"generalledger": [
{{
"date": "24-01-2024",
"account_key": 1000,
"details": "Owner investment to open law practice",
"amount": 999,
"type": "Debit"
}},
{{
"date": "24-01-2024",
"account_key": 3000,
"details": "Owner investment to open law practice",
"amount": 999,
"type": "Credit"
}},
{{
"date": "24-01-2024",
"account_key": 1030,
"details": "Bought office supplies on account",
"amount": 999,
"type": "Debit"
}},
{{
"date": "24-01-2024",
"account_key": 2000,
"details": "Bought office supplies on account",
"amount": 999,
"type": "Credit"
}},
{{
"date": "24-01-2024",
"account_key": 1000,
"details": "Cash received as fees earned",
"amount": 999,
"type": "Debit"
}},
{{
"date": "24-01-2024",
"account_key": 4000,
"details": "Fees earned during the month",
"amount": 999,
"type": "Credit"
}},
{{
"date": "24-01-2024",
"account_key": 2000,
"details": "Payment on account for office supplies",
"amount": 999,
"type": "Debit"
}},
{{
"date": "24-01-2024",
"account_key": 1000,
"details": "Payment on account for office supplies",
"amount": 999,
"type": "Credit"
}},
{{
"date": "24-01-2024",
"account_key": 3001,
"details": "Owner withdrawal for personal use",
"amount": 999,
"type": "Debit"
}},
{{
"date": "24-01-2024",
"account_key": 1000,
"details": "Owner withdrawal for personal use",
"amount": 999,
"type": "Credit"
}}
]
}}
}}
]
  
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

  try {
    //console.log("📝 Formatting chat prompt...");
    const formattedChatPrompt = await chatPrompt.formatMessages({
      asked_sol: solMessage,
    });
    //console.log("📝 Formatted chat prompt:", formattedChatPrompt);

    //console.log("🔄 Making API call to OpenAI...");
    const response = await chat.invoke(formattedChatPrompt);

    //console.log("✅ API call successful, response received:", response.content);
    // console.log("✅ Response type:", typeof response.content);
    // console.log("✅ Response length:", response.content?.length);

    // Return the response content as string
    return response.content as any;
  } catch (error) {
    console.error("❌ Error in askNumerizam:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Provide user-friendly error messages for common OpenAI issues
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage.includes("429") &&
      errorMessage.toLowerCase().includes("quota")
    ) {
      throw new Error(
        "AI service quota exceeded. Please try again later or contact support."
      );
    } else if (errorMessage.toLowerCase().includes("insufficient_quota")) {
      throw new Error(
        "AI service quota exceeded. Please try again later or contact support."
      );
    } else if (errorMessage.toLowerCase().includes("rate limit")) {
      throw new Error(
        "AI service rate limit exceeded. Please try again in a moment."
      );
    } else if (
      errorMessage.toLowerCase().includes("openai") &&
      errorMessage.toLowerCase().includes("api")
    ) {
      throw new Error(
        "AI service temporarily unavailable. Please try again later."
      );
    } else {
      throw new Error(
        `Failed to get response from AI service: ${errorMessage}`
      );
    }
  }
};

// Parse the response from the AI and return structured data
export const parseNumerizamResponse = (response: any): ParsedResponse => {
  // console.log("🔍 parseNumerizamResponse called with response:", response);

  if (!response) {
    console.error("❌ LLM response is empty.");
    return {
      displayContent: "Error: LLM response was empty.",
      jsonData: null,
    };
  }

  try {
    // Clean the response to handle potential markdown formatting
    // let cleanedResponse = response.trim();
    // console.log(
    //   "🧹 Cleaned response (before markdown removal):",
    //   cleanedResponse
    // );

    // Remove markdown code blocks if present
    // if (cleanedResponse.startsWith("```json")) {
    //   cleanedResponse = cleanedResponse
    //     .replace(/^```json\s*/, "")
    //     .replace(/\s*```$/, "");
    //   console.log("🧹 Removed ```json markdown, result:", cleanedResponse);
    // } else if (cleanedResponse.startsWith("```")) {
    //   cleanedResponse = cleanedResponse
    //     .replace(/^```\s*/, "")
    //     .replace(/\s*```$/, "");
    //   console.log("🧹 Removed ``` markdown, result:", cleanedResponse);
    // }
    //console.log("🔄 Attempting to parse JSON:", cleanedResponse);
    //const parsedData: NumerizamResponse = JSON.parse(cleanedResponse);
    const parsedData = JSON.parse(response);
    console.log(
      "✅ Shuvo Successfully parsed JSON:",
      // parsedData[0].transaction_payload
      parsedData
    );

    return {
      // jsonData: parsedData[0],
      jsonData: parsedData,
    };
  } catch (err) {
    console.error("❌ Failed to parse JSON from response:", err);
    console.error("❌ Raw response that failed to parse:", response);
    return {
      displayContent: `Failed to parse JSON. Raw data received: \n\n ${response}`,
      jsonData: null,
    };
  }
};
