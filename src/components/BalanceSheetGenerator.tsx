import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Drawer,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  Fade,
  Backdrop,
  Modal,
  Slider,
  ButtonGroup,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAuth } from "../context/AuthContext";
import {
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as ReportIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
  ZoomIn as DrillDownIcon,
  BarChart as ChartIcon,
  CompareArrows as CompareIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { format, startOfYear, endOfYear, subYears } from "date-fns";
import { supabaseAccountingService } from "../services/supabaseAccountingService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Interfaces
interface Company {
  company_id: number;
  company_name: string;
  address?: string;
  city?: string;
  state?: string;
}

interface BalanceSheetData {
  account_key: number;
  report: string;
  class: string;
  subclass: string;
  subclass2: string;
  account: string;
  subaccount: string;
  [key: string]: string | number;
}

interface BalanceSheetSection {
  title: string;
  accounts: BalanceSheetData[];
  total: number;
}

interface TransactionDetail {
  transaction_id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
}

interface ReportConfiguration {
  id: string;
  name: string;
  company_id: string;
  date_range: { start: Date; end: Date };
  years: number[];
  settings: {
    currency: string;
    numberFormat: string;
    showZeroBalances: boolean;
    customGroupings: { [key: string]: string[] };
    sectionOrder: string[];
  };
  is_favorite: boolean;
  created_at: Date;
}

interface FinancialRatio {
  name: string;
  value: number;
  formula: string;
  benchmark?: number;
  trend: "up" | "down" | "stable";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const BalanceSheetGenerator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { isAuthenticated, initialLoading } = useAuth();

  // Core state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedCountry, setSelectedCountry] =
    useState<string>("All Countries");
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    startOfYear(new Date())
  );
  const [endDate, setEndDate] = useState<Date | null>(endOfYear(new Date()));
  const [selectedYears, setSelectedYears] = useState<number[]>([
    new Date().getFullYear(),
  ]);
  const [showZeroBalances, setShowZeroBalances] = useState<boolean>(false);
  const [currencyFormat, setCurrencyFormat] = useState<string>("USD");
  const [numberFormat, setNumberFormat] = useState<string>("thousands");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData[]>(
    []
  );

  // Enhanced features state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [drillDownOpen, setDrillDownOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] =
    useState<BalanceSheetData | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<
    TransactionDetail[]
  >([]);
  const [savedConfigurations, setSavedConfigurations] = useState<
    ReportConfiguration[]
  >([]);
  const [configurationDialogOpen, setConfigurationDialogOpen] =
    useState<boolean>(false);
  const [analyticsOpen, setAnalyticsOpen] = useState<boolean>(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [ratios, setRatios] = useState<FinancialRatio[]>([]);
  const [customGroupings, setCustomGroupings] = useState<{
    [key: string]: string[];
  }>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "Assets",
    "Liabilities",
    "Equity",
  ]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Generate summary data for charts
  const generateSummaryData = (data: BalanceSheetData[]) => {
    const summary: any[] = [];
    const classTotals: { [key: string]: number } = {};

    data.forEach((item) => {
      const firstYear = selectedYears[0];
      if (firstYear && item[firstYear.toString()]) {
        const value =
          typeof item[firstYear.toString()] === "string"
            ? parseFloat(item[firstYear.toString()].replace(/,/g, ""))
            : item[firstYear.toString()];

        if (!classTotals[item.class]) {
          classTotals[item.class] = 0;
        }
        classTotals[item.class] += value || 0;
      }
    });

    Object.entries(classTotals).forEach(([className, total]) => {
      summary.push({
        name: className,
        value: total,
        percentage: 0, // Will be calculated later if needed
      });
    });

    return summary;
  };

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      loadCompanies();
      loadSavedConfigurations();
      loadAvailableYears();
      loadAvailableCountries();
    }
  }, [isAuthenticated, initialLoading]);

  const loadAvailableCountries = async () => {
    try {
      const { countries, error } =
        await supabaseAccountingService.getAvailableCountries();
      if (error) {
        console.error("Failed to load available countries:", error);
        setAvailableCountries(["All Countries"]);
      } else if (countries) {
        setAvailableCountries(["All Countries", ...countries]);
      }
    } catch (err) {
      console.error("Failed to load available countries:", err);
      setAvailableCountries(["All Countries"]);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const { years, error } =
        await supabaseAccountingService.getAvailableYears();
      if (error) {
        console.error("Failed to load available years:", error);
        // Fallback to default years if database query fails
        setAvailableYears(Array.from({ length: 11 }, (_, i) => 2020 + i));
      } else if (years) {
        setAvailableYears(years);
        // Set default selected years to the last 3 available years
        if (years.length > 0) {
          const defaultYears = years.slice(-3);
          setSelectedYears(defaultYears);
        }
      }
    } catch (err) {
      console.error("Failed to load available years:", err);
      // Fallback to default years
      setAvailableYears(Array.from({ length: 11 }, (_, i) => 2020 + i));
    }
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { companies, error } =
        await supabaseAccountingService.getCompanies();
      if (error) {
        console.error('BalanceSheetGenerator: Failed to load companies:', error);
        setError(`Failed to load companies: ${error}`);
      } else {
        setCompanies(companies || []);
        if (companies && companies.length > 0) {
          setSelectedCompany(companies[0].company_id.toString());
        }
      }
    } catch (error) {
      console.error('BalanceSheetGenerator: Exception loading companies:', error);
      setError(`Failed to load companies: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedConfigurations = async () => {
    // Mock implementation - would connect to database
    const mockConfigs: ReportConfiguration[] = [
      {
        id: "1",
        name: "Standard Balance Sheet",
        company_id: "1",
        date_range: {
          start: startOfYear(new Date()),
          end: endOfYear(new Date()),
        },
        years: [2024],
        settings: {
          currency: "USD",
          numberFormat: "thousands",
          showZeroBalances: false,
          customGroupings: {},
          sectionOrder: ["Assets", "Liabilities", "Equity"],
        },
        is_favorite: true,
        created_at: new Date(),
      },
    ];
    setSavedConfigurations(mockConfigs);
  };

  const handleDrillDown = async (account: BalanceSheetData) => {
    setSelectedAccount(account);
    setLoading(true);

    try {
      const companyName =
        companies.find((c) => c.company_id.toString() === selectedCompany)
          ?.company_name || "";
      const year = selectedYears[0]; // Use the first selected year for drill-down

      const { data, error } =
        await supabaseAccountingService.getTransactionDetails(
          companyName,
          account.account_key,
          year
        );

      if (error) {
        setError(`Failed to load transaction details: ${error}`);
      } else if (data) {
        setTransactionDetails(data);
        setDrillDownOpen(true);
      }
    } catch (err) {
      setError("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  const generateTrendAnalysis = () => {
    // Mock trend data generation for balance sheet
    const mockTrendData = selectedYears.map((year) => ({
      year,
      totalAssets: Math.random() * 2000000 + 1000000,
      totalLiabilities: Math.random() * 1200000 + 600000,
      totalEquity: Math.random() * 800000 + 400000,
    }));

    setTrendData(mockTrendData);
  };

  const calculateRatios = () => {
    // Mock ratio calculations for balance sheet
    const mockRatios: FinancialRatio[] = [
      {
        name: "Current Ratio",
        value: 2.5,
        formula: "Current Assets / Current Liabilities",
        benchmark: 2.0,
        trend: "up",
      },
      {
        name: "Debt-to-Equity Ratio",
        value: 0.6,
        formula: "Total Debt / Total Equity",
        benchmark: 0.5,
        trend: "down",
      },
      {
        name: "Asset Turnover",
        value: 1.2,
        formula: "Revenue / Total Assets",
        benchmark: 1.0,
        trend: "stable",
      },
    ];

    setRatios(mockRatios);
  };

  const saveConfiguration = async (name: string) => {
    const newConfig: ReportConfiguration = {
      id: Date.now().toString(),
      name,
      company_id: selectedCompany,
      date_range: { start: startDate!, end: endDate! },
      years: selectedYears,
      settings: {
        currency: currencyFormat,
        numberFormat,
        showZeroBalances,
        customGroupings,
        sectionOrder,
      },
      is_favorite: false,
      created_at: new Date(),
    };

    setSavedConfigurations((prev) => [...prev, newConfig]);
    setConfigurationDialogOpen(false);
  };

  const loadConfiguration = (config: ReportConfiguration) => {
    setSelectedCompany(config.company_id);
    setStartDate(config.date_range.start);
    setEndDate(config.date_range.end);
    setSelectedYears(config.years);
    setCurrencyFormat(config.settings.currency);
    setNumberFormat(config.settings.numberFormat);
    setShowZeroBalances(config.settings.showZeroBalances);
    setCustomGroupings(config.settings.customGroupings);
    setSectionOrder(config.settings.sectionOrder);
  };

  const generateBalanceSheet = async () => {
    if (!selectedCompany || selectedYears.length === 0) {
      setError("Please select a company and at least one year");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const startYear = Math.min(...selectedYears);
      const endYear = Math.max(...selectedYears);

      const result = await supabaseAccountingService.generateBalanceSheet(
        selectedCompany,
        startYear,
        endYear,
        selectedCountry === "All Countries" ? undefined : selectedCountry
      );

      if (result.error) {
        setError(result.error);
        setBalanceSheetData([]);
      } else {
        setBalanceSheetData(result.data || []);

        // Generate summary data for charts
        if (result.data && result.data.length > 0) {
          const summaryData = generateSummaryData(result.data);
          setSummaryData(summaryData);
        }
      }
    } catch (err) {
      setError("Failed to generate balance sheet: " + (err as Error).message);
      setBalanceSheetData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedYears(typeof value === "string" ? [] : (value as number[]));
  };

  const formatNumber = (value: number): string => {
    if (numberFormat === "thousands") {
      return (
        (value / 1000).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }) + "K"
      );
    } else if (numberFormat === "millions") {
      return (
        (value / 1000000).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) + "M"
      );
    }
    return value.toLocaleString();
  };

  const formatCurrency = (value: number): string => {
    const formatted = formatNumber(value);
    return `${
      currencyFormat === "USD" ? "$" : currencyFormat === "EUR" ? "€" : "£"
    }${formatted}`;
  };

  const groupBalanceSheetData = (): BalanceSheetSection[] => {
    const sections: { [key: string]: BalanceSheetSection } = {};

    balanceSheetData.forEach((item) => {
      const sectionKey = item.class;

      if (!sections[sectionKey]) {
        sections[sectionKey] = {
          title: sectionKey,
          accounts: [],
          total: 0,
        };
      }

      sections[sectionKey].accounts.push(item);

      // Calculate total for the first selected year
      const firstYear = selectedYears[0];
      if (firstYear && item[firstYear.toString()]) {
        // Parse the formatted number string back to number for calculations
        const value =
          typeof item[firstYear.toString()] === "string"
            ? parseFloat(item[firstYear.toString()].replace(/,/g, ""))
            : item[firstYear.toString()];
        sections[sectionKey].total += value || 0;
      }
    });

    return Object.values(sections).sort((a, b) => {
      const order = ["Assets", "Liabilities", "Equity"];
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
  };

  const exportToPDF = () => {
    // Mock PDF export functionality
    console.log("Exporting Balance Sheet to PDF...");
  };

  const exportToExcel = () => {
    // Mock Excel export functionality
    console.log("Exporting Balance Sheet to Excel...");
  };

  const printReport = () => {
    window.print();
  };

  const emailReport = () => {
    // Mock email functionality
    console.log("Emailing Balance Sheet...");
  };

  const sections = groupBalanceSheetData();
  const totalAssets = sections.find((s) => s.title === "Assets")?.total || 0;
  const totalLiabilities =
    sections.find((s) => s.title === "Liabilities")?.total || 0;
  const totalEquity = sections.find((s) => s.title === "Equity")?.total || 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {initialLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
      <Box sx={{ p: 3, maxWidth: "1400px", mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              <AccountIcon sx={{ mr: 2, fontSize: "2rem" }} />
              Balance Sheet Generator
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Generate comprehensive balance sheet reports with advanced
              analytics
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Analytics Dashboard">
              <IconButton
                color="primary"
                onClick={() => setAnalyticsOpen(true)}
                sx={{ bgcolor: "primary.50" }}
              >
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Saved Configurations">
              <IconButton
                color="primary"
                onClick={() => setConfigurationDialogOpen(true)}
                sx={{ bgcolor: "primary.50" }}
              >
                <BookmarkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton
                color="primary"
                onClick={() => setPreviewOpen(true)}
                sx={{ bgcolor: "primary.50" }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Configuration Panel */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{ p: 3, height: "fit-content", position: "sticky", top: 20 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <SettingsIcon sx={{ mr: 1 }} />
                Report Configuration
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    label="Company"
                  >
                    {companies.map((company) => (
                      <MenuItem
                        key={company.company_id}
                        value={company.company_id.toString()}
                      >
                        {company.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    label="Country"
                  >
                    {availableCountries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Years</InputLabel>
                  <Select
                    multiple
                    value={selectedYears}
                    onChange={handleYearChange}
                    input={<OutlinedInput label="Years" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        <Checkbox checked={selectedYears.indexOf(year) > -1} />
                        <ListItemText primary={year} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                        textField: { fullWidth: true, size: "small" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Display Options
              </Typography>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currencyFormat}
                  onChange={(e) => setCurrencyFormat(e.target.value)}
                  label="Currency"
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Number Format</InputLabel>
                <Select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  label="Number Format"
                >
                  <MenuItem value="actual">Actual</MenuItem>
                  <MenuItem value="thousands">Thousands (K)</MenuItem>
                  <MenuItem value="millions">Millions (M)</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showZeroBalances}
                    onChange={(e) => setShowZeroBalances(e.target.checked)}
                  />
                }
                label="Show Zero Balances"
                sx={{ mt: 1 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={generateBalanceSheet}
                disabled={loading || !selectedCompany}
                sx={{ mt: 3, py: 1.5 }}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <ReportIcon />
                }
              >
                {loading ? "Generating..." : "Generate Balance Sheet"}
              </Button>
            </Paper>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} lg={8}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {balanceSheetData.length > 0 && (
              <Paper sx={{ p: 3 }}>
                {/* Report Header */}
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <Typography variant="h5" gutterBottom>
                    {
                      companies.find(
                        (c) => c.company_id.toString() === selectedCompany
                      )?.company_name
                    }
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Balance Sheet
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    As of{" "}
                    {endDate
                      ? format(endDate, "MMMM dd, yyyy")
                      : "Current Date"}
                  </Typography>
                </Box>

                {/* Export Actions */}
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <ButtonGroup variant="outlined" size="small">
                    <Button startIcon={<PdfIcon />} onClick={exportToPDF}>
                      PDF
                    </Button>
                    <Button startIcon={<ExcelIcon />} onClick={exportToExcel}>
                      Excel
                    </Button>
                    <Button startIcon={<PrintIcon />} onClick={printReport}>
                      Print
                    </Button>
                    <Button startIcon={<EmailIcon />} onClick={emailReport}>
                      Email
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* Balance Sheet Table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                          Account
                        </TableCell>
                        {selectedYears.map((year) => (
                          <TableCell
                            key={year}
                            align="right"
                            sx={{ fontWeight: "bold" }}
                          >
                            {year}
                          </TableCell>
                        ))}
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", width: "80px" }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sections.map((section) => (
                        <React.Fragment key={section.title}>
                          {/* Section Header */}
                          <TableRow sx={{ bgcolor: "primary.50" }}>
                            <TableCell
                              colSpan={selectedYears.length + 2}
                              sx={{
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                color: "primary.main",
                                py: 2,
                              }}
                            >
                              {section.title.toUpperCase()}
                            </TableCell>
                          </TableRow>

                          {/* Section Accounts */}
                          {section.accounts
                            .filter(
                              (account) =>
                                showZeroBalances ||
                                selectedYears.some((year) => {
                                  const value =
                                    typeof account[year.toString()] === "string"
                                      ? parseFloat(
                                          account[year.toString()].replace(
                                            /,/g,
                                            ""
                                          )
                                        )
                                      : account[year.toString()];
                                  return value !== 0;
                                })
                            )
                            .map((account) => (
                              <TableRow
                                key={`${account.class}-${account.account}-${account.subaccount}`}
                                hover
                                sx={{
                                  "&:hover": {
                                    bgcolor: "action.hover",
                                    cursor: "pointer",
                                  },
                                }}
                              >
                                <TableCell sx={{ pl: 4 }}>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {account.account}
                                    </Typography>
                                    {account.subaccount &&
                                      account.subaccount !==
                                        account.account && (
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                        >
                                          {account.subaccount}
                                        </Typography>
                                      )}
                                  </Box>
                                </TableCell>
                                {selectedYears.map((year) => (
                                  <TableCell key={year} align="right">
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontFamily: "monospace",
                                        color: (() => {
                                          const value =
                                            typeof account[year.toString()] ===
                                            "string"
                                              ? parseFloat(
                                                  account[
                                                    year.toString()
                                                  ].replace(/,/g, "")
                                                )
                                              : account[year.toString()];
                                          return value < 0
                                            ? "error.main"
                                            : "inherit";
                                        })(),
                                      }}
                                    >
                                      {account[year.toString()] || "0"}
                                    </Typography>
                                  </TableCell>
                                ))}
                                <TableCell align="center">
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDrillDown(account)}
                                    >
                                      <DrillDownIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}

                          {/* Section Total */}
                          <TableRow sx={{ bgcolor: "grey.100" }}>
                            <TableCell sx={{ fontWeight: "bold", pl: 2 }}>
                              Total {section.title}
                            </TableCell>
                            {selectedYears.map((year) => {
                              const total = section.accounts.reduce(
                                (sum, account) => {
                                  const value =
                                    typeof account[year.toString()] === "string"
                                      ? parseFloat(
                                          account[year.toString()].replace(
                                            /,/g,
                                            ""
                                          )
                                        )
                                      : account[year.toString()];
                                  return sum + (value || 0);
                                },
                                0
                              );
                              return (
                                <TableCell
                                  key={year}
                                  align="right"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: "monospace",
                                      fontWeight: "bold",
                                      color:
                                        total < 0 ? "error.main" : "inherit",
                                    }}
                                  >
                                    {new Intl.NumberFormat("en-US").format(
                                      Math.round(total)
                                    )}
                                  </Typography>
                                </TableCell>
                              );
                            })}
                            <TableCell />
                          </TableRow>
                        </React.Fragment>
                      ))}

                      {/* Balance Check */}
                      <TableRow
                        sx={{
                          bgcolor: "success.50",
                          borderTop: "2px solid",
                          borderColor: "success.main",
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                        >
                          TOTAL LIABILITIES & EQUITY
                        </TableCell>
                        {selectedYears.map((year) => {
                          const liabilitiesTotal =
                            sections
                              .find((s) => s.title === "Liabilities")
                              ?.accounts.reduce((sum, account) => {
                                const value =
                                  typeof account[year.toString()] === "string"
                                    ? parseFloat(
                                        account[year.toString()].replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                    : account[year.toString()];
                                return sum + (value || 0);
                              }, 0) || 0;
                          const equityTotal =
                            sections
                              .find((s) => s.title === "Equity")
                              ?.accounts.reduce((sum, account) => {
                                const value =
                                  typeof account[year.toString()] === "string"
                                    ? parseFloat(
                                        account[year.toString()].replace(
                                          /,/g,
                                          ""
                                        )
                                      )
                                    : account[year.toString()];
                                return sum + (value || 0);
                              }, 0) || 0;
                          const totalLiabilitiesEquity =
                            liabilitiesTotal + equityTotal;
                          return (
                            <TableCell
                              key={year}
                              align="right"
                              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: "bold",
                                  color: "success.main",
                                }}
                              >
                                {new Intl.NumberFormat("en-US").format(
                                  Math.round(totalLiabilitiesEquity)
                                )}
                              </Typography>
                            </TableCell>
                          );
                        })}
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Balance Verification */}
                <Box sx={{ mt: 3, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="info.main"
                    gutterBottom
                  >
                    Balance Verification
                  </Typography>
                  {selectedYears.map((year) => {
                    const assets =
                      sections
                        .find((s) => s.title === "Assets")
                        ?.accounts.reduce((sum, account) => {
                          const value =
                            typeof account[year.toString()] === "string"
                              ? parseFloat(
                                  account[year.toString()].replace(/,/g, "")
                                )
                              : account[year.toString()];
                          return sum + (value || 0);
                        }, 0) || 0;
                    const liabilities =
                      sections
                        .find((s) => s.title === "Liabilities")
                        ?.accounts.reduce((sum, account) => {
                          const value =
                            typeof account[year.toString()] === "string"
                              ? parseFloat(
                                  account[year.toString()].replace(/,/g, "")
                                )
                              : account[year.toString()];
                          return sum + (value || 0);
                        }, 0) || 0;
                    const equity =
                      sections
                        .find((s) => s.title === "Equity")
                        ?.accounts.reduce((sum, account) => {
                          const value =
                            typeof account[year.toString()] === "string"
                              ? parseFloat(
                                  account[year.toString()].replace(/,/g, "")
                                )
                              : account[year.toString()];
                          return sum + (value || 0);
                        }, 0) || 0;
                    const liabilitiesEquity = liabilities + equity;
                    const isBalanced =
                      Math.abs(assets - liabilitiesEquity) < 0.01;

                    return (
                      <Typography
                        key={year}
                        variant="body2"
                        sx={{
                          color: isBalanced ? "success.main" : "error.main",
                        }}
                      >
                        {year}: Assets (
                        {new Intl.NumberFormat("en-US").format(
                          Math.round(assets)
                        )}
                        ) = Liabilities + Equity (
                        {new Intl.NumberFormat("en-US").format(
                          Math.round(liabilitiesEquity)
                        )}
                        ){isBalanced ? " ✓" : " ✗"}
                      </Typography>
                    );
                  })}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Drill Down Dialog */}
        <Dialog
          open={drillDownOpen}
          onClose={() => setDrillDownOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details - {selectedAccount?.account}
          </DialogTitle>
          <DialogContent>
            {transactionDetails.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionDetails.map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No transaction details available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrillDownOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
      )}
    </LocalizationProvider>
  );
};

export default BalanceSheetGenerator;