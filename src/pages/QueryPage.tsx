import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  Send,
  Close,
  Check,
  CalendarToday,
  Search,
  ArrowForward,
  Save,
  Info,
  ExpandMore,
  Edit,
  Add,
  Delete,
  Warning,
  ExpandLess,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import ConfirmTransactionDialog from "../components/ConfirmTransactionDialog";

// Import AI utilities and new services
import AccountingTable from "../components/AccountingTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { askNumerizam, parseNumerizamResponse } from "../utils/askNumerizam";
import { saveReportResults } from "../services/langGraphSaveAPI";
import { transactionProcessingService } from "../services/transactionProcessingService";
import { supabaseAccountingService } from "../services/supabaseAccountingService";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

// Types
type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  account: string;
  category: string;
};

type JournalEntry = {
  id: string;
  date: Date;
  description: string;
  entries: {
    account: string;
    debit?: number;
    credit?: number;
  }[];
};

// Initial mock data (will be replaced by AI-generated transactions)
const initialTransactions: Transaction[] = [
  {
    id: "t1",
    date: new Date(2023, 5, 15),
    description: "Client payment - ABC Corp",
    amount: 5000,
    type: "credit",
    account: "Accounts Receivable",
    category: "Revenue",
  },
  {
    id: "t2",
    date: new Date(2023, 5, 16),
    description: "Office supplies",
    amount: 250.75,
    type: "debit",
    account: "Office Expenses",
    category: "Expense",
  },
];

const QueryPage = () => {
  const { user, session } = useAuth();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentJournalEntry, setCurrentJournalEntry] =
    useState<JournalEntry | null>(null);
  const [queryType, setQueryType] = useState<"reporting" | "transactional">(
    "transactional"
  );
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [pendingTransactionData, setPendingTransactionData] =
    useState<any>(null);
  const [showPendingBox, setShowPendingBox] = useState(false);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  // Enhanced state variables for new UI
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedRegion, setSelectedRegion] = useState("North America");
  const [transactionDate, setTransactionDate] = useState<Date | null>(
    new Date()
  );

  // Enhanced data structures for the new confirmation dialog
  const [enhancedTransactions, setEnhancedTransactions] = useState([
    {
      id: "txn-1",
      date: new Date().toISOString().split("T")[0],
      description: "Sample transaction",
      debit: 999,
      credit: 0,
      account: "1000 - Cash",
      reference: "REF-001",
      isModified: false,
      isValidated: false,
      errors: [],
    },
    {
      id: "txn-2",
      date: new Date().toISOString().split("T")[0],
      description: "Sample transaction",
      debit: 0,
      credit: 999,
      account: "4000 - Sales Revenue",
      reference: "REF-001",
      isModified: false,
      isValidated: false,
      errors: [],
    },
  ]);

  const [companyInfo, setCompanyInfo] = useState({
    name: user?.company_name || "Demo Company",
    address: "123 Business St, City, State 12345",
    taxId: "TAX-123456789",
    fiscalYear: "2024",
  });

  const [territoryDetails, setTerritoryDetails] = useState({
    region: selectedRegion,
    currency: "USD",
    taxRate: 8.5,
    regulations: ["SOX", "GAAP"],
  });

  const [calendarInfo, setCalendarInfo] = useState({
    period: "Q1 2024",
    quarter: "Q1",
    fiscalYear: "2024",
    daysRemaining: 45,
  });

  const [chartOfAccounts, setChartOfAccounts] = useState({
    accounts: [
      {
        code: "1000",
        name: "Cash",
        type: "Asset",
        balance: 50000,
        isActive: true,
      },
      {
        code: "1100",
        name: "Accounts Receivable",
        type: "Asset",
        balance: 25000,
        isActive: true,
      },
      {
        code: "2000",
        name: "Accounts Payable",
        type: "Liability",
        balance: 15000,
        isActive: true,
      },
      {
        code: "3000",
        name: "Owner Capital",
        type: "Equity",
        balance: 40000,
        isActive: true,
      },
      {
        code: "4000",
        name: "Sales Revenue",
        type: "Revenue",
        balance: 75000,
        isActive: true,
      },
      {
        code: "5000",
        name: "Cost of Goods Sold",
        type: "Expense",
        balance: 30000,
        isActive: true,
      },
    ],
  });

  const [generalLedgerEntries, setGeneralLedgerEntries] = useState([
    { accountKey: "1000", details: "Cash receipt", amount: 999, type: "Debit" },
    {
      accountKey: "4000",
      details: "Sales revenue",
      amount: 999,
      type: "Credit",
    },
  ]);

  // New structured data states for the enhanced dialog
  const [companyData, setCompanyData] = useState({
    company_name: user?.company_name || "Patrick Incitti",
  });

  const [territoryData, setTerritoryData] = useState({
    country: "Bangladesh",
    region: "Asia",
  });

  const [calendarData, setCalendarData] = useState({
    date: new Date().toISOString().split("T")[0],
    quarter: "Q1",
    day: "Monday",
  });

  const [chartOfAccountsData, setChartOfAccountsData] = useState([
    {
      account_key: "1000",
      report: "Balance Sheet",
      class: "Assets",
      subclass: "Current Assets",
      account: "Cash",
    },
    {
      account_key: "4000",
      report: "Income Statement",
      class: "Revenue",
      subclass: "Operating Revenue",
      account: "Sales Revenue",
    },
  ]);

  const [generalLedgerData, setGeneralLedgerData] = useState([
    {
      date: new Date().toISOString().split("T")[0],
      account_key: "1000",
      details: "Cash receipt from customer",
      amount: 999,
      type: "Debit",
    },
    {
      date: new Date().toISOString().split("T")[0],
      account_key: "4000",
      details: "Sales revenue recognition",
      amount: 999,
      type: "Credit",
    },
  ]);

  // State to hold all dialog data together
  const [dialogData, setDialogData] = useState({
    transactions: enhancedTransactions,
    companyInfo,
    territoryDetails,
    calendarInfo,
    chartOfAccounts,
  });

  const [aiJsonOutput, setAiJsonOutput] = useState<any>(null);
  const [transactionPayload, setTransactionPayload] = useState<any>(null);

  // Update chart of accounts and general ledger when enhanced transactions change
  useEffect(() => {
    if (dialogData.transactions.length > 0 && !isProcessing) {
      // Extract unique accounts from enhanced transactions
      const accountsMap = new Map();
      const ledgerEntries: any[] = [];

      dialogData.transactions.forEach((transaction, index) => {
        // Extract account code from account string (e.g., "1000 - Cash" -> "1000")
        const accountMatch = transaction.account.match(/^(\d+)/);
        const accountCode = accountMatch ? accountMatch[1] : "1000";
        const accountName =
          transaction.account.replace(/^\d+\s*-\s*/, "") ||
          getAccountName(parseInt(accountCode));

        // Determine account type based on account code
        let accountType = "Asset";
        const code = parseInt(accountCode);
        if (code >= 2000 && code < 3000) accountType = "Liability";
        else if (code >= 3000 && code < 4000) accountType = "Equity";
        else if (code >= 4000 && code < 5000) accountType = "Revenue";
        else if (code >= 5000) accountType = "Expense";

        // Add to accounts map if not already present
        if (!accountsMap.has(accountCode)) {
          accountsMap.set(accountCode, {
            code: accountCode,
            name: accountName,
            type: accountType,
            balance: 0,
            isActive: true,
          });
        }

        // Update balance based on normal balance rules
        const account = accountsMap.get(accountCode);
        const code_num = parseInt(accountCode);

        // Assets and Expenses increase with debits, decrease with credits
        if (code_num < 2000 || code_num >= 5000) {
          if (transaction.debit > 0) {
            account.balance += transaction.debit;
          } else if (transaction.credit > 0) {
            account.balance -= transaction.credit;
          }
        }
        // Liabilities, Equity, and Revenue increase with credits, decrease with debits
        else {
          if (transaction.credit > 0) {
            account.balance += transaction.credit;
          } else if (transaction.debit > 0) {
            account.balance -= transaction.debit;
          }
        }

        // Add to general ledger entries with proper formatting
        ledgerEntries.push({
          id: `ledger-${index}`,
          date: transaction.date,
          description: transaction.description,
          account: transaction.account,
          debit: transaction.debit > 0 ? transaction.debit : 0,
          credit: transaction.credit > 0 ? transaction.credit : 0,
          reference:
            transaction.reference ||
            `REF-${String(index + 1).padStart(3, "0")}`,
          status: "Active",
        });
      });

      // Update chart of accounts
      setChartOfAccounts({
        accounts: Array.from(accountsMap.values()),
      });

      // Update general ledger entries
      setGeneralLedgerEntries(ledgerEntries);
    }
  }, [dialogData.transactions, isProcessing]);

  // Check if this is demo mode
  const isDemoMode = window.location.pathname === "/demo";

  // Simple authentication check - if we have a session or user, allow access
  const isAuthenticated = user || session;

  // Check if user is approved (only if we have user data)
  if (!isDemoMode && user && !user.is_approved) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your account is pending admin approval. Please wait for approval to
          access the query page.
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Contact your administrator if you have been waiting for an extended
          period.
        </Typography>
      </Box>
    );
  }

  // Filter transactions based on search term and selected date
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate
      ? transaction.date.toDateString() === selectedDate.toDateString()
      : true;

    return matchesSearch && matchesDate;
  });

  // Focus on query input when component mounts
  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, []);

  // Handle query submission
  const handleSubmitQuery = useCallback(async () => {
    if (!query.trim()) return;

    if (!isDemoMode && !user) {
      setError("User not authenticated");
      return;
    }

    setIsProcessing(true);
    setError("");
    setReportData(null);
    setTransactionPayload(null);
    setAiJsonOutput(null);

    try {
      const userId = isDemoMode ? "demo-user" : user?.id || session?.user?.id;
      const company = user?.company_name || "Demo Company";

      // call the new AI service
      const llmResponse = await askNumerizam(query, queryType);
      const { jsonData } = parseNumerizamResponse(llmResponse);
      //console.log(jsonData?.transaction_payload);
      //console.log(jsonData);
      //if (!jsonData?.transaction_payload) {
      if (!jsonData) {
        throw new Error(
          "Could not parse a valid transaction payload from the AI."
        );
      }
      //const p = jsonData.transaction_payload;
      const p = jsonData?.transaction_payload;

      /* ---------- populate the dialog displays ---------- */
      // 1. Calendar
      const cal = p.calendar;
      const updatedCalendarInfo = {
        period: `${cal.quarter} ${cal.year}`,
        quarter: cal.quarter,
        fiscalYear: String(cal.year),
        daysRemaining: 30,
      };
      console.log("QueryPage: Setting calendarInfo:", updatedCalendarInfo);
      setCalendarInfo(updatedCalendarInfo);

      // 2. Territory
      const updatedTerritoryDetails = {
        region: p.territory?.region || "Asia",
        currency: p.territory?.country || "Bangladesh",
        taxRate: 8.5,
        regulations: ["SOX", "GAAP"],
      };
      console.log(
        "QueryPage: Setting territoryDetails:",
        updatedTerritoryDetails
      );
      setTerritoryDetails(updatedTerritoryDetails);

      // 3. Company
      const updatedCompanyInfo = {
        name: p.companies?.company_name || company,
        address: "123 Business St, City, State 12345",
        taxId: "TAX-123456789",
        fiscalYear: String(cal.year),
      };
      console.log("QueryPage: Setting companyInfo:", updatedCompanyInfo);
      setCompanyInfo(updatedCompanyInfo);

      // 4. Chart of Accounts (array -> dialog state)
      const updatedChartOfAccounts = {
        accounts: p.chartofaccounts.map((c: any, idx: number) => ({
          code: `${c.account_key}-${idx}`, // Create unique key using account_key and index
          name: c.account,
          type: c.class,
          balance: 0, // will be calculated by existing useEffect
          report: c.report,
          subclass: c.subclass,
          isActive: true,
          originalAccountKey: c.account_key, // Keep original account key for reference
        })),
      };
      console.log(
        "QueryPage: Setting chartOfAccounts:",
        updatedChartOfAccounts
      );
      setChartOfAccounts(updatedChartOfAccounts);

      // 5. General Ledger (array -> dialog state)
      const ledgerRows = p.generalledger.map((gl: any, idx: number) => ({
        id: `gl-${Date.now()}-${idx}`,
        date: gl.date,
        description: gl.details,
        account: `${gl.account_key} - ${getAccountName(gl.account_key)}`,
        debit: gl.type === "Debit" ? gl.amount : 0,
        credit: gl.type === "Credit" ? gl.amount : 0,
        reference: `REF-${String(idx + 1).padStart(3, "0")}`,
        status: "Active",
      }));
      console.log("QueryPage: Setting generalLedgerEntries:", ledgerRows);
      setGeneralLedgerEntries(ledgerRows);

      // 6. Enhanced transactions (for the dialog table)
      const enhanced = p.generalledger.map((gl: any, idx: number) => ({
        id: `${isDemoMode ? "demo-" : ""}txn-${Date.now()}-${idx}`,
        date: gl.date,
        description: gl.details,
        debit: gl.type === "Debit" ? gl.amount : 0,
        credit: gl.type === "Credit" ? gl.amount : 0,
        account: `${gl.account_key} - ${getAccountName(gl.account_key)}`,
        reference: `REF-${String(idx + 1).padStart(3, "0")}`,
        isModified: false,
        isValidated: false,
        errors: [],
      }));
      console.log("QueryPage: Setting enhancedTransactions:", enhanced);
      setEnhancedTransactions(enhanced);

      // 7. Legacy journal entry (backward compatibility)
      const journalEntry: JournalEntry = {
        id: `${isDemoMode ? "demo-" : ""}je${Date.now()}`,
        date: new Date(cal.date),
        description: p.generalledger[0]?.details || "AI Generated Transaction",
        entries: p.generalledger.map((gl: any) => ({
          account: `${gl.account_key} - ${getAccountName(gl.account_key)}`,
          debit: gl.type === "Debit" ? gl.amount : undefined,
          credit: gl.type === "Credit" ? gl.amount : undefined,
        })),
      };
      console.log("QueryPage: Setting currentJournalEntry:", journalEntry);
      setCurrentJournalEntry(journalEntry);

      /* ---------- populate the new structured data ---------- */
      // Company Data
      const newCompanyData = {
        company_name: p.companies?.company_name || company,
      };
      console.log("QueryPage: Setting companyData:", newCompanyData);
      setCompanyData(newCompanyData);

      // Territory Data
      const newTerritoryData = {
        country: p.territory?.country || "Bangladesh",
        region: p.territory?.region || "Asia",
      };
      console.log("QueryPage: Setting territoryData:", newTerritoryData);
      setTerritoryData(newTerritoryData);

      // Calendar Data
      const newCalendarData = {
        date: cal.date,
        quarter: cal.quarter,
        day: new Date(cal.date).toLocaleDateString("en-US", {
          weekday: "long",
        }),
      };
      console.log("QueryPage: Setting calendarData:", newCalendarData);
      setCalendarData(newCalendarData);

      // Chart of Accounts Data
      const newChartOfAccountsData = p.chartofaccounts.map((c: any) => ({
        account_key: c.account_key,
        report: c.report,
        class: c.class,
        subclass: c.subclass,
        account: c.account,
      }));
      console.log(
        "QueryPage: Setting chartOfAccountsData:",
        newChartOfAccountsData
      );
      setChartOfAccountsData(newChartOfAccountsData);

      // General Ledger Data
      const newGeneralLedgerData = p.generalledger.map((gl: any) => ({
        date: gl.date,
        account_key: gl.account_key,
        details: gl.details,
        amount: gl.amount,
        type: gl.type,
      }));
      console.log(
        "QueryPage: Setting generalLedgerData:",
        newGeneralLedgerData
      );
      setGeneralLedgerData(newGeneralLedgerData);

      setTransactionPayload(p); // keep raw payload for confirm step
      setAiJsonOutput(jsonData);

      // Update enhanced transactions state first
      setEnhancedTransactions(enhanced);

      // Update dialog data atomically with all the new values
      const newDialogData = {
        transactions: enhanced,
        companyInfo: updatedCompanyInfo,
        territoryDetails: updatedTerritoryDetails,
        calendarInfo: updatedCalendarInfo,
        chartOfAccounts: updatedChartOfAccounts,
      };

      console.log("QueryPage: Setting dialog data:", newDialogData);
      setDialogData(newDialogData);

      // Clear any pending data since we have new data
      setPendingTransactionData(null);
      setShowPendingBox(false);

      // Use setTimeout to ensure state updates are applied before showing dialog
      setTimeout(() => {
        console.log("QueryPage: Opening dialog with updated values:", {
          enhanced,
          updatedCompanyInfo,
          updatedTerritoryDetails,
          updatedCalendarInfo,
          updatedChartOfAccounts,
        });
        setShowConfirmDialog(true);
      }, 200);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [query, queryType, isDemoMode, user, session]);

  // Helper function to get account name from account key
  const getAccountName = (accountKey: number): string => {
    const accountMap: { [key: number]: string } = {
      1000: "Cash",
      1100: "Accounts Receivable",
      1200: "Inventory",
      1500: "Office Equipment",
      2000: "Accounts Payable",
      3000: "Owner Capital",
      4000: "Sales Revenue",
      5000: "Cost of Goods Sold",
      6000: "Rent Expense",
    };
    return accountMap[accountKey] || "Unknown Account";
  };

  // Handle confirmation of journal entry
  const handleConfirmEntry = async () => {
    setIsProcessing(true);
    setError("");

    try {
      if (isDemoMode) {
        // demo: just push to local list
        const newTx: Transaction[] = dialogData.transactions.map((t, idx) => ({
          id: `demo-t${transactions.length + idx + 1}`,
          date: new Date(t.date),
          description: t.description,
          amount: t.debit || t.credit || 0,
          type: t.debit > 0 ? "debit" : "credit",
          account: t.account,
          category: t.debit > 0 ? "Expense" : "Revenue",
        }));
        setTransactions((prev) => [...newTx, ...prev]);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        // real backend
        // Transform the payload to match backend expectations
        console.log(
          "DEBUG: transactionPayload structure:",
          JSON.stringify(transactionPayload, null, 2)
        );

        const backendPayload = {
          company_data: {
            company_name: String(
              transactionPayload.companies?.company_name ||
                transactionPayload.company?.company_name ||
                "Default Company"
            ).trim(),
          },
          territory_data: transactionPayload.territory
            ? {
                Country: String(
                  transactionPayload.territory.country || "Bangladesh"
                ).trim(),
                Region: String(
                  transactionPayload.territory.region || "Asia"
                ).trim(),
              }
            : {
                Country: "Bangladesh",
                Region: "Asia",
              },
          calendar_data: {
            Date: String(transactionPayload.calendar.date).trim(),
            Year: Number(transactionPayload.calendar.year),
            Quarter: String(transactionPayload.calendar.quarter).trim(),
            Month: String(transactionPayload.calendar.month).trim(),
            Day: String(transactionPayload.calendar.day).trim(),
          },
          chart_of_accounts_data: transactionPayload.chartofaccounts.map(
            (account: any, index: number) => {
              // Generate account key based on account class if missing
              let accountKey = account.account_key;
              if (!accountKey) {
                const accountClass = account.class || "Asset";
                switch (accountClass.toLowerCase()) {
                  case "asset":
                    accountKey = 1000 + index * 10; // Assets: 1000-1999
                    break;
                  case "liability":
                    accountKey = 2000 + index * 10; // Liabilities: 2000-2999
                    break;
                  case "equity":
                  case "owner's equity":
                    accountKey = 3000 + index * 10; // Equity: 3000-3999
                    break;
                  case "revenue":
                  case "income":
                    accountKey = 4000 + index * 10; // Revenue: 4000-4999
                    break;
                  case "expense":
                    accountKey = 5000 + index * 10; // Expenses: 5000+
                    break;
                  default:
                    accountKey = 1000 + index * 10; // Default to Asset
                }
              }

              // Ensure proper data types and clean field names
              return {
                Account_key: Number(accountKey), // Ensure it's a number
                Report: String(account.report || "Balance Sheet").trim(),
                Class: String(account.class || "Asset").trim(),
                SubClass: String(account.subclass || "Current Asset").trim(),
                SubClass2: String(
                  account.subclass2 || account.subclass || "Current Asset"
                ).trim(),
                Account: String(account.account || "Unknown Account").trim(),
                SubAccount: String(account.subaccount || "").trim(),
              };
            }
          ),
          general_ledger_entries: transactionPayload.generalledger.map(
            (entry: any, index: number) => {
              // Find corresponding chart of accounts entry to get the correct account key
              let accountKey = entry.account_key;
              if (!accountKey) {
                // Try to match with chart of accounts by account name or use fallback
                const matchingAccount = transactionPayload.chartofaccounts.find(
                  (acc: any) =>
                    acc.account === entry.account ||
                    acc.account_key === entry.account_key
                );

                if (matchingAccount) {
                  // Use the same logic as chart of accounts
                  const accountClass = matchingAccount.class || "Asset";
                  const chartIndex =
                    transactionPayload.chartofaccounts.indexOf(matchingAccount);
                  switch (accountClass.toLowerCase()) {
                    case "asset":
                      accountKey = 1000 + chartIndex * 10;
                      break;
                    case "liability":
                      accountKey = 2000 + chartIndex * 10;
                      break;
                    case "equity":
                    case "owner's equity":
                      accountKey = 3000 + chartIndex * 10;
                      break;
                    case "revenue":
                    case "income":
                      accountKey = 4000 + chartIndex * 10;
                      break;
                    case "expense":
                      accountKey = 5000 + chartIndex * 10;
                      break;
                    default:
                      accountKey = 1000 + chartIndex * 10;
                  }
                } else {
                  // Fallback to Asset range
                  accountKey = 1000 + index * 10;
                }
              }

              // Ensure proper data types and field names
              return {
                Account_key: Number(accountKey), // Ensure it's a number
                Amount: Number(entry.amount || 0), // Ensure it's a number
                Type: String(entry.type || "Debit").trim(), // Ensure it's a clean string
                Details: String(entry.details || "").trim(), // Ensure it's a clean string
              };
            }
          ),
        };

        console.log(
          "DEBUG: backendPayload being sent:",
          JSON.stringify(backendPayload, null, 2)
        );

        const resp = await fetch(
          "http://localhost:8000/api/transactions/process/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(backendPayload),
          }
        );
        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(errData.detail || "Failed to save transaction.");
        }
        const result = await resp.json();
        alert(`Success: ${result.message}`);

        // Save to Supabase database after successful Django backend processing (skip for demo users)
        try {
          const userId = user?.id || 'demo-user';
          
          if (userId !== 'demo-user') {
            // Check if user has valid session before attempting Supabase save
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              console.warn("User not authenticated, skipping Supabase save");
              return;
            }
            
            console.log("Saving transaction data to Supabase...");
            
            // Transform transactionPayload to match TransactionData structure expected by Supabase
            const supabasePayload = {
              company_data: {
                company_name: String(
                  transactionPayload.companies?.company_name ||
                    transactionPayload.company?.company_name ||
                    "Default Company"
                ).trim(),
              },
              territory_data: {
                country: String(
                  transactionPayload.territory?.country || "Bangladesh"
                ).trim(),
                region: String(
                  transactionPayload.territory?.region || "Asia"
                ).trim(),
              },
              calendar_data: {
                date: (() => {
                  const date = transactionPayload.calendar.date || new Date().toISOString().split('T')[0];
                  // Ensure valid date format YYYY-MM-DD
                  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                  if (typeof date === 'string' && dateRegex.test(date)) {
                    return date;
                  }
                  // If invalid format, use current date
                  return new Date().toISOString().split('T')[0];
                })(),
                year: Number(transactionPayload.calendar.year || new Date().getFullYear()),
                quarter: String(transactionPayload.calendar.quarter || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`).trim(),
                month: String(transactionPayload.calendar.month || new Date().toLocaleString('default', { month: 'long' })).trim(),
                day: String(transactionPayload.calendar.day || new Date().toLocaleString('default', { weekday: 'long' })).trim(),
              },
              chart_of_accounts_data: transactionPayload.chartofaccounts.map(
                (account: any, index: number) => {
                  // Generate account key based on account class if missing
                  let accountKey = account.account_key;
                  if (!accountKey) {
                    const accountClass = account.class || "Asset";
                    switch (accountClass.toLowerCase()) {
                      case "asset":
                        accountKey = 1000 + index * 10;
                        break;
                      case "liability":
                        accountKey = 2000 + index * 10;
                        break;
                      case "equity":
                      case "owner's equity":
                        accountKey = 3000 + index * 10;
                        break;
                      case "revenue":
                      case "income":
                        accountKey = 4000 + index * 10;
                        break;
                      case "expense":
                        accountKey = 5000 + index * 10;
                        break;
                      default:
                        accountKey = 1000 + index * 10;
                    }
                  }

                  return {
                    account_key: Number(accountKey),
                    report: String(account.report || "Balance Sheet").trim(),
                    class: String(account.class || "Asset").trim(),
                    subclass: String(account.subclass || "Current Asset").trim(),
                    subclass2: String(
                      account.subclass2 || account.subclass || "Current Asset"
                    ).trim(),
                    account: String(account.account || "Unknown Account").trim(),
                    subaccount: String(account.subaccount || "").trim(),
                  };
                }
              ),
              general_ledger_entries: transactionPayload.generalledger.map(
                (entry: any, index: number) => {
                  // Find corresponding chart of accounts entry to get the correct account key
                  let accountKey = entry.account_key;
                  if (!accountKey) {
                    const matchingAccount = transactionPayload.chartofaccounts.find(
                      (acc: any) =>
                        acc.account === entry.account ||
                        acc.account_key === entry.account_key
                    );

                    if (matchingAccount) {
                      const accountClass = matchingAccount.class || "Asset";
                      const chartIndex =
                        transactionPayload.chartofaccounts.indexOf(matchingAccount);
                      switch (accountClass.toLowerCase()) {
                        case "asset":
                          accountKey = 1000 + chartIndex * 10;
                          break;
                        case "liability":
                          accountKey = 2000 + chartIndex * 10;
                          break;
                        case "equity":
                        case "owner's equity":
                          accountKey = 3000 + chartIndex * 10;
                          break;
                        case "revenue":
                        case "income":
                          accountKey = 4000 + chartIndex * 10;
                          break;
                        case "expense":
                          accountKey = 5000 + chartIndex * 10;
                          break;
                        default:
                          accountKey = 1000 + chartIndex * 10;
                      }
                    } else {
                      accountKey = 1000 + index * 10; // Fallback
                    }
                  }

                  return {
                    account_key: Number(accountKey),
                    details: String(entry.details || "").trim(),
                    amount: Number(entry.amount || 0),
                    type: String(entry.type || "Debit").trim() as 'Debit' | 'Credit',
                  };
                }
              ),
            };
            
            const supabaseSaveResult = await supabaseAccountingService.saveTransactionData(
              userId,
              supabasePayload
            );
            
            if (supabaseSaveResult.success) {
              console.log("Successfully saved to Supabase:", supabaseSaveResult);
            } else {
              console.error("Failed to save to Supabase:", supabaseSaveResult.error);
              // Don't throw error here as Django backend already processed successfully
            }
          } else {
            console.log("Demo mode: Skipping Supabase save to avoid RLS policy conflicts");
          }
        } catch (supabaseError) {
          console.error("Error saving to Supabase:", supabaseError);
          // Don't throw error here as Django backend already processed successfully
        }

        // also push into local list for instant UI update
        const newTx: Transaction[] = dialogData.transactions.map((t, idx) => ({
          id: `t${transactions.length + idx + 1}`,
          date: new Date(t.date),
          description: t.description,
          amount: t.debit || t.credit || 0,
          type: t.debit > 0 ? "debit" : "credit",
          account: t.account,
          category: t.debit > 0 ? "Expense" : "Revenue",
        }));
        setTransactions((prev) => [...newTx, ...prev]);
      }

      // Clear pending data after successful confirmation
      setPendingTransactionData(null);
      setShowPendingBox(false);
    } catch (err: any) {
      console.error(err);
      setError(`Error processing transactions: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
      setCurrentJournalEntry(null);
      setQuery("");
      setTransactionPayload(null);
      setAiJsonOutput(null);
    }
  };

  // Handle saving report results to database
  const handleSaveReport = async () => {
    if (!reportData) return;

    setIsProcessing(true);
    setError("");

    try {
      const saveResponse = await saveReportResults(
        1, // company_id - you might want to get this from user context
        query, // original query text
        reportData,
        {
          user: "Frontend User",
          query_type: "report",
        }
      );

      if (saveResponse.success) {
        alert(
          `Report query logged successfully! Log ID: ${saveResponse.log_id}`
        );
      } else {
        throw new Error("Failed to save report to database");
      }
    } catch (err) {
      setError(`Failed to save report: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editing amounts in the dialog
  const handleAmountEdit = (
    index: number,
    field: "debit" | "credit",
    value: string
  ) => {
    if (!currentJournalEntry) return;

    const numValue = parseFloat(value) || 0;
    const updatedEntries = [...currentJournalEntry.entries];

    if (field === "debit") {
      updatedEntries[index] = {
        ...updatedEntries[index],
        debit: numValue,
        credit: undefined,
      };
    } else {
      updatedEntries[index] = {
        ...updatedEntries[index],
        credit: numValue,
        debit: undefined,
      };
    }

    setCurrentJournalEntry({
      ...currentJournalEntry,
      entries: updatedEntries,
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (query.trim() && !isProcessing) {
          handleSubmitQuery();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query, isProcessing]);

  // Character count for query input
  const characterCount = query.length;
  const maxCharacters = 1000;

  // Helper functions for new UI
  const handleCardExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleCompanyEdit = () => {
    setTempCompanyName(currentJournalEntry?.description || "");
    setEditingCompany(true);
  };

  const handleCompanySave = () => {
    if (currentJournalEntry) {
      setCurrentJournalEntry({
        ...currentJournalEntry,
        description: tempCompanyName,
      });
    }
    setEditingCompany(false);
  };

  const handleCompanyCancel = () => {
    setTempCompanyName("");
    setEditingCompany(false);
  };

  const addChartOfAccountsRow = () => {
    setChartOfAccounts([
      ...chartOfAccounts,
      {
        accountKey: "",
        report: "",
        class: "",
        subclass: "",
        subclass2: "",
        account: "",
        subaccount: "",
      },
    ]);
  };

  const removeChartOfAccountsRow = (index: number) => {
    setChartOfAccounts(chartOfAccounts.filter((_, i) => i !== index));
  };

  const updateChartOfAccountsRow = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...chartOfAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setChartOfAccounts(updated);
  };

  const addGeneralLedgerRow = () => {
    setGeneralLedgerEntries([
      ...generalLedgerEntries,
      {
        accountKey: "",
        details: "",
        amount: 0,
        type: "Debit",
      },
    ]);
  };

  const removeGeneralLedgerRow = (index: number) => {
    setGeneralLedgerEntries(generalLedgerEntries.filter((_, i) => i !== index));
  };

  const updateGeneralLedgerRow = (index: number, field: string, value: any) => {
    const updated = [...generalLedgerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setGeneralLedgerEntries(updated);
  };

  const calculateBalance = () => {
    const totalDebits = generalLedgerEntries
      .filter((entry) => entry.type === "Debit")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = generalLedgerEntries
      .filter((entry) => entry.type === "Credit")
      .reduce((sum, entry) => sum + entry.amount, 0);
    return {
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  };

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
  ];
  const regions = {
    "United States": "North America",
    Canada: "North America",
    "United Kingdom": "Europe",
    Australia: "Oceania",
    Germany: "Europe",
    France: "Europe",
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <Alert
          severity="info"
          sx={{
            m: 2,
            borderRadius: 2,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
          icon={<Info />}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="body2">
              <strong>Demo Mode:</strong> You're exploring the AI Query
              Assistant. Transactions won't be saved to the database.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => (window.location.href = "/login")}
              sx={{ ml: 2 }}
            >
              Sign In for Full Access
            </Button>
          </Box>
        </Alert>
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          pt: isDemoMode ? 10 : 2,
          pb: 20, // Space for bottom query interface
          px: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AI Query Assistant
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Ask questions about your finances or record transactions using
            natural language.
          </Typography>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3} sx={{ flexGrow: 1, overflow: "hidden" }}>
          {/* Left side - Transaction Feed */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Transaction Feed
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Filter by date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { width: 180 },
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                <TextField
                  placeholder="Search transactions"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ ml: 2, width: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TableContainer sx={{ flexGrow: 1, overflow: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTransactions.map((transaction) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: "table-row" }}
                        >
                          <TableCell>
                            {transaction.date.toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.account}</TableCell>
                          <TableCell align="right">
                            ${transaction.amount.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={transaction.type}
                              size="small"
                              color={
                                transaction.type === "credit"
                                  ? "success"
                                  : "error"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredTransactions.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="textSecondary">
                    No transactions found
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right side - AI Copilot */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom>
                AI Copilot
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Ask me to record transactions, analyze data, or answer financial
                questions.
              </Typography>

              <Box sx={{ flexGrow: 1, mb: 2, overflow: "auto" }}>
                {/* Example queries */}
                {/* Pending Transactions Box */}
                {showPendingBox && pendingTransactionData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      severity="info"
                      sx={{ mb: 2 }}
                      action={
                        <Box>
                          <Button
                            size="small"
                            onClick={() => {
                              setDialogData(pendingTransactionData);
                              setShowConfirmDialog(true);
                              setShowPendingBox(false);
                            }}
                          >
                            Review
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setPendingTransactionData(null);
                              setShowPendingBox(false);
                            }}
                          >
                            Dismiss
                          </Button>
                        </Box>
                      }
                    >
                      <Typography variant="body2">
                        You have pending transactions ready for review.
                      </Typography>
                    </Alert>
                  </motion.div>
                )}

                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    Try asking:
                  </Typography>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                      mt: 1,
                    }}
                    onClick={() =>
                      setQuery(
                        "Record a sale of $5,000 for ABC Corp consulting services on June 15, 2024 in the United States"
                      )
                    }
                  >
                    <Typography variant="body2">
                      "Record a sale of $5,000 for ABC Corp consulting services
                      on June 15, 2024 in the United States"
                    </Typography>
                  </Box>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                      mt: 1,
                    }}
                    onClick={() =>
                      setQuery(
                        "Enter office supplies expense of $250.75 for TechStart Inc on March 10, 2024 in Canada"
                      )
                    }
                  >
                    <Typography variant="body2">
                      "Enter office supplies expense of $250.75 for TechStart
                      Inc on March 10, 2024 in Canada"
                    </Typography>
                  </Box>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                      mt: 1,
                    }}
                    onClick={() =>
                      setQuery(
                        "Record equipment purchase of $3,200 for Global Solutions Ltd on January 22, 2024 in the United Kingdom"
                      )
                    }
                  >
                    <Typography variant="body2">
                      "Record equipment purchase of $3,200 for Global Solutions
                      Ltd on January 22, 2024 in the United Kingdom"
                    </Typography>
                  </Box>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      borderRadius: 1,
                      mt: 1,
                    }}
                    onClick={() =>
                      setQuery(
                        "Enter rent payment of $1,800 for Innovate Co on February 1, 2024 in Australia"
                      )
                    }
                  >
                    <Typography variant="body2">
                      "Enter rent payment of $1,800 for Innovate Co on February
                      1, 2024 in Australia"
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Query Type Selector */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Query Type</FormLabel>
                <RadioGroup
                  row
                  value={queryType}
                  onChange={(e) =>
                    setQueryType(
                      e.target.value as "reporting" | "transactional"
                    )
                  }
                >
                  <FormControlLabel
                    value="reporting"
                    control={<Radio />}
                    label="Get a Report"
                  />
                  <FormControlLabel
                    value="transactional"
                    control={<Radio />}
                    label="Enter a Transaction"
                  />
                </RadioGroup>
              </FormControl>

              {/* Error Display */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    position: "relative",
                    zIndex: 1001,
                    boxShadow: "0 4px 20px rgba(211, 47, 47, 0.3)",
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Report Data Display */}
              {reportData && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Financial Report</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveReport}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <LoadingSpinner type="circular" size="small" />
                      ) : (
                        "Save Report"
                      )}
                    </Button>
                  </Box>
                  <AccountingTable data={reportData} />
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Bottom Query Interface */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 3,
          zIndex: 1000,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            maxWidth: "800px",
            width: "60%",
            mx: "auto",
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          {/* Query Input */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TextField
                inputRef={queryInputRef}
                fullWidth
                multiline
                minRows={1}
                maxRows={6}
                placeholder="Enter your accounting transaction query..."
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: "48px",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                    "&.Mui-focused": {
                      boxShadow:
                        "0 0 0 3px rgba(25, 118, 210, 0.12), 0 4px 20px rgba(0,0,0,0.15)",
                      transform: "scale(1.02)",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: query && (
                    <InputAdornment position="end">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Button
                          size="small"
                          onClick={() => setQuery("")}
                          sx={{ minWidth: "auto", p: 0.5 }}
                        >
                          <Close fontSize="small" />
                        </Button>
                      </motion.div>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            {/* Character Count */}
            {query && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: 8,
                  fontSize: "0.75rem",
                }}
              >
                {characterCount}/{maxCharacters}
              </Typography>
            )}
          </Box>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitQuery}
              disabled={
                !query.trim() || isProcessing || characterCount > maxCharacters
              }
              sx={{
                height: "48px",
                px: 3,
                borderRadius: 3,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                },
              }}
            >
              {isProcessing ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LoadingSpinner type="circular" size="small" />
                  <Typography variant="body2">Processing...</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Send fontSize="small" />
                  <Typography variant="body2">Process Query</Typography>
                </Box>
              )}
            </Button>
          </motion.div>
        </Box>

        {/* Keyboard Shortcut Hint */}
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            fontSize: "0.7rem",
          }}
        >
          Press Ctrl+Enter to submit
        </Typography>
      </Box>

      {/* Enhanced Transaction Confirmation Dialog */}
      <ConfirmTransactionDialog
        open={showConfirmDialog}
        onClose={() => {
          console.log("Dialog onClose triggered, isProcessing:", isProcessing);
          // Only close if not currently processing to prevent accidental closure
          if (!isProcessing) {
            console.log("Closing dialog and saving pending data");
            // Save current dialog data as pending
            setPendingTransactionData(dialogData);
            setShowPendingBox(true);
            setShowConfirmDialog(false);
            // Don't clear currentJournalEntry and expandedCard immediately to prevent black screen
            setTimeout(() => {
              setCurrentJournalEntry(null);
              setExpandedCard(null);
            }, 100);
          } else {
            console.log("Dialog close prevented due to processing state");
          }
        }}
        transactions={dialogData.transactions}
        companyInfo={dialogData.companyInfo}
        territoryDetails={dialogData.territoryDetails}
        calendarInfo={dialogData.calendarInfo}
        chartOfAccounts={dialogData.chartOfAccounts}
        companyData={companyData}
        territoryData={territoryData}
        calendarData={calendarData}
        chartOfAccountsData={chartOfAccountsData}
        generalLedgerData={generalLedgerData}
        onConfirm={handleConfirmEntry}
        isProcessing={isProcessing}
        isDemoMode={isDemoMode}
      />
    </Box>
  );
};

export default QueryPage;
