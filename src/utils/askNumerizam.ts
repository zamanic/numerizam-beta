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
You MUST use the following standardized Account Keys (account_key) which is the standardized chart of account code or number. Do NOT invent new ones if you are designating each account with a standardized chart of account number. If a suitable account doesn't exist, use the closest match.

### ASSETS (1000-1999)
following is the standardized list of assets classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Cash|1000|Asset|Current Asset
Cash in Hand|1000|Asset|Current Asset
Cash at Bank - Checking|1001|Asset|Current Asset
Cash at Bank - Savings|1002|Asset|Current Asset
Petty Cash|1003|Asset|Current Asset
Cash equivalents|1004|Asset|Current Asset
Accounts Receivable|1010|Asset|Current Asset
Allowance for Doubtful Debts|1011|Asset|Current Asset
Allowance for doubtful accounts|1011|Asset|Current Asset
Legal fees receivable|1012|Asset|Current Asset
Interest receivable|1013|Asset|Current Asset
Rent receivable|1014|Asset|Current Asset
Notes receivable|1015|Asset|Current Asset
Short-term investments|1016|Asset|Current Asset
Fair value adjustment, securities (S-T)|1017|Asset|Current Asset
Merchandise inventory|1020|Asset|Current Asset
Inventory - Raw Materials|1020|Asset|Current Asset
Raw materials inventory|1020|Asset|Current Asset
Inventory - Finished Goods|1021|Asset|Current Asset
Finished goods inventory|1021|Asset|Current Asset
Goods in process inventory|1022|Asset|Current Asset
Office supplies|1030|Asset|Current Asset
Store supplies|1031|Asset|Current Asset
Prepaid Expenses|1030|Asset|Current Asset
Prepaid insurance|1032|Asset|Current Asset
Prepaid interest|1033|Asset|Current Asset
Prepaid rent|1034|Asset|Current Asset
Advance to Suppliers|1040|Asset|Current Asset
Input GST - CGST|1050|Asset|Current Asset
Input GST - SGST|1051|Asset|Current Asset
Input GST - IGST|1052|Asset|Current Asset
Long-term investments|1100|Asset|Long-term Asset
Fair value adjustment, securities (L-T)|1101|Asset|Long-term Asset
Investment in|1102|Asset|Long-term Asset
Bond sinking fund|1103|Asset|Long-term Asset
Furniture and Fixtures|1200|Asset|Fixed Asset
Furniture|1200|Asset|Fixed Asset
Office Equipment|1201|Asset|Fixed Asset
Store equipment|1202|Asset|Fixed Asset
Computers & Accessories|1202|Asset|Fixed Asset
Machinery|1203|Asset|Fixed Asset
Buildings|1203|Asset|Fixed Asset
Building|1203|Asset|Fixed Asset
Land|1204|Asset|Fixed Asset
Land improvements|1205|Asset|Fixed Asset
Vehicles|1205|Asset|Fixed Asset
Automobiles|1206|Asset|Fixed Asset
Trucks|1207|Asset|Fixed Asset
Boats|1208|Asset|Fixed Asset
Professional library|1209|Asset|Fixed Asset
Law library|1210|Asset|Fixed Asset
Accumulated Depreciation|1210|Asset|Fixed Asset
Accumulated depreciation-Automobiles|1211|Asset|Fixed Asset
Accumulated depreciation-Trucks|1212|Asset|Fixed Asset
Accumulated depreciation-Boats|1213|Asset|Fixed Asset
Accumulated depreciation-Professional library|1214|Asset|Fixed Asset
Accumulated depreciation-Law library|1215|Asset|Fixed Asset
Accumulated depreciation-Furniture|1216|Asset|Fixed Asset
Accumulated depreciation-Office equipment|1217|Asset|Fixed Asset
Accumulated depreciation-Store equipment|1218|Asset|Fixed Asset
Accumulated depreciation-Machinery|1219|Asset|Fixed Asset
Accumulated depreciation-Building|1220|Asset|Fixed Asset
Accumulated depreciation-Land improvements|1221|Asset|Fixed Asset
Mineral deposit|1300|Asset|Natural Resource
Accumulated depletion-Mineral deposit|1301|Asset|Natural Resource
Patents|1400|Asset|Intangible Asset
Leasehold|1401|Asset|Intangible Asset
Franchise|1402|Asset|Intangible Asset
Copyrights|1403|Asset|Intangible Asset
Leasehold improvements|1404|Asset|Intangible Asset
Licenses|1405|Asset|Intangible Asset
Accumulated amortization|1410|Asset|Intangible Asset

### LIABILITIES (2000-2999)
following is the standardized list of liabilities classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Accounts Payable|2000|Liability|Current Liability
Insurance payable|2001|Liability|Current Liability
Interest payable|2002|Liability|Current Liability
Legal fees payable|2003|Liability|Current Liability
Office salaries payable|2004|Liability|Current Liability
Rent payable|2005|Liability|Current Liability
Salaries Payable|2002|Liability|Current Liability
Salaries payable|2002|Liability|Current Liability
Wages payable|2006|Liability|Current Liability
Accrued payroll payable|2007|Liability|Current Liability
Accrued Expenses|2001|Liability|Current Liability
Estimated warranty liability|2008|Liability|Current Liability
Income taxes payable|2009|Liability|Current Liability
Common dividend payable|2010|Liability|Current Liability
Preferred dividend payable|2011|Liability|Current Liability
State unemployment taxes payable|2012|Liability|Current Liability
Employee federal income taxes payable|2013|Liability|Current Liability
Employee medical insurance payable|2014|Liability|Current Liability
Employee retirement program payable|2015|Liability|Current Liability
Employee union dues payable|2016|Liability|Current Liability
Federal unemployment taxes payable|2017|Liability|Current Liability
FICA taxes payable|2018|Liability|Current Liability
Estimated vacation pay liability|2019|Liability|Current Liability
GST Payable - CGST|2003|Liability|Current Liability
GST Payable - SGST|2004|Liability|Current Liability
GST Payable - IGST|2005|Liability|Current Liability
TDS Payable|2006|Liability|Current Liability
Unearned consulting fees|2020|Liability|Current Liability
Unearned legal fees|2021|Liability|Current Liability
Unearned property management fees|2022|Liability|Current Liability
Unearned fees|2023|Liability|Current Liability
Unearned janitorial revenue|2024|Liability|Current Liability
Unearned Revenue|2007|Liability|Current Liability
Unearned revenue|2007|Liability|Current Liability
Unearned rent|2025|Liability|Current Liability
Short-term notes payable|2030|Liability|Current Liability
Discount on short-term notes payable|2031|Liability|Current Liability
Notes payable|2032|Liability|Current Liability
Loan Payable - Current|2010|Liability|Current Liability
Long-term notes payable|2100|Liability|Long Term Liability
Discount on long-term notes payable|2101|Liability|Long Term Liability
Long-term lease liability|2102|Liability|Long Term Liability
Lease Liability|2101|Liability|Long Term Liability
Bonds payable|2103|Liability|Long Term Liability
Discount on bonds payable|2104|Liability|Long Term Liability
Premium on bonds payable|2105|Liability|Long Term Liability
Deferred income tax liability|2106|Liability|Long Term Liability
Loan Payable - Long-term|2100|Liability|Long Term Liability
Security Deposit Received|2102|Liability|Long Term Liability

### OWNER'S EQUITY (3000-3999)
following is the standardized list of owner's equity classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Capital|3000|Owner's Equity|Owner's Equity
Owner's Capital|3000|Owner's Equity|Owner's Equity
Withdrawals|3001|Owner's Equity|Owner's Equity
Drawings / Withdrawal|3004|Owner's Equity|Owner's Equity
Partner's Capital A/c|3001|Owner's Equity|Owner's Equity
Common stock, BDTk. par value|3010|Owner's Equity|Stockholder's Equity
Common stock, no-par value|3011|Owner's Equity|Stockholder's Equity
Common stock, BDTk. stated value|3012|Owner's Equity|Stockholder's Equity
Common stock dividend distributable|3013|Owner's Equity|Stockholder's Equity
Share Capital|3002|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of par value, Common stock|3020|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of stated value, No-par common stock|3021|Owner's Equity|Stockholder's Equity
Paid-in capital from retirement of common stock|3022|Owner's Equity|Stockholder's Equity
Paid-in capital, Treasury stock|3023|Owner's Equity|Stockholder's Equity
Preferred stock|3030|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of par value, Preferred stock|3031|Owner's Equity|Stockholder's Equity
Retained Earnings|3003|Owner's Equity|Owner's Equity
Cash dividends (or Dividends)|3040|Owner's Equity|Owner's Equity
Stock dividends|3041|Owner's Equity|Owner's Equity
Treasury stock, Common|3050|Owner's Equity|Stockholder's Equity
Current Year Profit/Loss|3005|Owner's Equity|Owner's Equity
Reserves and Surplus|3006|Owner's Equity|Owner's Equity
Unrealized gain Equity|3060|Owner's Equity|Owner's Equity
Unrealized loss-Equity|3061|Owner's Equity|Owner's Equity

### REVENUES (4000-4999)
following is the standardized list of revenues classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Fees earned|4000|Revenue|Operating Revenue
Services revenue|4001|Revenue|Operating Revenue
Sales Revenue - Services|4001|Revenue|Operating Revenue
Commissions earned|4002|Revenue|Operating Revenue
Commission Income|4005|Revenue|Operating Revenue
Rent revenue (or Rent earned)|4003|Revenue|Operating Revenue
Dividends revenue (or Dividend earned)|4004|Revenue|Non-Operating Revenue
Earnings from investment in|4005|Revenue|Non-Operating Revenue
Interest revenue (or Interest earned)|4004|Revenue|Non-Operating Revenue
Interest Income|4004|Revenue|Non-Operating Revenue
Sinking fund earnings|4006|Revenue|Non-Operating Revenue
Sales|4000|Revenue|Operating Revenue
Sales Revenue - Goods|4000|Revenue|Operating Revenue
Export Sales|4002|Revenue|Operating Revenue
Sales returns and allowances|4010|Revenue|Operating Revenue
Sales discounts|4011|Revenue|Operating Revenue
Other Operating Income|4003|Revenue|Operating Revenue
Discount Received|4006|Revenue|Non-Operating Revenue
Gain on Sale of Asset|4007|Revenue|Non-Operating Revenue

### EXPENSES (5000-5999)
following is the standardized list of expenses classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Cost of Goods Sold (COGS)|5000|Expense|Cost of Sales
Cost of goods sold|5000|Expense|Cost of Sales
Purchases|5001|Expense|Cost of Sales
Purchases - Materials|5001|Expense|Cost of Sales
Purchases returns and allowances|5002|Expense|Cost of Sales
Purchases discounts|5003|Expense|Cost of Sales
Transportation-in|5004|Expense|Cost of Sales
Freight & Shipping Inward|5002|Expense|Cost of Sales
Raw materials purchases|5005|Expense|Cost of Sales
Freight-in on raw materials|5006|Expense|Cost of Sales
Packaging Costs|5003|Expense|Cost of Sales
Factory payroll|5100|Expense|Manufacturing
Direct labor|5101|Expense|Manufacturing
Factory overhead|5102|Expense|Manufacturing
Indirect materials|5103|Expense|Manufacturing
Indirect labor|5104|Expense|Manufacturing
Factory insurance expired|5105|Expense|Manufacturing
Factory supervision|5106|Expense|Manufacturing
Factory supplies used|5107|Expense|Manufacturing
Factory utilities|5108|Expense|Manufacturing
Miscellaneous production costs|5109|Expense|Manufacturing
Property taxes on factory building|5110|Expense|Manufacturing
Property taxes on factory equipment|5111|Expense|Manufacturing
Rent on factory building|5112|Expense|Manufacturing
Repairs, factory equipment|5113|Expense|Manufacturing
Small tools written off|5114|Expense|Manufacturing
Depreciation of factory building|5115|Expense|Manufacturing
Depreciation of factory equipment|5116|Expense|Manufacturing
Direct material quantity variance|5120|Expense|Manufacturing
Direct material price variance|5121|Expense|Manufacturing
Direct labor quantity variance|5122|Expense|Manufacturing
Direct labor price variance|5123|Expense|Manufacturing
Factory overhead volume variance|5124|Expense|Manufacturing
Factory overhead controllable variance|5125|Expense|Manufacturing
Rent Expense|5100|Expense|Operating Expense
Rent expense-Office space|5101|Expense|Operating Expense
Rent expense-Selling space|5102|Expense|Operating Expense
Salaries and Wages|5101|Expense|Operating Expense
Office salaries expense|5200|Expense|Operating Expense
Sales salaries expense|5201|Expense|Operating Expense
Salaries expense|5202|Expense|Operating Expense
wages expense|5203|Expense|Operating Expense
Employee Benefits|5102|Expense|Operating Expense
Employees' benefits expense|5102|Expense|Operating Expense
Payroll taxes expense|5204|Expense|Operating Expense
Office Supplies|5103|Expense|Operating Expense
Office supplies expense|5103|Expense|Operating Expense
Store supplies expense|5104|Expense|Operating Expense
supplies expense|5105|Expense|Operating Expense
Utilities|5104|Expense|Operating Expense
Utilities expense|5104|Expense|Operating Expense
Telephone & Internet|5105|Expense|Operating Expense
Telephone expense|5105|Expense|Operating Expense
Postage & Courier|5106|Expense|Operating Expense
Postage expense|5106|Expense|Operating Expense
Repairs and Maintenance|5107|Expense|Operating Expense
Repairs expense|5107|Expense|Operating Expense
Printing & Stationery|5108|Expense|Operating Expense
Insurance Expense|5109|Expense|Operating Expense
Insurance expense|5109|Expense|Operating Expense
Insurance expense Delivery equipment|5110|Expense|Operating Expense
Insurance expense-Office equipment|5111|Expense|Operating Expense
Bank Charges|5110|Expense|Operating Expense
Professional Fees|5111|Expense|Operating Expense
Legal fees expense|5112|Expense|Operating Expense
Audit Fees|5112|Expense|Operating Expense
Depreciation Expense|5113|Expense|Operating Expense
Amortization expense|5114|Expense|Operating Expense
Depletion expense|5115|Expense|Operating Expense
Depreciation expense-Boats|5116|Expense|Operating Expense
Depreciation expense-Automobiles|5117|Expense|Operating Expense
Depreciation expense Building|5118|Expense|Operating Expense
Depreciation expense-Land improvements|5119|Expense|Operating Expense
Depreciation expense-Law library|5120|Expense|Operating Expense
Depreciation expense Trucks|5121|Expense|Operating Expense
Depreciation expense-equipment|5122|Expense|Operating Expense
Software Subscriptions|5114|Expense|Operating Expense
Miscellaneous Expenses|5115|Expense|Operating Expense
Miscellaneous expenses|5115|Expense|Operating Expense
Press rental expense|5130|Expense|Operating Expense
Truck rental expense|5131|Expense|Operating Expense
Rental expense|5132|Expense|Operating Expense
Advertising & Promotion|5200|Expense|Selling Expense
Advertising expense|5200|Expense|Selling Expense
Travel & Entertainment|5201|Expense|Selling Expense
Travel and entertainment expense|5201|Expense|Selling Expense
Commission to Agents|5202|Expense|Selling Expense
Customer Discounts Allowed|5203|Expense|Selling Expense
Bad debts expense|5210|Expense|Selling Expense
Blueprinting expense|5211|Expense|Selling Expense
Boat expense|5212|Expense|Selling Expense
Collection expense|5213|Expense|Selling Expense
Concessions expense|5214|Expense|Selling Expense
Credit card expense|5215|Expense|Selling Expense
Delivery expense|5216|Expense|Selling Expense
Dumping expense|5217|Expense|Selling Expense
Equipment expense|5218|Expense|Selling Expense
Food and drinks expense|5219|Expense|Selling Expense
Gas and oil expense|5220|Expense|Selling Expense
General and administrative expense|5221|Expense|Administrative Expense
Janitorial expense|5222|Expense|Operating Expense
Mileage expense|5223|Expense|Selling Expense
Mower and tools expense|5224|Expense|Operating Expense
Operating expense|5225|Expense|Operating Expense
Organization expense|5226|Expense|Operating Expense
Permits expense|5227|Expense|Operating Expense
Property taxes expense|5228|Expense|Operating Expense
Selling expense|5229|Expense|Selling Expense
Warranty expense|5230|Expense|Operating Expense
Interest Expense|5300|Expense|Non-Operating Expense
Interest expense|5300|Expense|Non-Operating Expense
Finance Charges|5301|Expense|Non-Operating Expense
Foreign Exchange Loss|5302|Expense|Non-Operating Expense
Cash over and short|5310|Expense|Non-Operating Expense
Discounts lost|5311|Expense|Non-Operating Expense
Factoring fee expense|5312|Expense|Non-Operating Expense
Income taxes expense|5400|Expense|Tax Expense

### OTHER INCOME / EXPENSES (6000-6999)
following is the standardized list of other income/expenses classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Gain on retirement of bonds|6000|Other Income|Extraordinary Item
Gain on sale of machinery|6001|Other Income|Extraordinary Item
Gain on sale of investments|6002|Other Income|Extraordinary Item
Gain on sale of trucks|6003|Other Income|Extraordinary Item
Gain on|6004|Other Income|Extraordinary Item
Foreign exchange gain or loss|6010|Other Income|Extraordinary Item
Loss on disposal of machinery|6100|Other Expense|Extraordinary Item
Loss on exchange of equipment|6101|Other Expense|Extraordinary Item
Loss on exchange of|6102|Other Expense|Extraordinary Item
Loss on sale of notes|6103|Other Expense|Extraordinary Item
Loss on retirement of bonds|6104|Other Expense|Extraordinary Item
Loss on sale of investments|6105|Other Expense|Extraordinary Item
Loss on sale of machinery|6106|Other Expense|Extraordinary Item
Loss on|6107|Other Expense|Extraordinary Item
Unrealized gain-Income|6200|Other Income|Extraordinary Item
Unrealized loss-Income|6201|Other Expense|Extraordinary Item
Impairment gain|6202|Other Income|Extraordinary Item
Impairment loss|6203|Other Expense|Extraordinary Item

### TEMPORARY CLOSING ACCOUNT SUMMARY (9000-9999)
following is the standardized list of temporary closing account summary classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass
Income summary | 9000 | Temporary | Closing Account
Manufacturing summary | 9001 | Temporary | Closing Account

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
