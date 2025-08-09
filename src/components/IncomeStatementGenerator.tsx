import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
} from '@mui/icons-material';
import { format, startOfYear, endOfYear, subYears } from 'date-fns';
import { supabaseAccountingService } from '../services/supabaseAccountingService';
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
} from 'recharts';

// Interfaces
interface Company {
  company_id: number;
  company_name: string;
  address?: string;
  city?: string;
  state?: string;
}

interface IncomeStatementData {
  account_key: string;
  report: string;
  class: string;
  account: string;
  [key: string]: string | number;
}

interface IncomeStatementSection {
  title: string;
  accounts: IncomeStatementData[];
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
  trend: 'up' | 'down' | 'stable';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const IncomeStatementGenerator: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Core state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(startOfYear(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfYear(new Date()));
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()]);
  const [showZeroBalances, setShowZeroBalances] = useState<boolean>(false);
  const [currencyFormat, setCurrencyFormat] = useState<string>('USD');
  const [numberFormat, setNumberFormat] = useState<string>('thousands');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [incomeStatementData, setIncomeStatementData] = useState<IncomeStatementData[]>([]);

  // Enhanced features state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [drillDownOpen, setDrillDownOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<IncomeStatementData | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetail[]>([]);
  const [savedConfigurations, setSavedConfigurations] = useState<ReportConfiguration[]>([]);
  const [configurationDialogOpen, setConfigurationDialogOpen] = useState<boolean>(false);
  const [analyticsOpen, setAnalyticsOpen] = useState<boolean>(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [ratios, setRatios] = useState<FinancialRatio[]>([]);
  const [customGroupings, setCustomGroupings] = useState<{ [key: string]: string[] }>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(['Revenue', 'Cost of Goods Sold', 'Operating Expenses', 'Other Income/Expenses']);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    loadCompanies();
    loadSavedConfigurations();
    loadAvailableYears();
    loadAvailableCountries();
  }, []);

  const loadAvailableCountries = async () => {
    try {
      const { countries, error } = await supabaseAccountingService.getAvailableCountries();
      if (error) {
        console.error('Failed to load available countries:', error);
        setAvailableCountries(['All Countries']);
      } else if (countries) {
        setAvailableCountries(['All Countries', ...countries]);
      }
    } catch (err) {
      console.error('Failed to load available countries:', err);
      setAvailableCountries(['All Countries']);
    }
  };

  const loadAvailableYears = async () => {
    try {
      const { years, error } = await supabaseAccountingService.getAvailableYears();
      if (error) {
        console.error('Failed to load available years:', error);
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
      console.error('Failed to load available years:', err);
      // Fallback to default years
      setAvailableYears(Array.from({ length: 11 }, (_, i) => 2020 + i));
    }
  };

  const loadCompanies = async () => {
    try {
      const { companies, error } = await supabaseAccountingService.getCompanies();
      if (error) {
        setError(`Failed to load companies: ${error}`);
      } else if (companies) {
        setCompanies(companies);
      }
    } catch (err) {
      setError('Failed to load companies');
    }
  };

  const loadSavedConfigurations = async () => {
    // Mock implementation - would connect to database
    const mockConfigs: ReportConfiguration[] = [
      {
        id: '1',
        name: 'Monthly Standard Report',
        company_id: '1',
        date_range: { start: startOfYear(new Date()), end: endOfYear(new Date()) },
        years: [2024],
        settings: {
          currency: 'USD',
          numberFormat: 'thousands',
          showZeroBalances: false,
          customGroupings: {},
          sectionOrder: ['Revenue', 'Cost of Goods Sold', 'Operating Expenses', 'Other Income/Expenses']
        },
        is_favorite: true,
        created_at: new Date()
      }
    ];
    setSavedConfigurations(mockConfigs);
  };

  const handleDrillDown = async (account: IncomeStatementData) => {
    setSelectedAccount(account);
    setLoading(true);
    
    try {
      const companyName = companies.find(c => c.company_id.toString() === selectedCompany)?.company_name || '';
      const year = selectedYears[0]; // Use the first selected year for drill-down
      
      const { data, error } = await supabaseAccountingService.getTransactionDetails(
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
      setError('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const generateTrendAnalysis = () => {
    // Mock trend data generation
    const mockTrendData = selectedYears.map(year => ({
      year,
      revenue: Math.random() * 1000000 + 500000,
      expenses: Math.random() * 800000 + 400000,
      netIncome: Math.random() * 200000 + 100000
    }));
    
    setTrendData(mockTrendData);
  };

  const calculateRatios = () => {
    // Mock ratio calculations
    const mockRatios: FinancialRatio[] = [
      {
        name: 'Gross Profit Margin',
        value: 0.35,
        formula: '(Revenue - COGS) / Revenue',
        benchmark: 0.30,
        trend: 'up'
      },
      {
        name: 'Operating Margin',
        value: 0.15,
        formula: 'Operating Income / Revenue',
        benchmark: 0.12,
        trend: 'up'
      },
      {
        name: 'Net Profit Margin',
        value: 0.08,
        formula: 'Net Income / Revenue',
        benchmark: 0.05,
        trend: 'stable'
      }
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
        sectionOrder
      },
      is_favorite: false,
      created_at: new Date()
    };
    
    setSavedConfigurations(prev => [...prev, newConfig]);
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

  const generateIncomeStatement = async () => {
    if (!selectedCompany || !startDate || !endDate) {
      setError('Please select a company and date range');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const companyName = companies.find(c => c.company_id.toString() === selectedCompany)?.company_name || '';
      const { data, error } = await supabaseAccountingService.generateIncomeStatement(
        companyName,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        selectedYears,
        selectedCountry
      );

      if (error) {
        setError(`Failed to generate income statement: ${error}`);
      } else if (data) {
        setIncomeStatementData(data);
        generateTrendAnalysis();
        calculateRatios();
        setPreviewOpen(true);
      }
    } catch (err) {
      setError('Failed to generate income statement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    const divisor = numberFormat === 'thousands' ? 1000 : 
                   numberFormat === 'millions' ? 1000000 : 1;
    
    const adjustedAmount = amount / divisor;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyFormat,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return formatter.format(adjustedAmount);
  };

  const organizeDataBySections = (): IncomeStatementSection[] => {
    const sections: { [key: string]: IncomeStatementData[] } = {};
    
    incomeStatementData.forEach(item => {
      if (!sections[item.class]) {
        sections[item.class] = [];
      }
      sections[item.class].push(item);
    });

    return sectionOrder.map(sectionTitle => ({
      title: sectionTitle,
      accounts: sections[sectionTitle] || [],
      total: (sections[sectionTitle] || []).reduce((sum, account) => {
        return sum + selectedYears.reduce((yearSum, year) => {
          const value = parseFloat(String(account[year]).replace(/,/g, '') || '0');
          return yearSum + value;
        }, 0);
      }, 0)
    }));
  };

  const renderMainReport = () => {
    const selectedCompanyInfo = companies.find(c => c.company_id.toString() === selectedCompany);
    const sections = organizeDataBySections();
    
    return (
      <Paper elevation={0} sx={{ p: 4, backgroundColor: 'background.paper', border: '2px solid #e0e0e0', borderRadius: 2 }}>
        <Box textAlign="center" mb={5}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {selectedCompanyInfo?.company_name || 'Company Name'}
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Income Statement
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            For the period {startDate && format(startDate, 'MMMM dd, yyyy')} to {endDate && format(endDate, 'MMMM dd, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (All amounts in {currencyFormat} {numberFormat === 'thousands' ? 'thousands' : numberFormat === 'millions' ? 'millions' : ''})
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Account</TableCell>
                {selectedYears.map(year => (
                  <TableCell key={year} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {year}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map((section, sectionIndex) => (
                <React.Fragment key={section.title}>
                  <TableRow>
                    <TableCell 
                      colSpan={selectedYears.length + 1}
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.2rem',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        color: theme.palette.text.primary,
                        py: 2
                      }}
                    >
                      {section.title}
                    </TableCell>
                  </TableRow>
                  
                  {section.accounts.map((account, accountIndex) => (
                    <TableRow 
                      key={account.account_key}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleDrillDown(account)}
                    >
                      <TableCell sx={{ pl: 4, display: 'flex', alignItems: 'center' }}>
                        {account.account}
                        <IconButton size="small" sx={{ ml: 1, opacity: 0.6 }}>
                          <DrillDownIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      {selectedYears.map(year => (
                        <TableCell key={year} align="right">
                          {formatCurrency(parseFloat(String(account[year]).replace(/,/g, '') || '0'))}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', pl: 2 }}>
                      Total {section.title}
                    </TableCell>
                    {selectedYears.map(year => {
                      const total = section.accounts.reduce((sum, account) => {
                        return sum + parseFloat(String(account[year]).replace(/,/g, '') || '0');
                      }, 0);
                      return (
                        <TableCell 
                          key={year} 
                          align="right"
                          sx={{ 
                            fontWeight: 'bold',
                            borderTop: '1px solid #e0e0e0'
                          }}
                        >
                          {formatCurrency(total)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={selectedYears.length + 1} sx={{ py: 1 }} />
                  </TableRow>
                </React.Fragment>
              ))}
              
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Net Income
                </TableCell>
                {selectedYears.map(year => {
                  const netIncome = sections.reduce((total, section) => {
                    const sectionTotal = section.accounts.reduce((sum, account) => {
                      return sum + parseFloat(String(account[year]).replace(/,/g, '') || '0');
                    }, 0);
                    return section.title === 'Revenue' || section.title === 'Other Income/Expenses' 
                      ? total + sectionTotal 
                      : total - sectionTotal;
                  }, 0);
                  
                  return (
                    <TableCell 
                      key={year} 
                      align="right"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        borderTop: `2px solid ${theme.palette.divider}`,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText
                      }}
                    >
                      {formatCurrency(netIncome)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderTrendAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Trend Analysis</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
          <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
          <Line type="monotone" dataKey="netIncome" stroke="#ffc658" name="Net Income" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderRatioAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Key Financial Ratios</Typography>
      <Grid container spacing={2}>
        {ratios.map((ratio, index) => (
          <Grid item xs={12} md={4} key={ratio.name}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">{ratio.name}</Typography>
                  <TrendingUpIcon 
                    color={ratio.trend === 'up' ? 'success' : ratio.trend === 'down' ? 'error' : 'action'} 
                  />
                </Box>
                <Typography variant="h4" color="primary">
                  {(ratio.value * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ratio.formula}
                </Typography>
                {ratio.benchmark && (
                  <Typography variant="caption" display="block">
                    Benchmark: {(ratio.benchmark * 100).toFixed(1)}%
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderVarianceAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Variance Analysis</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
          <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <ReportIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Advanced Income Statement Generator
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Saved Configurations">
              <IconButton onClick={() => setConfigurationDialogOpen(true)}>
                <Badge badgeContent={savedConfigurations.length} color="primary">
                  <BookmarkIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Analytics">
              <IconButton onClick={() => setAnalyticsOpen(true)}>
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Input Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Report Configuration</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value as string)}
                    label="Select Company"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.company_id} value={company.company_id.toString()}>
                        {company.company_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value as string)}
                    label="Select Country"
                  >
                    {availableCountries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Years to Display</InputLabel>
                  <Select
                    multiple
                    value={selectedYears}
                    onChange={(e) => setSelectedYears(e.target.value as number[])}
                    input={<OutlinedInput label="Years to Display" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setStartDate(new Date(currentYear, 0, 1));
                    setEndDate(new Date(currentYear, 11, 31));
                    setSelectedYears([currentYear]);
                  }}>
                    Current Year
                  </Button>
                  <Button onClick={() => {
                    const lastYear = new Date().getFullYear() - 1;
                    setStartDate(new Date(lastYear, 0, 1));
                    setEndDate(new Date(lastYear, 11, 31));
                    setSelectedYears([lastYear]);
                  }}>
                    Last Year
                  </Button>
                  <Button onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setSelectedYears([currentYear - 2, currentYear - 1, currentYear]);
                  }}>
                    3-Year Comparison
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Settings */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Advanced Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Currency Format</InputLabel>
                  <Select
                    value={currencyFormat}
                    onChange={(e) => setCurrencyFormat(e.target.value as string)}
                    label="Currency Format"
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Number Format</InputLabel>
                  <Select
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value as string)}
                    label="Number Format"
                  >
                    <MenuItem value="actual">Actual</MenuItem>
                    <MenuItem value="thousands">Thousands</MenuItem>
                    <MenuItem value="millions">Millions</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showZeroBalances}
                      onChange={(e) => setShowZeroBalances(e.target.checked)}
                    />
                  }
                  label="Show Zero Balances"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => setConfigurationDialogOpen(true)}
                  fullWidth
                >
                  Save Configuration
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Generate Button */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Button
            variant="contained"
            size="large"
            onClick={generateIncomeStatement}
            disabled={loading || !selectedCompany || !startDate || !endDate}
            startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Generating...' : 'Generate Advanced Income Statement'}
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Generated Report Display */}
        {incomeStatementData.length > 0 && !previewOpen && (
          <Box mt={3}>
            {renderMainReport()}
          </Box>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="xl"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Income Statement Preview</Typography>
              <Box>
                <Tooltip title="Export as PDF">
                  <IconButton onClick={() => alert('Exporting as PDF...')}>
                    <PdfIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as Excel">
                  <IconButton onClick={() => alert('Exporting as Excel...')}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton onClick={() => window.print()}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => setPreviewOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Financial Statement" />
              <Tab label="Trend Analysis" />
              <Tab label="Ratio Analysis" />
              <Tab label="Variance Analysis" />
            </Tabs>
            
            <Box mt={2}>
              {activeTab === 0 && renderMainReport()}
              {activeTab === 1 && renderTrendAnalysis()}
              {activeTab === 2 && renderRatioAnalysis()}
              {activeTab === 3 && renderVarianceAnalysis()}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Drill-down Dialog */}
        <Dialog
          open={drillDownOpen}
          onClose={() => setDrillDownOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <AccountIcon sx={{ mr: 1 }} />
              Transaction Details: {selectedAccount?.account}
            </Box>
          </DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionDetails.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrillDownOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog
          open={configurationDialogOpen}
          onClose={() => setConfigurationDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Saved Configurations</DialogTitle>
          <DialogContent>
            <List>
              {savedConfigurations.map((config) => (
                <ListItem key={config.id}>
                  <ListItemIcon>
                    <IconButton onClick={() => {
                      const updatedConfigs = savedConfigurations.map(c => 
                        c.id === config.id ? { ...c, is_favorite: !c.is_favorite } : c
                      );
                      setSavedConfigurations(updatedConfigs);
                    }}>
                      {config.is_favorite ? <StarIcon color="primary" /> : <StarBorderIcon />}
                    </IconButton>
                  </ListItemIcon>
                  <MuiListItemText
                    primary={config.name}
                    secondary={`${config.years.join(', ')} - ${config.settings.currency}`}
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      loadConfiguration(config);
                      setConfigurationDialogOpen(false);
                    }}
                  >
                    Load
                  </Button>
                </ListItem>
              ))}
            </List>
            <Box mt={2}>
              <TextField
                fullWidth
                label="Configuration Name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveConfiguration((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigurationDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={analyticsOpen}
          onClose={() => setAnalyticsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <AnalyticsIcon sx={{ mr: 1 }} />
              Financial Analytics Dashboard
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {renderTrendAnalysis()}
              </Grid>
              <Grid item xs={12}>
                {renderRatioAnalysis()}
              </Grid>
              <Grid item xs={12}>
                {renderVarianceAnalysis()}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAnalyticsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default IncomeStatementGenerator;