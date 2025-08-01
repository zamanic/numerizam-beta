// chartOfAccounts.ts - Complete Chart of Accounts with Search Functionality

export interface ChartOfAccountsEntry {
  account_key: number;
  account: string;
  class: string;
  subclass: string;
  report: string;
}

export const COMPLETE_CHART_OF_ACCOUNTS: ChartOfAccountsEntry[] = [
  // ===== ASSETS (1000-1999) =====
  // Current Assets
  {
    account_key: 1000,
    account: "Cash",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1001,
    account: "Cash at Bank - Checking",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1002,
    account: "Cash at Bank - Savings",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1003,
    account: "Petty Cash",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1004,
    account: "Cash equivalents",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1010,
    account: "Accounts Receivable",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1011,
    account: "Allowance for Doubtful Debts",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1012,
    account: "Legal fees receivable",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1013,
    account: "Interest receivable",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1014,
    account: "Rent receivable",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1015,
    account: "Notes receivable",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1016,
    account: "Short-term investments",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1017,
    account: "Fair value adjustment, securities (S-T)",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1020,
    account: "Merchandise inventory",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1021,
    account: "Raw materials inventory",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1022,
    account: "Finished goods inventory",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1023,
    account: "Goods in process inventory",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1030,
    account: "Office supplies",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1031,
    account: "Store supplies",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1032,
    account: "Prepaid insurance",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1033,
    account: "Prepaid interest",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1034,
    account: "Prepaid rent",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1035,
    account: "Prepaid Expenses",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1040,
    account: "Advance to Suppliers",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1050,
    account: "Input GST - CGST",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1051,
    account: "Input GST - SGST",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1052,
    account: "Input GST - IGST",
    class: "Asset",
    subclass: "Current Asset",
    report: "Balance Sheet",
  },

  // Long-term Assets
  {
    account_key: 1100,
    account: "Long-term investments",
    class: "Asset",
    subclass: "Long Term Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1101,
    account: "Fair value adjustment, securities (L-T)",
    class: "Asset",
    subclass: "Long Term Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1102,
    account: "Investment in",
    class: "Asset",
    subclass: "Long Term Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1103,
    account: "Bond sinking fund",
    class: "Asset",
    subclass: "Long Term Asset",
    report: "Balance Sheet",
  },

  // Fixed Assets
  {
    account_key: 1200,
    account: "Furniture and Fixtures",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1201,
    account: "Office Equipment",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1202,
    account: "Store equipment",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1203,
    account: "Machinery",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1204,
    account: "Buildings",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1205,
    account: "Land",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1206,
    account: "Land improvements",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1207,
    account: "Vehicles",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1208,
    account: "Automobiles",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1209,
    account: "Trucks",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1210,
    account: "Boats",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1211,
    account: "Professional library",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1212,
    account: "Law library",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1213,
    account: "Computers & Accessories",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },

  // Accumulated Depreciation
  {
    account_key: 1250,
    account: "Accumulated Depreciation - Furniture",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1251,
    account: "Accumulated Depreciation - Office Equipment",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1252,
    account: "Accumulated Depreciation - Store Equipment",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1253,
    account: "Accumulated Depreciation - Machinery",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1254,
    account: "Accumulated Depreciation - Buildings",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1255,
    account: "Accumulated Depreciation - Land Improvements",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1256,
    account: "Accumulated Depreciation - Vehicles",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1257,
    account: "Accumulated Depreciation - Automobiles",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1258,
    account: "Accumulated Depreciation - Trucks",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1259,
    account: "Accumulated Depreciation - Boats",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1260,
    account: "Accumulated Depreciation - Professional Library",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1261,
    account: "Accumulated Depreciation - Law Library",
    class: "Asset",
    subclass: "Fixed Asset",
    report: "Balance Sheet",
  },

  // Natural Resources
  {
    account_key: 1300,
    account: "Mineral deposit",
    class: "Asset",
    subclass: "Natural Resource",
    report: "Balance Sheet",
  },
  {
    account_key: 1301,
    account: "Accumulated depletion - Mineral deposit",
    class: "Asset",
    subclass: "Natural Resource",
    report: "Balance Sheet",
  },

  // Intangible Assets
  {
    account_key: 1400,
    account: "Patents",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1401,
    account: "Leasehold",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1402,
    account: "Franchise",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1403,
    account: "Copyrights",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1404,
    account: "Leasehold improvements",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1405,
    account: "Licenses",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },
  {
    account_key: 1410,
    account: "Accumulated amortization",
    class: "Asset",
    subclass: "Intangible Asset",
    report: "Balance Sheet",
  },

  // ===== LIABILITIES (2000-2999) =====
  // Current Liabilities
  {
    account_key: 2000,
    account: "Accounts Payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2001,
    account: "Accrued Expenses",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2002,
    account: "Salaries Payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2003,
    account: "Wages payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2004,
    account: "Insurance payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2005,
    account: "Interest payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2006,
    account: "Legal fees payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2007,
    account: "Office salaries payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2008,
    account: "Rent payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2009,
    account: "Accrued payroll payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2010,
    account: "Income taxes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2011,
    account: "Estimated warranty liability",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2012,
    account: "Common dividend payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2013,
    account: "Preferred dividend payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2014,
    account: "State unemployment taxes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2015,
    account: "Employee federal income taxes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2016,
    account: "Employee medical insurance payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2017,
    account: "Employee retirement program payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2018,
    account: "Employee union dues payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2019,
    account: "Federal unemployment taxes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2020,
    account: "FICA taxes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2021,
    account: "Estimated vacation pay liability",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2022,
    account: "GST Payable - CGST",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2023,
    account: "GST Payable - SGST",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2024,
    account: "GST Payable - IGST",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2025,
    account: "TDS Payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },

  // Unearned Revenue
  {
    account_key: 2030,
    account: "Unearned Revenue",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2031,
    account: "Unearned consulting fees",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2032,
    account: "Unearned legal fees",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2033,
    account: "Unearned property management fees",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2034,
    account: "Unearned fees",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2035,
    account: "Unearned janitorial revenue",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2036,
    account: "Unearned rent",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },

  // Short-term Debt
  {
    account_key: 2040,
    account: "Short-term notes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2041,
    account: "Discount on short-term notes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2042,
    account: "Notes payable",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2043,
    account: "Loan Payable - Current",
    class: "Liability",
    subclass: "Current Liability",
    report: "Balance Sheet",
  },

  // Long-term Liabilities
  {
    account_key: 2100,
    account: "Long-term notes payable",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2101,
    account: "Discount on long-term notes payable",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2102,
    account: "Long-term lease liability",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2103,
    account: "Lease Liability",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2104,
    account: "Bonds payable",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2105,
    account: "Discount on bonds payable",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2106,
    account: "Premium on bonds payable",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2107,
    account: "Deferred income tax liability",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2108,
    account: "Loan Payable - Long-term",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },
  {
    account_key: 2109,
    account: "Security Deposit Received",
    class: "Liability",
    subclass: "Long Term Liability",
    report: "Balance Sheet",
  },

  // ===== OWNER'S EQUITY (3000-3999) =====
  {
    account_key: 3000,
    account: "Owner's Capital",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3001,
    account: "Partner's Capital A/c",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3002,
    account: "Capital",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3003,
    account: "Retained Earnings",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3004,
    account: "Drawings / Withdrawal",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3007,
    account: "Owner's Draw",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3005,
    account: "Current Year Profit/Loss",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3006,
    account: "Reserves and Surplus",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },

  // Stock/Share Capital
  {
    account_key: 3010,
    account: "Share Capital",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3011,
    account: "Common stock, $ par value",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3012,
    account: "Common stock, no-par value",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3013,
    account: "Common stock, $ stated value",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3014,
    account: "Common stock dividend distributable",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3015,
    account: "Preferred stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },

  // Paid-in Capital
  {
    account_key: 3020,
    account: "Paid-in capital in excess of par value, Common stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3021,
    account: "Paid-in capital in excess of stated value, No-par common stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3022,
    account: "Paid-in capital from retirement of common stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3023,
    account: "Paid-in capital, Treasury stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3024,
    account: "Paid-in capital in excess of par value, Preferred stock",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },

  // Dividends and Treasury Stock
  {
    account_key: 3030,
    account: "Cash dividends",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3031,
    account: "Stock dividends",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3032,
    account: "Treasury stock, Common",
    class: "Owner's Equity",
    subclass: "Stockholder's Equity",
    report: "Balance Sheet",
  },

  // Other Equity
  {
    account_key: 3040,
    account: "Unrealized gain - Equity",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },
  {
    account_key: 3041,
    account: "Unrealized loss - Equity",
    class: "Owner's Equity",
    subclass: "Owner's Equity",
    report: "Balance Sheet",
  },

  // ===== REVENUE (4000-4999) =====
  // Operating Revenue
  {
    account_key: 4000,
    account: "Sales",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4001,
    account: "Sales Revenue - Goods",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4002,
    account: "Sales Revenue - Services",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4003,
    account: "Export Sales",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4004,
    account: "Services revenue",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4005,
    account: "Fees earned",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4006,
    account: "Commissions earned",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4007,
    account: "Commission Income",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4008,
    account: "Rent revenue",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4009,
    account: "Other Operating Income",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },

  // Sales Adjustments
  {
    account_key: 4010,
    account: "Sales returns and allowances",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4011,
    account: "Sales discounts",
    class: "Revenue",
    subclass: "Operating Revenue",
    report: "Profit and Loss",
  },

  // Non-Operating Revenue
  {
    account_key: 4100,
    account: "Interest Income",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4101,
    account: "Interest revenue",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4102,
    account: "Dividends revenue",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4103,
    account: "Earnings from investment",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4104,
    account: "Sinking fund earnings",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4105,
    account: "Discount Received",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },
  {
    account_key: 4106,
    account: "Gain on Sale of Asset",
    class: "Revenue",
    subclass: "Non-Operating Revenue",
    report: "Profit and Loss",
  },

  // ===== EXPENSES (5000-5999) =====
  // Cost of Sales
  {
    account_key: 5000,
    account: "Cost of Goods Sold (COGS)",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5001,
    account: "Purchases",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5002,
    account: "Purchases - Materials",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5003,
    account: "Purchases returns and allowances",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5004,
    account: "Purchases discounts",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5005,
    account: "Transportation-in",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5006,
    account: "Freight & Shipping Inward",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5007,
    account: "Raw materials purchases",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5008,
    account: "Freight-in on raw materials",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },
  {
    account_key: 5009,
    account: "Packaging Costs",
    class: "Expense",
    subclass: "Cost of Sales",
    report: "Profit and Loss",
  },

  // Manufacturing Expenses
  {
    account_key: 5050,
    account: "Factory payroll",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5051,
    account: "Direct labor",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5052,
    account: "Factory overhead",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5053,
    account: "Indirect materials",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5054,
    account: "Indirect labor",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5055,
    account: "Factory insurance expired",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5056,
    account: "Factory supervision",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5057,
    account: "Factory supplies used",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5058,
    account: "Factory utilities",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },
  {
    account_key: 5059,
    account: "Miscellaneous production costs",
    class: "Expense",
    subclass: "Manufacturing",
    report: "Profit and Loss",
  },

  // Operating Expenses
  {
    account_key: 5100,
    account: "Rent Expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5101,
    account: "Rent expense-Office space",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5102,
    account: "Rent expense-Selling space",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5110,
    account: "Salaries and Wages",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5111,
    account: "Office salaries expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5112,
    account: "Sales salaries expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5113,
    account: "Salaries expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5114,
    account: "Wages expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5115,
    account: "Employee Benefits",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5116,
    account: "Employees' benefits expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5117,
    account: "Payroll taxes expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5120,
    account: "Office Supplies",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5121,
    account: "Office supplies expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5122,
    account: "Store supplies expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5123,
    account: "Supplies expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5130,
    account: "Utilities",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5131,
    account: "Utilities expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5132,
    account: "Telephone & Internet",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5133,
    account: "Telephone expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5134,
    account: "Postage & Courier",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5135,
    account: "Postage expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5140,
    account: "Repairs and Maintenance",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5141,
    account: "Repairs expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5142,
    account: "Printing & Stationery",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5150,
    account: "Insurance Expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5151,
    account: "Insurance expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5152,
    account: "Insurance expense Delivery equipment",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5153,
    account: "Insurance expense-Office equipment",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5160,
    account: "Bank Charges",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5161,
    account: "Professional Fees",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5162,
    account: "Legal fees expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5163,
    account: "Audit Fees",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5170,
    account: "Depreciation Expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5171,
    account: "Depreciation expense-Boats",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5172,
    account: "Depreciation expense-Automobiles",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5173,
    account: "Depreciation expense Building",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5174,
    account: "Depreciation expense-Land improvements",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5175,
    account: "Depreciation expense-Law library",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5176,
    account: "Depreciation expense Trucks",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5177,
    account: "Depreciation expense-equipment",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5180,
    account: "Amortization expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5181,
    account: "Depletion expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5190,
    account: "Software Subscriptions",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5191,
    account: "Miscellaneous Expenses",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5192,
    account: "Miscellaneous expenses",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },

  // Selling Expenses
  {
    account_key: 5200,
    account: "Advertising & Promotion",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5201,
    account: "Advertising expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5202,
    account: "Travel & Entertainment",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5203,
    account: "Travel and entertainment expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5204,
    account: "Commission to Agents",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5205,
    account: "Customer Discounts Allowed",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5210,
    account: "Bad debts expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5211,
    account: "Collection expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5212,
    account: "Credit card expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5213,
    account: "Delivery expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5214,
    account: "Selling expense",
    class: "Expense",
    subclass: "Selling Expense",
    report: "Profit and Loss",
  },

  // Administrative Expenses
  {
    account_key: 5250,
    account: "General and administrative expense",
    class: "Expense",
    subclass: "Administrative Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5251,
    account: "Organization expense",
    class: "Expense",
    subclass: "Administrative Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5252,
    account: "Permits expense",
    class: "Expense",
    subclass: "Administrative Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5253,
    account: "Property taxes expense",
    class: "Expense",
    subclass: "Administrative Expense",
    report: "Profit and Loss",
  },

  // Non-Operating Expenses
  {
    account_key: 5300,
    account: "Interest Expense",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5301,
    account: "Interest expense",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5302,
    account: "Finance Charges",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5303,
    account: "Foreign Exchange Loss",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5304,
    account: "Cash over and short",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5305,
    account: "Discounts lost",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5306,
    account: "Factoring fee expense",
    class: "Expense",
    subclass: "Non-Operating Expense",
    report: "Profit and Loss",
  },

  // Other Operating Expenses
  {
    account_key: 5350,
    account: "Equipment expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5351,
    account: "Gas and oil expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5352,
    account: "Janitorial expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5353,
    account: "Mileage expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5354,
    account: "Operating expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },
  {
    account_key: 5355,
    account: "Warranty expense",
    class: "Expense",
    subclass: "Operating Expense",
    report: "Profit and Loss",
  },

  // Tax Expenses
  {
    account_key: 5400,
    account: "Income taxes expense",
    class: "Expense",
    subclass: "Tax Expense",
    report: "Profit and Loss",
  },

  // ===== OTHER INCOME/EXPENSE (6000-6999) =====
  // Extraordinary Items - Gains
  {
    account_key: 6000,
    account: "Gain on retirement of bonds",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6001,
    account: "Gain on sale of machinery",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6002,
    account: "Gain on sale of investments",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6003,
    account: "Gain on sale of trucks",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6004,
    account: "Foreign exchange gain or loss",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6005,
    account: "Unrealized gain-Income",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6006,
    account: "Impairment gain",
    class: "Other Income",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },

  // Extraordinary Items - Losses
  {
    account_key: 6100,
    account: "Loss on disposal of machinery",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6101,
    account: "Loss on exchange of equipment",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6102,
    account: "Loss on sale of notes",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6103,
    account: "Loss on retirement of bonds",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6104,
    account: "Loss on sale of investments",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6105,
    account: "Loss on sale of machinery",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6106,
    account: "Unrealized loss-Income",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },
  {
    account_key: 6107,
    account: "Impairment loss",
    class: "Other Expense",
    subclass: "Extraordinary Item",
    report: "Profit and Loss",
  },

  // ===== TEMPORARY ACCOUNTS (9000-9999) =====
  {
    account_key: 9000,
    account: "Income summary",
    class: "Temporary",
    subclass: "Closing Account",
    report: "Profit and Loss",
  },
  {
    account_key: 9001,
    account: "Manufacturing summary",
    class: "Temporary",
    subclass: "Closing Account",
    report: "Profit and Loss",
  },
];

// ===== SEARCH AND UTILITY FUNCTIONS =====

export class ChartOfAccountsManager {
  private chartData: ChartOfAccountsEntry[];

  constructor(chartData: ChartOfAccountsEntry[] = COMPLETE_CHART_OF_ACCOUNTS) {
    this.chartData = chartData;
  }

  // Find account by exact name match
  findAccountByName(accountName: string): ChartOfAccountsEntry | null {
    const normalizedName = accountName.toLowerCase().trim();

    // Exact match first
    const exactMatch = this.chartData.find(
      (account) => account.account.toLowerCase() === normalizedName
    );
    if (exactMatch) return exactMatch;

    return null;
  }

  // Find account by partial name match
  findAccountByPartialName(accountName: string): ChartOfAccountsEntry[] {
    const normalizedName = accountName.toLowerCase().trim();

    return this.chartData.filter(
      (account) =>
        account.account.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(account.account.toLowerCase())
    );
  }

  // Find account by account key
  findAccountByKey(accountKey: number): ChartOfAccountsEntry | null {
    return (
      this.chartData.find((account) => account.account_key === accountKey) ||
      null
    );
  }

  // Find accounts by class
  findAccountsByClass(className: string): ChartOfAccountsEntry[] {
    return this.chartData.filter(
      (account) => account.class.toLowerCase() === className.toLowerCase()
    );
  }

  // Find accounts by subclass
  findAccountsBySubclass(subclassName: string): ChartOfAccountsEntry[] {
    return this.chartData.filter(
      (account) => account.subclass.toLowerCase() === subclassName.toLowerCase()
    );
  }

  // Smart account suggestion based on transaction context
  suggestAccount(
    description: string,
    transactionType?: "income" | "expense" | "asset" | "liability"
  ): ChartOfAccountsEntry | null {
    const desc = description.toLowerCase();

    // Cash-related patterns
    if (
      desc.includes("cash payment") ||
      desc.includes("cash received") ||
      desc.includes("cash")
    ) {
      return this.findAccountByKey(1000); // Cash
    }
    if (
      desc.includes("bank") ||
      desc.includes("checking") ||
      desc.includes("deposit")
    ) {
      return this.findAccountByKey(1001); // Cash at Bank - Checking
    }
    if (desc.includes("petty cash")) {
      return this.findAccountByKey(1003); // Petty Cash
    }

    // Revenue patterns
    if (
      (desc.includes("sale") || desc.includes("sold")) &&
      transactionType === "income"
    ) {
      if (desc.includes("service")) return this.findAccountByKey(4002); // Sales Revenue - Services
      return this.findAccountByKey(4001); // Sales Revenue - Goods
    }
    if (desc.includes("commission") && transactionType === "income") {
      return this.findAccountByKey(4007); // Commission Income
    }
    if (desc.includes("rent") && transactionType === "income") {
      return this.findAccountByKey(4008); // Rent revenue
    }
    if (desc.includes("interest") && transactionType === "income") {
      return this.findAccountByKey(4100); // Interest Income
    }

    // Expense patterns
    if (desc.includes("rent") && transactionType === "expense") {
      if (desc.includes("office")) return this.findAccountByKey(5101); // Rent expense-Office space
      return this.findAccountByKey(5100); // Rent Expense
    }
    if (
      (desc.includes("salary") || desc.includes("wage")) &&
      transactionType === "expense"
    ) {
      return this.findAccountByKey(5110); // Salaries and Wages
    }
    if (desc.includes("office supplies") && transactionType === "expense") {
      return this.findAccountByKey(5120); // Office Supplies
    }
    if (desc.includes("utility") && transactionType === "expense") {
      return this.findAccountByKey(5130); // Utilities
    }
    if (desc.includes("insurance") && transactionType === "expense") {
      return this.findAccountByKey(5150); // Insurance Expense
    }
    if (desc.includes("advertising") && transactionType === "expense") {
      return this.findAccountByKey(5200); // Advertising & Promotion
    }
    if (desc.includes("interest") && transactionType === "expense") {
      return this.findAccountByKey(5300); // Interest Expense
    }
    if (desc.includes("depreciation") && transactionType === "expense") {
      return this.findAccountByKey(5170); // Depreciation Expense
    }

    // Asset patterns
    if (
      desc.includes("accounts receivable") ||
      (desc.includes("receivable") && transactionType === "asset")
    ) {
      return this.findAccountByKey(1010); // Accounts Receivable
    }
    if (desc.includes("inventory")) {
      if (desc.includes("raw material")) return this.findAccountByKey(1021); // Raw materials inventory
      if (desc.includes("finished")) return this.findAccountByKey(1022); // Finished goods inventory
      return this.findAccountByKey(1020); // Merchandise inventory
    }
    if (desc.includes("equipment")) {
      return this.findAccountByKey(1201); // Office Equipment
    }
    if (
      desc.includes("vehicle") ||
      desc.includes("car") ||
      desc.includes("truck")
    ) {
      return this.findAccountByKey(1207); // Vehicles
    }
    if (desc.includes("building")) {
      return this.findAccountByKey(1204); // Buildings
    }

    // Liability patterns
    if (
      desc.includes("accounts payable") ||
      (desc.includes("payable") && transactionType === "liability")
    ) {
      return this.findAccountByKey(2000); // Accounts Payable
    }
    if (desc.includes("loan") && transactionType === "liability") {
      return this.findAccountByKey(2108); // Loan Payable - Long-term
    }
    if (desc.includes("salary payable") || desc.includes("wages payable")) {
      return this.findAccountByKey(2002); // Salaries Payable
    }

    return null;
  }

  // Generate comprehensive chart prompt for AI
  generateChartPrompt(): string {
    let prompt = "## Complete Standardized Chart of Accounts (COA)\n";
    prompt +=
      "You MUST use the following standardized Account Keys. Find the most appropriate account from this comprehensive list:\n\n";

    const groupedAccounts = this.chartData.reduce((groups, account) => {
      const key = account.class;
      if (!groups[key]) groups[key] = [];
      groups[key].push(account);
      return groups;
    }, {} as Record<string, ChartOfAccountsEntry[]>);

    // Sort by account key within each group
    Object.keys(groupedAccounts).forEach((key) => {
      groupedAccounts[key].sort((a, b) => a.account_key - b.account_key);
    });

    const classOrder = [
      "Asset",
      "Liability",
      "Owner's Equity",
      "Revenue",
      "Expense",
      "Other Income",
      "Other Expense",
      "Temporary",
    ];

    classOrder.forEach((className) => {
      if (groupedAccounts[className]) {
        prompt += `### ${className.toUpperCase()}\n`;
        groupedAccounts[className].forEach((account) => {
          prompt += `- ${account.account_key}: ${account.account}\n`;
        });
        prompt += "\n";
      }
    });

    return prompt;
  }

  // Get account statistics
  getAccountStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.chartData.forEach((account) => {
      stats[account.class] = (stats[account.class] || 0) + 1;
    });

    return stats;
  }

  // Validate account key ranges
  validateAccountKey(accountKey: number, expectedClass: string): boolean {
    const account = this.findAccountByKey(accountKey);
    return account ? account.class === expectedClass : false;
  }
}

// Create a singleton instance
export const chartManager = new ChartOfAccountsManager();

// Export utility functions for backward compatibility
export const findAccountByName = (accountName: string) =>
  chartManager.findAccountByName(accountName);
export const findAccountByKey = (accountKey: number) =>
  chartManager.findAccountByKey(accountKey);
export const findAccountsByClass = (className: string) =>
  chartManager.findAccountsByClass(className);
export const suggestAccount = (
  description: string,
  transactionType?: "income" | "expense" | "asset" | "liability"
) => chartManager.suggestAccount(description, transactionType);
