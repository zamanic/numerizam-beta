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

  // Sync local state with props when they change
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    setCompanyInfo(initialCompanyInfo);
  }, [initialCompanyInfo]);

  useEffect(() => {
    setTerritoryDetails(initialTerritoryDetails);
  }, [initialTerritoryDetails]);

  useEffect(() => {
    setCalendarInfo(initialCalendarInfo);
  }, [initialCalendarInfo]);

  useEffect(() => {
    setChartOfAccounts(initialChartOfAccounts);
  }, [initialChartOfAccounts]);

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
  const totals = useMemo(() => {
    const selectedTxns =
      saveOption === "selected"
        ? transactions.filter((t) => selectedTransactions.has(t.id))
        : transactions;

    const totalDebit = selectedTxns.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = selectedTxns.reduce((sum, t) => sum + t.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return { totalDebit, totalCredit, isBalanced, count: selectedTxns.length };
  }, [transactions, selectedTransactions, saveOption]);

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
        const selectedTxns = transactions.filter((t) =>
          selectedTransactions.has(t.id)
        );
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

    if (!totals.isBalanced) {
      setSnackbar({
        open: true,
        message: "Debits and credits must be balanced",
        severity: "error",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSave = () => {
    const selectedTxns =
      saveOption === "selected"
        ? transactions.filter((t) => selectedTransactions.has(t.id))
        : transactions;

    // Transform data to match TransactionData interface expected by supabaseAccountingService
    const dataToSave = {
      company_data: {
        company_name: companyInfo.name,
      },
      territory_data: {
        country: territoryDetails.region === "Asia" ? "Bangladesh" : "USA",
        region: territoryDetails.region,
      },
      calendar_data: {
        date: selectedTxns[0]?.date || new Date().toISOString().split("T")[0],
        year: new Date(selectedTxns[0]?.date || new Date()).getFullYear(),
        quarter: calendarInfo.quarter || "Q1",
        month: new Date(selectedTxns[0]?.date || new Date()).toLocaleString(
          "default",
          { month: "long" }
        ),
        day: new Date(selectedTxns[0]?.date || new Date()).toLocaleString(
          "default",
          { weekday: "long" }
        ),
      },
      chart_of_accounts_data: chartOfAccounts.accounts.map((acc) => ({
        account_key: parseInt(acc.code),
        report:
          acc.type === "Asset" ||
          acc.type === "Liability" ||
          acc.type === "Equity"
            ? "Balance Sheet"
            : "Profit and Loss",
        class: acc.type,
        subclass: acc.type,
        subclass2: acc.type,
        account: acc.name,
        subaccount: acc.name,
      })),
      general_ledger_entries: selectedTxns.map((txn) => ({
        account_key: parseInt(txn.account.split(" - ")[0]),
        details: txn.description,
        amount: txn.debit || txn.credit,
        type: (txn.debit > 0 ? "Debit" : "Credit") as "Debit" | "Credit",
      })),
      // Additional metadata for the dialog
      _metadata: {
        transactions: selectedTxns,
        companyInfo,
        territoryDetails,
        calendarInfo,
        chartOfAccounts,
        saveOption,
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
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: 2,
                        }}
                      >
                        <InlineEditField
                          label="Company Name"
                          value={companyInfo.name}
                          onSave={(value) =>
                            setCompanyInfo((prev) => ({
                              ...prev,
                              name: value.toString(),
                            }))
                          }
                          required
                        />
                        <InlineEditField
                          label="Address"
                          value={companyInfo.address}
                          onSave={(value) =>
                            setCompanyInfo((prev) => ({
                              ...prev,
                              address: value.toString(),
                            }))
                          }
                          multiline
                          rows={2}
                        />
                        <InlineEditField
                          label="Tax ID"
                          value={companyInfo.taxId}
                          onSave={(value) =>
                            setCompanyInfo((prev) => ({
                              ...prev,
                              taxId: value.toString(),
                            }))
                          }
                          required
                        />
                        <InlineEditField
                          label="Fiscal Year"
                          value={companyInfo.fiscalYear}
                          onSave={(value) =>
                            setCompanyInfo((prev) => ({
                              ...prev,
                              fiscalYear: value.toString(),
                            }))
                          }
                          required
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              {/* Territory Details */}
              <Accordion
                expanded={expandedSections.has("territory")}
                onChange={() => toggleSection("territory")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "Territory Details",
                    <AccountBalance color="primary" />
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 2,
                        }}
                      >
                        <InlineEditField
                          label="Region"
                          value={territoryDetails.region}
                          onSave={(value) =>
                            setTerritoryDetails((prev) => ({
                              ...prev,
                              region: value.toString(),
                            }))
                          }
                        />
                        <InlineEditField
                          label="Currency"
                          value={territoryDetails.currency}
                          onSave={(value) =>
                            setTerritoryDetails((prev) => ({
                              ...prev,
                              currency: value.toString(),
                            }))
                          }
                        />
                        <InlineEditField
                          label="Tax Rate"
                          type="number"
                          value={territoryDetails.taxRate}
                          onSave={(value) =>
                            setTerritoryDetails((prev) => ({
                              ...prev,
                              taxRate: Number(value),
                            }))
                          }
                          suffix="%"
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
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 2,
                        }}
                      >
                        <InlineEditField
                          label="Period"
                          value={calendarInfo.period}
                          onSave={(value) =>
                            setCalendarInfo((prev) => ({
                              ...prev,
                              period: value.toString(),
                            }))
                          }
                        />
                        <InlineEditField
                          label="Quarter"
                          value={calendarInfo.quarter}
                          onSave={(value) =>
                            setCalendarInfo((prev) => ({
                              ...prev,
                              quarter: value.toString(),
                            }))
                          }
                        />
                        <InlineEditField
                          label="Fiscal Year"
                          value={calendarInfo.fiscalYear}
                          onSave={(value) =>
                            setCalendarInfo((prev) => ({
                              ...prev,
                              fiscalYear: value.toString(),
                            }))
                          }
                        />
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Info color="info" />
                          <Typography variant="body2">
                            {calendarInfo.daysRemaining} days remaining in
                            period
                          </Typography>
                        </Box>
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
                    chartOfAccounts.accounts.length
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Balance</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chartOfAccounts.accounts.map((account, _) => (
                          <TableRow key={account.code} className="hover-lift">
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "monospace" }}
                              >
                                {account.code}
                              </Typography>
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={account.type}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontFamily: "monospace" }}
                            >
                              ${account.balance.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={account.isActive ? "Active" : "Inactive"}
                                size="small"
                                color={account.isActive ? "success" : "default"}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* General Ledger Entries */}
              <Accordion
                expanded={expandedSections.has("transactions")}
                onChange={() => toggleSection("transactions")}
                className="slide-in"
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  {renderSectionHeader(
                    "General Ledger Entries",
                    <Receipt color="primary" />,
                    transactions.length
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              selectedTransactions.size === transactions.length
                            }
                            indeterminate={
                              selectedTransactions.size > 0 &&
                              selectedTransactions.size < transactions.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        }
                        label="Select All"
                      />
                      {selectedTransactions.size > 0 && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">
                            {selectedTransactions.size} selected
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) =>
                              setBulkActionAnchor(e.currentTarget)
                            }
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total: {totals.count} transactions
                      </Typography>
                      <Chip
                        icon={<Balance />}
                        label={`Difference: $${Math.abs(
                          totals.totalDebit - totals.totalCredit
                        ).toFixed(2)}`}
                        color={totals.isBalanced ? "success" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={
                                selectedTransactions.size ===
                                transactions.length
                              }
                              indeterminate={
                                selectedTransactions.size > 0 &&
                                selectedTransactions.size < transactions.length
                              }
                              onChange={(e) =>
                                handleSelectAll(e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Date</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>
                            Description
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Account</TableCell>
                          <TableCell align="right" sx={{ minWidth: 100 }}>
                            Debit
                          </TableCell>
                          <TableCell align="right" sx={{ minWidth: 100 }}>
                            Credit
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            Reference
                          </TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className={`hover-lift ${
                              validationErrors[transaction.id]
                                ? "error-shake"
                                : ""
                            }`}
                            sx={{
                              backgroundColor: validationErrors[transaction.id]
                                ? "rgba(244, 67, 54, 0.04)"
                                : "transparent",
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedTransactions.has(
                                  transaction.id
                                )}
                                onChange={(e) =>
                                  handleSelectTransaction(
                                    transaction.id,
                                    e.target.checked
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                value={transaction.date}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "date",
                                    value
                                  )
                                }
                                type="text"
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                value={transaction.description}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "description",
                                    value
                                  )
                                }
                                required
                                validation={(value) =>
                                  !value.toString().trim()
                                    ? "Description is required"
                                    : null
                                }
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                value={transaction.account}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "account",
                                    value
                                  )
                                }
                                required
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <InlineEditField
                                value={transaction.debit}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "debit",
                                    value
                                  )
                                }
                                type="currency"
                                validation={(value) =>
                                  Number(value) < 0
                                    ? "Cannot be negative"
                                    : null
                                }
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <InlineEditField
                                value={transaction.credit}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "credit",
                                    value
                                  )
                                }
                                type="currency"
                                validation={(value) =>
                                  Number(value) < 0
                                    ? "Cannot be negative"
                                    : null
                                }
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell>
                              <InlineEditField
                                value={transaction.reference || ""}
                                onSave={(value) =>
                                  handleTransactionUpdate(
                                    transaction.id,
                                    "reference",
                                    value
                                  )
                                }
                                size="small"
                                fullWidth={false}
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {transaction.isModified && (
                                  <Chip
                                    label="Modified"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                                {transaction.isValidated && (
                                  <Chip
                                    label="Validated"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                                {validationErrors[transaction.id] && (
                                  <Tooltip
                                    title={validationErrors[
                                      transaction.id
                                    ].join(", ")}
                                  >
                                    <Chip
                                      label="Error"
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                  !totals.isBalanced ||
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
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Summary of Changes</AlertTitle>
            You are about to save {totals.count} transactions to the database.
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              • Total Debit: ${totals.totalDebit.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              • Total Credit: ${totals.totalCredit.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              • Balance Status:{" "}
              {totals.isBalanced ? "Balanced ✓" : "Unbalanced ✗"}
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
            color="primary"
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <LoadingSpinner type="circular" size="small" />
              ) : undefined
            }
          >
            {isProcessing ? "Processing..." : "Confirm Save"}
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
