import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Treemap,
} from 'recharts';
import { TrendingUp, TrendingDown, AccountBalance, Receipt, Analytics } from '@mui/icons-material';
import LoadingSpinner from './LoadingSpinner';
import { realApi, ChartData, FinancialSummary, MonthlyAnalysis, AccountBalance as AccountBalanceType } from '../services/realApi';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

interface LiveDataDashboardProps {
  companyId?: number;
}

const LiveDataDashboard: React.FC<LiveDataDashboardProps> = ({ companyId = 1 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  
  // Data states
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalysis[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalanceType[]>([]);
  const [accountSummary, setAccountSummary] = useState<any[]>([]);
  const [territorySummary, setTerritorySummary] = useState<any[]>([]);
  const [transactionTypeSummary, setTransactionTypeSummary] = useState<any[]>([]);

  // Chart data states
  const [barChartData, setBarChartData] = useState<ChartData[]>([]);
  const [lineChartData, setLineChartData] = useState<ChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<ChartData[]>([]);
  const [areaChartData, setAreaChartData] = useState<ChartData[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [treemapData, setTreemapData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [companyId]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if backend is available
      const isBackendAvailable = await realApi.checkBackendHealth();
      setBackendAvailable(isBackendAvailable);

      if (!isBackendAvailable) {
        setError('Backend is not available. Please ensure the Django server is running on http://localhost:8000');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [
        summaryData,
        monthlyAnalysisData,
        accountBalancesData,
        accountSummaryData,
        territorySummaryData,
        transactionTypeSummaryData,
      ] = await Promise.all([
        realApi.getGeneralLedgerSummary(companyId),
        realApi.getMonthlyAnalysis(companyId),
        realApi.getAccountBalances(companyId),
        realApi.getSummaryByAccount(companyId),
        realApi.getSummaryByTerritory(companyId),
        realApi.getSummaryByTransactionType(companyId),
      ]);

      // Set raw data
      setSummary(summaryData);
      setMonthlyData(monthlyAnalysisData);
      setAccountBalances(accountBalancesData);
      setAccountSummary(accountSummaryData);
      setTerritorySummary(territorySummaryData);
      setTransactionTypeSummary(transactionTypeSummaryData);

      // Transform data for charts
      setBarChartData(realApi.transformToBarChartData(monthlyAnalysisData));
      setLineChartData(realApi.transformToLineChartData(monthlyAnalysisData));
      setPieChartData(realApi.transformToPieChartData(summaryData.by_account_class));
      setAreaChartData(realApi.transformToAreaChartData(monthlyAnalysisData));
      setScatterData(realApi.transformToScatterData(accountBalancesData));
      setTreemapData(realApi.transformToTreemapData(summaryData.by_account_class));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner type="gradient" size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">Error Loading Dashboard</Typography>
        <Typography>{error}</Typography>
        {!backendAvailable && (
          <Box mt={2}>
            <Typography variant="body2">
              To fix this issue:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1 }}>
              <li>Ensure the Django backend server is running</li>
              <li>Check that the server is accessible at http://localhost:8000</li>
              <li>Verify the database contains some sample data</li>
            </Typography>
          </Box>
        )}
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography>No financial data available. Please add some transactions to see the dashboard.</Typography>
      </Alert>
    );
  }

  const kpis = realApi.calculateKPIs(summary);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Live Financial Dashboard
      </Typography>
      
      <Chip 
        label={`Connected to Database (${summary.total_entries} transactions)`} 
        color="success" 
        icon={<AccountBalance />}
        sx={{ mb: 3 }}
      />

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Amount
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(summary.total_amount)}
                  </Typography>
                </Box>
                <Analytics color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h5">
                    {formatNumber(summary.total_entries)}
                  </Typography>
                </Box>
                <Receipt color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Transaction
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(summary.average_amount)}
                  </Typography>
                </Box>
                <TrendingUp color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Largest Transaction
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(summary.largest_transaction)}
                  </Typography>
                </Box>
                <TrendingUp color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Bar Chart - Monthly Amounts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Monthly Transaction Amounts" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  <Bar dataKey="value" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart - Monthly Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Monthly Transaction Trends" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  <Line type="monotone" dataKey="value" stroke={COLORS[1]} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart - Account Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Amount by Account Class" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Area Chart - Debits vs Credits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Monthly Debits vs Credits" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Area type="monotone" dataKey="debits" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} />
                  <Area type="monotone" dataKey="credits" stackId="1" stroke={COLORS[3]} fill={COLORS[3]} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Scatter Chart - Account Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Account Debits vs Credits Analysis" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Debits"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Credits"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  />
                  <Scatter name="Accounts" data={scatterData} fill={COLORS[4]} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Transaction Type Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={realApi.transformToPieChartData(transactionTypeSummary)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionTypeSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Statistics */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Database Summary" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Total Debits
              </Typography>
              <Typography variant="h6">
                {formatCurrency(summary.total_debits)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Total Credits
              </Typography>
              <Typography variant="h6">
                {formatCurrency(summary.total_credits)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Account Classes
              </Typography>
              <Typography variant="h6">
                {summary.by_account_class.length}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                Transaction Types
              </Typography>
              <Typography variant="h6">
                {summary.by_transaction_type.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LiveDataDashboard;