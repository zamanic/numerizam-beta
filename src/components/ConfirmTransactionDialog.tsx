import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Skeleton,
} from "@mui/material";

import LoadingSpinner from "./LoadingSpinner";
import {
  ExpandMore,
  Edit,
  Delete,
  ContentCopy,
  Save,
  Warning,
  CheckCircle,
  Info,
  Close,
  MoreVert,
  Balance,
  AccountBalance,
  Receipt,
  Business,
  CalendarToday,
  Assessment,
} from "@mui/icons-material";

import InlineEditField from "./InlineEditField";

interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
  reference?: string;
  isModified?: boolean;
  isValidated?: boolean;
  errors?: string[];
}

interface CompanyData {
  company_name: string;
}

interface TerritoryData {
  country: string;
  region: string;
}

interface CalendarData {
  date: string;
  year: string;
  quarter: string;
  month: string;
  day: string;
}

interface ChartOfAccountsData {
  account_key: string;
  report: string;
  class: string;
  subclass: string;
  account: string;
}

interface GeneralLedgerData {
  date: string;
  account_key: string;
  details: string;
  amount: number;
  type: "Debit" | "Credit";
}

interface CompanyInfo {
  name: string;
  address: string;
  taxId: string;
  fiscalYear: string;
}

interface TerritoryDetails {
  region: string;
  currency: string;
  taxRate: number;
  regulations: string[];
}

interface CalendarInfo {
  period: string;
  quarter: string;
  fiscalYear: string;
  daysRemaining: number;
}

interface ChartOfAccounts {
  accounts: Array<{
    code: string;
    name: string;
    type: string;
    balance: number;
    isActive: boolean;
  }>;
}

interface ConfirmTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  transactions: Transaction[];
  companyInfo: CompanyInfo;
  territoryDetails: TerritoryDetails;
  calendarInfo: CalendarInfo;
  chartOfAccounts: ChartOfAccounts;
  loading?: boolean;
  error?: string | null;
  isProcessing?: boolean;
  isDemoMode?: boolean;
  // New structured data props
  companyData?: CompanyData;
  territoryData?: TerritoryData;
  calendarData?: CalendarData;
  chartOfAccountsData?: ChartOfAccountsData[];
  generalLedgerData?: GeneralLedgerData[];
}

export const ConfirmTransactionDialog: React.FC<
  ConfirmTransactionDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  transactions: initialTransactions,
  companyInfo: initialCompanyInfo,
  territoryDetails: initialTerritoryDetails,
  calendarInfo: initialCalendarInfo,
  chartOfAccounts: initialChartOfAccounts,
  loading = false,
  error = null,
  isProcessing = false,
  isDemoMode = false,
  // New structured data props
  companyData: initialCompanyData,
  territoryData: initialTerritoryData,
  calendarData: initialCalendarData,
  chartOfAccountsData: initialChartOfAccountsData,
  generalLedgerData: initialGeneralLedgerData,
}) => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [companyInfo, setCompanyInfo] =
    useState<CompanyInfo>(initialCompanyInfo);
  const [territoryDetails, setTerritoryDetails] = useState<TerritoryDetails>(
    initialTerritoryDetails
  );
  const [calendarInfo, setCalendarInfo] =
    useState<CalendarInfo>(initialCalendarInfo);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccounts>(
    initialChartOfAccounts
  );

  // New structured data state
  const [companyData, setCompanyData] = useState<CompanyData>(
    initialCompanyData || { company_name: "Patrick Incitti" }
  );
  const [territoryData, setTerritoryData] = useState<TerritoryData>(
    initialTerritoryData || { country: "Bangladesh", region: "Asia" }
  );
  const [calendarData, setCalendarData] = useState<CalendarData>(
    initialCalendarData || { date: "2025-01-24", year: "2025", quarter: "Q1", month: "January", day: "Friday" }
  );
  const [chartOfAccountsData, setChartOfAccountsData] = useState<ChartOfAccountsData[]>(
    initialChartOfAccountsData || [
      { account_key: "1000", report: "Balance Sheet", class: "Asset", subclass: "Current Asset", account: "Cash" },
      { account_key: "3000", report: "Balance Sheet", class: "Owner's Equity", subclass: "Owner's Equity", account: "Owner's Capital" },
      { account_key: "1030", report: "Balance Sheet", class: "Asset", subclass: "Current Asset", account: "Office supplies" },
      { account_key: "2000", report: "Balance Sheet", class: "Liability", subclass: "Current Liability", account: "Accounts Payable" },
      { account_key: "4000", report: "Profit and Loss", class: "Revenue", subclass: "Operating Revenue", account: "Fees Earned" },
      { account_key: "3001", report: "Balance Sheet", class: "Owner's Equity", subclass: "Owner's Equity", account: "Withdrawals" },
    ]
  );
  const [generalLedgerData, setGeneralLedgerData] = useState<GeneralLedgerData[]>(
    initialGeneralLedgerData || [
      { date: "2025-01-24", account_key: "1000", details: "Owner investment to open law practice", amount: 999, type: "Debit" },
      { date: "2025-01-24", account_key: "3000", details: "Owner investment to open law practice", amount: 999, type: "Credit" },
      { date: "2025-01-24", account_key: "1030", details: "Bought office supplies on account", amount: 999, type: "Debit" },
      { date: "2025-01-24", account_key: "2000", details: "Bought office supplies on account", amount: 999, type: "Credit" },
      { date: "2025-01-24", account_key: "1000", details: "Cash received as fees earned", amount: 999, type: "Debit" },
      { date: "2025-01-24", account_key: "4000", details: "Fees earned during the month", amount: 999, type: "Credit" },
      { date: "2025-01-24", account_key: "2000", details: "Payment on account for office supplies", amount: 999, type: "Debit" },
      { date: "2025-01-24", account_key: "1000", details: "Payment on account for office supplies", amount: 999, type: "Credit" },
      { date: "2025-01-24", account_key: "3001", details: "Owner withdrawal for personal use", amount: 999, type: "Debit" },
      { date: "2025-01-24", account_key: "1000", details: "Owner withdrawal for personal use", amount: 999, type: "Credit" },
    ]
  );

  // Sync props with local state
  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received transactions prop:", initialTransactions);
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received companyInfo prop:", initialCompanyInfo);
    setCompanyInfo(initialCompanyInfo);
  }, [initialCompanyInfo]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received territoryDetails prop:", initialTerritoryDetails);
    setTerritoryDetails(initialTerritoryDetails);
  }, [initialTerritoryDetails]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received calendarInfo prop:", initialCalendarInfo);
    setCalendarInfo(initialCalendarInfo);
  }, [initialCalendarInfo]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received chartOfAccounts prop:", initialChartOfAccounts);
    setChartOfAccounts(initialChartOfAccounts);
  }, [initialChartOfAccounts]);

  // Sync new structured data props with local state
  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received companyData prop:", initialCompanyData);
    if (initialCompanyData) {
      setCompanyData(initialCompanyData);
    }
  }, [initialCompanyData]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received territoryData prop:", initialTerritoryData);
    if (initialTerritoryData) {
      setTerritoryData(initialTerritoryData);
    }
  }, [initialTerritoryData]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received calendarData prop:", initialCalendarData);
    if (initialCalendarData) {
      setCalendarData(initialCalendarData);
    }
  }, [initialCalendarData]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received chartOfAccountsData prop:", initialChartOfAccountsData);
    if (initialChartOfAccountsData && initialChartOfAccountsData.length > 0) {
      setChartOfAccountsData(initialChartOfAccountsData);
    }
  }, [initialChartOfAccountsData]);

  useEffect(() => {
    console.log("ConfirmTransactionDialog: Received generalLedgerData prop:", initialGeneralLedgerData);
    if (initialGeneralLedgerData && initialGeneralLedgerData.length > 0) {
      setGeneralLedgerData(initialGeneralLedgerData);
    }
  }, [initialGeneralLedgerData]);

  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["transactions"])
  );
  const [saveOption, setSaveOption] = useState<"all" | "selected" | "draft">(
    "all"
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [isValidating, setIsValidating] = useState(false);
  const [bulkActionAnchor, setBulkActionAnchor] = useState<null | HTMLElement>(
    null
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Calculate totals and validation
  const selectedTxns = useMemo(() => {
    return saveOption === "selected"
      ? transactions.filter((t) => selectedTransactions.has(t.id))
      : transactions;
  }, [transactions, selectedTransactions, saveOption]);

  const totals = useMemo(() => {
    const totalDebit = selectedTxns.reduce((sum, t) => sum + (Number(t.debit) || 0), 0);
    const totalCredit = selectedTxns.reduce((sum, t) => sum + (Number(t.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return { totalDebit, totalCredit, isBalanced, count: selectedTxns.length };
  }, [selectedTxns]);

  // Real-time validation
  useEffect(() => {
    const validateTransactions = () => {
      setIsValidating(true);
      const errors: Record<string, string[]> = {};

      transactions.forEach((transaction) => {
        const txnErrors: string[] = [];

        if (!transaction.description.trim()) {
          txnErrors.push("Description is required");
        }

        if (transaction.debit === 0 && transaction.credit === 0) {
          txnErrors.push("Either debit or credit must be greater than 0");
        }

        if (transaction.debit < 0 || transaction.credit < 0) {
          txnErrors.push("Amounts cannot be negative");
        }

        if (!transaction.account.trim()) {
          txnErrors.push("Account is required");
        }

        if (txnErrors.length > 0) {
          errors[transaction.id] = txnErrors;
        }
      });

      setValidationErrors(errors);
      setIsValidating(false);
    };

    const debounceTimer = setTimeout(validateTransactions, 300);
    return () => clearTimeout(debounceTimer);
  }, [transactions]);

  const handleTransactionUpdate = (
    id: string,
    field: keyof Transaction,
    value: any
  ) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, [field]: value, isModified: true } : t
      )
    );
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    setSelectedTransactions((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map((t) => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkActionAnchor(null);

    switch (action) {
      case "duplicate":
        const duplicatedTxns = selectedTxns.map((t) => ({
        ...t,
        id: `${t.id}_copy_${Date.now()}`,
        description: `Copy of ${t.description}`,
        isModified: true,
      }));
      setTransactions((prev) => [...prev, ...duplicatedTxns]);
      setSnackbar({
        open: true,
        message: `Duplicated ${selectedTxns.length} transactions`,
        severity: "success",
      });
        break;

      case "delete":
        setTransactions((prev) =>
          prev.filter((t) => !selectedTransactions.has(t.id))
        );
        setSelectedTransactions(new Set());
        setSnackbar({
          open: true,
          message: "Deleted selected transactions",
          severity: "info",
        });
        break;

      case "edit":
        // Implement batch edit functionality
        setSnackbar({
          open: true,
          message: "Batch edit mode activated",
          severity: "info",
        });
        break;
    }
  };

  const handleSave = () => {
    if (Object.keys(validationErrors).length > 0) {
      setSnackbar({
        open: true,
        message: "Please fix validation errors before saving",
        severity: "error",
      });
      return;
    }

    // Allow saving even if unbalanced, but show confirmation dialog with warning
    setShowConfirmation(true);
  };

  const handleConfirmSave = () => {

    // Ensure date is never undefined or empty and is in valid format
    const today = new Date().toISOString().split("T")[0];
    const validDate = calendarData.date && calendarData.date.trim() !== "" && 
                     calendarData.date.toLowerCase() !== "undefined" && 
                     /^\d{4}-\d{2}-\d{2}$/.test(calendarData.date.trim())
      ? calendarData.date.trim()
      : (transactions[0]?.date || today);
    
    // Ensure year is never undefined or empty
    const validYear = calendarData.year && calendarData.year.trim() !== "" && calendarData.year.toLowerCase() !== "undefined"
      ? calendarData.year.trim()
      : new Date(validDate).getFullYear().toString();
    
    // Ensure quarter is never undefined or empty
    const validQuarter = calendarData.quarter && calendarData.quarter.trim() !== "" && calendarData.quarter.toLowerCase() !== "undefined"
      ? calendarData.quarter.trim()
      : `Q${Math.floor((new Date(validDate).getMonth() + 3) / 3)}`;
    
    // Ensure month is never undefined or empty
    const validMonth = calendarData.month && calendarData.month.trim() !== "" && calendarData.month.toLowerCase() !== "undefined"
      ? calendarData.month.trim()
      : new Date(validDate).toLocaleString("default", { month: "long" });
    
    // Ensure day is never undefined or empty
    const validDay = calendarData.day && calendarData.day.trim() !== "" && calendarData.day.toLowerCase() !== "undefined"
      ? calendarData.day.trim()
      : new Date(validDate).toLocaleString("default", { weekday: "long" });

    // Transform data to match TransactionPayloadSerializer expected by backend
    const dataToSave = {
      company_data: {
        company_name: companyInfo.name,
      },
      territory_data: {
        Country: territoryDetails.region === "Asia" ? "Bangladesh" : "USA",
        Region: territoryDetails.region,
      },
      calendar_data: {
        date: validDate,
        year: parseInt(validYear) || new Date(transactions[0]?.date || new Date()).getFullYear(),
        quarter: validQuarter,
        month: validMonth,
        day: validDay,
      },
      chart_of_accounts_data: chartOfAccounts.accounts.map((acc) => ({
        Account_key: parseInt(acc.code) || 1000, // Default to 1000 if parsing fails
        Report:
          acc.type === "Asset" ||
          acc.type === "Liability" ||
          acc.type === "Equity"
            ? "Balance Sheet"
            : "Profit and Loss",
        Class: acc.type,
        SubClass: acc.type,
        SubClass2: acc.type,
        Account: acc.name,
        SubAccount: acc.name,
      })),
      general_ledger_entries: selectedTxns.map((txn) => {
        // Extract account key from account string (format: "1000 - Cash")
        const accountMatch = txn.account.match(/^(\d+)/);
        const accountKey = accountMatch ? parseInt(accountMatch[1]) : 1000;
        
        const debitAmount = Number(txn.debit) || 0;
        const creditAmount = Number(txn.credit) || 0;
        
        return {
          Account_key: accountKey,
          Details: txn.description,
          Amount: debitAmount || creditAmount,
          Type: (debitAmount > 0 ? "Debit" : "Credit") as "Debit" | "Credit",
        };
      }),
      // Additional metadata for the dialog (not part of TransactionData interface)
      _metadata: {
        transactions: selectedTxns,
        companyInfo,
        territoryDetails,
        calendarInfo,
        chartOfAccounts,
        saveOption,
        editedFields: transactions
          .filter(t => t.isModified)
          .map(t => ({ id: t.id, modified: true })),
      },
    };

    onConfirm(dataToSave);
    setShowConfirmation(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    count?: number
  ) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
      {icon}
      <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip label={count} size="small" color="primary" variant="outlined" />
      )}
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={isProcessing ? undefined : onClose}
        maxWidth="xl"
        fullWidth
        disableEscapeKeyDown={isProcessing}
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        aria-labelledby="confirm-transaction-dialog-title"
        PaperProps={{
          sx: {
            minHeight: "80vh",
            maxHeight: "90vh",
            minWidth: "1200px",
            borderRadius: 2,
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, #1E40AF 0%, #059669 100%)",
            color: "white",
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Confirm Transaction
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isValidating && <LinearProgress sx={{ width: 100 }} />}
              <IconButton
                onClick={onClose}
                sx={{ color: "white" }}
                disabled={isProcessing}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Balance Status */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={totals.isBalanced ? <CheckCircle /> : <Warning />}
              label={totals.isBalanced ? "Balanced" : "Unbalanced"}
              color={totals.isBalanced ? "success" : "error"}
              variant="filled"
            />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Debit: ${totals.totalDebit.toFixed(2)} | Credit: $
              {totals.totalCredit.toFixed(2)}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading && (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <Box sx={{ p: 3 }}>
              {/* Company Information */}
              <Accordion
                expanded={expandedSections.has("company")}
                onChange={() => toggleSection("company")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "Company Information",
                    <Business color="primary" />
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <InlineEditField
                          label="Company Name"
                          value={companyData.company_name}
                          placeholder={transactions[0]?.description ? transactions[0].description.split(' ')[0] + " Corp" : "Enter company name"}
                          onSave={(value) =>
                            setCompanyData((prev) => ({
                              ...prev,
                              company_name: value.toString(),
                            }))
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              {/* Territory Information */}
              <Accordion
                expanded={expandedSections.has("territory")}
                onChange={() => toggleSection("territory")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "Territory Information",
                    <AccountBalance color="primary" />
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <InlineEditField
                          label="Country"
                          value={territoryData.country}
                          placeholder="United States"
                          onSave={(value) =>
                            setTerritoryData((prev) => ({
                              ...prev,
                              country: value.toString(),
                            }))
                          }
                        />
                        <InlineEditField
                          label="Region"
                          value={territoryData.region}
                          placeholder="California, New York, etc."
                          onSave={(value) =>
                            setTerritoryData((prev) => ({
                              ...prev,
                              region: value.toString(),
                            }))
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              {/* Calendar Information */}
              <Accordion
                expanded={expandedSections.has("calendar")}
                onChange={() => toggleSection("calendar")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "Calendar Information",
                    <CalendarToday color="primary" />
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <InlineEditField
                          label="Date"
                          value={calendarData.date}
                          placeholder="YYYY-MM-DD (e.g., 2025-01-24)"
                          onSave={(value) => {
                            const validDate = value && value.toString().trim() !== "" && value.toString().toLowerCase() !== "undefined"
                              ? value.toString().trim()
                              : (transactions[0]?.date || new Date().toISOString().split("T")[0]);
                            setCalendarData((prev) => ({
                              ...prev,
                              date: validDate,
                            }));
                          }}
                          validation={(value) => {
                            const dateStr = value?.toString().trim();
                            if (!dateStr || dateStr === "" || dateStr.toLowerCase() === "undefined") {
                              return "Date is required";
                            }
                            // Basic date format validation
                            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                            if (!dateRegex.test(dateStr)) {
                              return "Date must be in YYYY-MM-DD format";
                            }
                            return null;
                          }}
                        />
                        <InlineEditField
                          label="Year"
                          value={calendarData.year}
                          placeholder="YYYY (e.g., 2025)"
                          onSave={(value) => {
                            const validYear = value && value.toString().trim() !== "" && value.toString().toLowerCase() !== "undefined"
                              ? value.toString() 
                              : (transactions[0]?.date ? new Date(transactions[0].date).getFullYear().toString() : new Date().getFullYear().toString());
                            setCalendarData((prev) => ({
                              ...prev,
                              year: validYear,
                            }));
                          }}
                        />
                        <InlineEditField
                          label="Quarter"
                          value={calendarData.quarter}
                          placeholder="QX (e.g., Q1, Q2, Q3, Q4)"
                          onSave={(value) => {
                            const validQuarter = value && value.toString().trim() !== "" && value.toString().toLowerCase() !== "undefined"
                              ? value.toString() 
                              : (transactions[0]?.date ? `Q${Math.floor((new Date(transactions[0].date).getMonth() + 3) / 3)}` : "Q1");
                            setCalendarData((prev) => ({
                              ...prev,
                              quarter: validQuarter,
                            }));
                          }}
                        />
                        <InlineEditField
                          label="Month"
                          value={calendarData.month}
                          placeholder="Month name (e.g., January, February)"
                          onSave={(value) => {
                            const validMonth = value && value.toString().trim() !== "" && value.toString().toLowerCase() !== "undefined"
                              ? value.toString() 
                              : (transactions[0]?.date ? new Date(transactions[0].date).toLocaleString("default", { month: "long" }) : new Date().toLocaleString("default", { month: "long" }));
                            setCalendarData((prev) => ({
                              ...prev,
                              month: validMonth,
                            }));
                          }}
                        />
                        <InlineEditField
                          label="Day"
                          value={calendarData.day}
                          placeholder="Weekday name (e.g., Monday, Tuesday)"
                          onSave={(value) => {
                            const validDay = value && value.toString().trim() !== "" && value.toString().toLowerCase() !== "undefined"
                              ? value.toString() 
                              : (transactions[0]?.date ? new Date(transactions[0].date).toLocaleString("default", { weekday: "long" }) : new Date().toLocaleString("default", { weekday: "long" }));
                            setCalendarData((prev) => ({
                              ...prev,
                              day: validDay,
                            }));
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              {/* Chart of Accounts */}
              <Accordion
                expanded={expandedSections.has("accounts")}
                onChange={() => toggleSection("accounts")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "Chart of Accounts",
                    <Assessment color="primary" />,
                    chartOfAccountsData.length
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Account Key</TableCell>
                          <TableCell>Report</TableCell>
                          <TableCell>Class</TableCell>
                          <TableCell>Sub Class</TableCell>
                          <TableCell>Account</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chartOfAccountsData.map((account, index) => (
                          <TableRow key={`${account.account_key}-${index}`} className="hover-lift">
                            <TableCell>
                              <InlineEditField
                                label="Account Key"
                                value={account.account_key}
                                placeholder="1000-Cash"
                                onSave={(value) => {
                                  const updated = [...chartOfAccountsData];
                                  updated[index] = { ...updated[index], account_key: value?.toString().trim() || "1000-Cash" };
                                  setChartOfAccountsData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Report"
                                value={account.report}
                                placeholder="Balance Sheet"
                                onSave={(value) => {
                                  const updated = [...chartOfAccountsData];
                                  updated[index] = { ...updated[index], report: value?.toString().trim() || "Balance Sheet" };
                                  setChartOfAccountsData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Class"
                                value={account.class}
                                placeholder="Assets"
                                onSave={(value) => {
                                  const updated = [...chartOfAccountsData];
                                  updated[index] = { ...updated[index], class: value?.toString().trim() || "Assets" };
                                  setChartOfAccountsData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Sub Class"
                                value={account.subclass}
                                placeholder="Current Assets"
                                onSave={(value) => {
                                  const updated = [...chartOfAccountsData];
                                  updated[index] = { ...updated[index], subclass: value?.toString().trim() || "Current Assets" };
                                  setChartOfAccountsData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Account"
                                value={account.account}
                                placeholder="Cash"
                                onSave={(value) => {
                                  const updated = [...chartOfAccountsData];
                                  updated[index] = { ...updated[index], account: value?.toString().trim() || "Cash" };
                                  setChartOfAccountsData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* General Ledger */}
              <Accordion
                expanded={expandedSections.has("generalledger")}
                onChange={() => toggleSection("generalledger")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "General Ledger",
                    <Receipt color="primary" />,
                    generalLedgerData.length
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Account Key</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generalLedgerData.map((entry, index) => (
                          <TableRow key={`gl-${index}`} className="hover-lift">
                            <TableCell>
                              <InlineEditField
                                label="Date"
                                value={entry.date}
                                placeholder="YYYY-MM-DD (e.g., 2025-01-24)"
                                onSave={(value) => {
                                  const updated = [...generalLedgerData];
                                  updated[index] = { ...updated[index], date: value?.toString().trim() || transactions[0]?.date || new Date().toISOString().split('T')[0] };
                                  setGeneralLedgerData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Account Key"
                                value={entry.account_key}
                                placeholder="1000-Cash"
                                onSave={(value) => {
                                  const updated = [...generalLedgerData];
                                  updated[index] = { ...updated[index], account_key: value?.toString().trim() || "1000-Cash" };
                                  setGeneralLedgerData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                label="Details"
                                value={entry.details}
                                placeholder={transactions[0]?.description || "Transaction description"}
                                onSave={(value) => {
                                  const updated = [...generalLedgerData];
                                  updated[index] = { ...updated[index], details: value?.toString().trim() || transactions[0]?.description || "Transaction description" };
                                  setGeneralLedgerData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <InlineEditField
                                label="Amount"
                                type="number"
                                value={entry.amount}
                                placeholder="0.00"
                                onSave={(value) => {
                                  const updated = [...generalLedgerData];
                                  updated[index] = { ...updated[index], amount: Number(value) || 0 };
                                  setGeneralLedgerData(updated);
                                  
                                  // Auto-clear opposite field logic
                                  if (Number(value) > 0) {
                                    // Clear the opposite type if this entry becomes the active one
                                    const oppositeType = entry.type === "Debit" ? "Credit" : "Debit";
                                    const oppositeIndex = generalLedgerData.findIndex(
                                      (e, i) => i !== index && e.account_key === entry.account_key && e.type === oppositeType
                                    );
                                    if (oppositeIndex !== -1) {
                                      updated[oppositeIndex] = { ...updated[oppositeIndex], amount: 0 };
                                    }
                                  }
                                  setGeneralLedgerData(updated);
                                }}
                                variant="table"
                                prefix="$"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <InlineEditField
                                label="Type"
                                value={entry.type}
                                placeholder="Debit"
                                onSave={(value) => {
                                  const updated = [...generalLedgerData];
                                  updated[index] = { ...updated[index], type: (value?.toString().trim() || "Debit") as "Debit" | "Credit" };
                                  setGeneralLedgerData(updated);
                                }}
                                variant="table"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Balance Summary */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Balance Summary
                    </Typography>
                    <Box sx={{ display: "flex", gap: 4 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Debit
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          ${generalLedgerData
                            .filter(e => e.type === "Debit")
                            .reduce((sum, e) => sum + e.amount, 0)
                            .toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Credit
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ${generalLedgerData
                            .filter(e => e.type === "Credit")
                            .reduce((sum, e) => sum + e.amount, 0)
                            .toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Difference
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={
                            Math.abs(
                              generalLedgerData.filter(e => e.type === "Debit").reduce((sum, e) => sum + e.amount, 0) -
                              generalLedgerData.filter(e => e.type === "Credit").reduce((sum, e) => sum + e.amount, 0)
                            ) < 0.01 ? "success.main" : "warning.main"
                          }
                        >
                          ${Math.abs(
                            generalLedgerData.filter(e => e.type === "Debit").reduce((sum, e) => sum + e.amount, 0) -
                            generalLedgerData.filter(e => e.type === "Credit").reduce((sum, e) => sum + e.amount, 0)
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "grey.50",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={saveOption === "selected"}
                    onChange={(e) =>
                      setSaveOption(e.target.checked ? "selected" : "all")
                    }
                    disabled={selectedTransactions.size === 0}
                  />
                }
                label="Save selected only"
              />
              {saveOption === "selected" && (
                <Typography variant="body2" color="text.secondary">
                  ({selectedTransactions.size} transactions)
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setSaveOption("draft")}
                startIcon={<Save />}
              >
                Save Draft
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={
                  Object.keys(validationErrors).length > 0 ||
                  isProcessing
                }
                startIcon={
                  isProcessing ? (
                    <LoadingSpinner type="circular" size="small" />
                  ) : (
                    <Save />
                  )
                }
                className="hover-lift"
                sx={{
                  background:
                    "linear-gradient(135deg, #1E40AF 0%, #059669 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1E3A8A 0%, #047857 100%)",
                  },
                }}
              >
                {isProcessing
                  ? "Processing..."
                  : isDemoMode
                  ? "Process Transaction"
                  : "Save to Database"}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkActionAnchor}
        open={Boolean(bulkActionAnchor)}
        onClose={() => setBulkActionAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction("duplicate")}>
          <ListItemIcon>
            <ContentCopy />
          </ListItemIcon>
          <ListItemText>Duplicate Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction("edit")}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Batch Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction("delete")}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Save Operation</DialogTitle>
        <DialogContent>
          {!totals.isBalanced ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>⚠️ Unbalanced Transaction Warning</AlertTitle>
              The total debits and credits are not equal. This may indicate an error in your entries.
              <br />
              <strong>Difference: ${Math.abs(totals.totalDebit - totals.totalCredit).toFixed(2)}</strong>
              <br />
              Please review your entries before proceeding.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Summary of Changes</AlertTitle>
              You are about to save {totals.count} transactions to the database.
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              • Total Debit: ${totals.totalDebit.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              • Total Credit: ${totals.totalCredit.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: totals.isBalanced ? 'success.main' : 'error.main',
              fontWeight: totals.isBalanced ? 'normal' : 'bold'
            }}>
              • Balance Status:{" "}
              {totals.isBalanced ? "Balanced ✓" : `Unbalanced ✗ (Difference: $${Math.abs(totals.totalDebit - totals.totalCredit).toFixed(2)})`}
            </Typography>
            <Typography variant="body2">
              • Modified Transactions:{" "}
              {transactions.filter((t) => t.isModified).length}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSave}
            color={totals.isBalanced ? "primary" : "warning"}
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <LoadingSpinner type="circular" size="small" />
              ) : undefined
            }
          >
            {isProcessing ? "Processing..." : totals.isBalanced ? "Confirm Save" : "Save Anyway"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConfirmTransactionDialog;
