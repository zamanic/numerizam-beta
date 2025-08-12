import { useState, useEffect, useContext } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material'
import { 
  Check, 
  Close, 
  Person, 
  Business, 
  LocationOn, 
  Dashboard,
  PieChart,
  BarChart,
  TrendingUp,
  Group,
  Security,
  Analytics
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

import { useAuth } from '../context/AuthContext'
import { numerizamAuthService, NumerizamUser } from '../services/numerizamAuthService'
import { supabaseAccountingService } from '../services/supabaseAccountingService'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [pendingUsers, setPendingUsers] = useState<NumerizamUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<NumerizamUser | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [currentTab, setCurrentTab] = useState(0)
  
  // Revenue data state
  const [currentYearRevenue, setCurrentYearRevenue] = useState<number>(0)
  const [revenueGrowth, setRevenueGrowth] = useState<string>('N/A')
  const [revenueLoading, setRevenueLoading] = useState(true)

  // Sample data for charts
  const userStatsData = [
    { name: 'Active Users', value: 45, color: '#8884d8' },
    { name: 'Pending Approval', value: pendingUsers.length, color: '#82ca9d' },
    { name: 'Rejected', value: 8, color: '#ffc658' },
    { name: 'Inactive', value: 12, color: '#ff7c7c' }
  ]

  const monthlyRegistrations = [
    { month: 'Jan', registrations: 12, approvals: 10 },
    { month: 'Feb', registrations: 19, approvals: 15 },
    { month: 'Mar', registrations: 15, approvals: 12 },
    { month: 'Apr', registrations: 22, approvals: 18 },
    { month: 'May', registrations: 18, approvals: 16 },
    { month: 'Jun', registrations: 25, approvals: 20 }
  ]

  const systemActivity = [
    { time: '00:00', logins: 5, uploads: 2 },
    { time: '04:00', logins: 8, uploads: 4 },
    { time: '08:00', logins: 25, uploads: 15 },
    { time: '12:00', logins: 35, uploads: 22 },
    { time: '16:00', logins: 28, uploads: 18 },
    { time: '20:00', logins: 15, uploads: 8 }
  ]

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access denied. Admin privileges required.
        </Alert>
        <Typography variant="body1" color="textSecondary">
          You do not have permission to access this page.
        </Typography>
      </Box>
    )
  }

  useEffect(() => {
    loadPendingUsers()
    loadRevenueData()
  }, [])

  const loadPendingUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { users, error } = await numerizamAuthService.getAllUsers()
      if (error) {
        throw new Error(error)
      }
      // Filter for pending users (not approved)
      const pending = users.filter(user => !user.is_approved)
      setPendingUsers(pending)
    } catch (err) {
      setError(`Failed to load pending users: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRevenueData = async () => {
    setRevenueLoading(true);
    try {
      // Get current year revenue
      const currentRevenue = await supabaseAccountingService.getCurrentYearRevenue();
      setCurrentYearRevenue(currentRevenue);

      // Get revenue growth
      const { data: growthData, error: growthError } = await supabaseAccountingService.getRevenueGrowth();
      if (growthError) {
        console.error('Error fetching revenue growth:', growthError);
      } else if (growthData && growthData.length > 0) {
        const latestGrowth = growthData[0];
        // Parse the percentage string to get the numeric value
        const growthPercentage = latestGrowth.revenue_growth_percentage;
        if (growthPercentage && growthPercentage !== 'N/A') {
          const numericGrowth = parseFloat(growthPercentage.replace('%', ''));
          setRevenueGrowth(numericGrowth);
        }
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!user) return
    
    try {
      const { success, error } = await numerizamAuthService.approveUser(userId)
      if (error) {
        throw new Error(error)
      }
      if (success) {
        await loadPendingUsers() // Refresh the list
        setShowConfirmDialog(false)
        setSelectedUser(null)
      }
    } catch (err) {
      setError(`Failed to approve user: ${(err as Error).message}`)
    }
  }

  const handleRejectUser = async (userId: string) => {
    if (!user) return
    
    try {
      const { success, error } = await numerizamAuthService.rejectUser(userId)
      if (error) {
        throw new Error(error)
      }
      if (success) {
        await loadPendingUsers() // Refresh the list
        setShowConfirmDialog(false)
        setSelectedUser(null)
      }
    } catch (err) {
      setError(`Failed to reject user: ${(err as Error).message}`)
    }
  }

  const openConfirmDialog = (user: NumerizamUser, action: 'approve' | 'reject') => {
    setSelectedUser(user)
    setActionType(action)
    setShowConfirmDialog(true)
  }

  const handleConfirmAction = () => {
    if (!selectedUser || !selectedUser.id) return
    
    if (actionType === 'approve') {
      handleApproveUser(selectedUser.id)
    } else {
      handleRejectUser(selectedUser.id)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const renderDashboardOverview = () => (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'white', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {revenueLoading ? 'Loading...' : `$${currentYearRevenue.toLocaleString()}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Current Year Revenue
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                    {revenueLoading ? '' : `↑ ${revenueGrowth}`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">65</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pendingUsers.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">45</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">89%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Approval Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* User Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: isMobile ? 350 : 400 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                User Distribution
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={userStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Registrations Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: isMobile ? 350 : 400 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Monthly Registrations
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={monthlyRegistrations} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="registrations" fill="#8884d8" name="Registrations" />
                    <Bar dataKey="approvals" fill="#82ca9d" name="Approvals" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Activity Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ height: isMobile ? 300 : 350 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                System Activity (24h)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={systemActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="logins" stackId="1" stroke="#8884d8" fill="#8884d8" name="Logins" />
                    <Area type="monotone" dataKey="uploads" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Uploads" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage accountant registrations and monitor system analytics.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<Person />} label="User Management" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        {currentTab === 0 ? (
          renderDashboardOverview()
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Box>
                        <Typography variant="h6">{pendingUsers.length}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pending Approvals
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ flexGrow: 1, p: 2, borderRadius: 2, height: 'calc(100% - 120px)', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Pending Accountant Registrations
              </Typography>

              {isLoading ? (
                <LoadingSpinner 
                  type="gradient" 
                  size="large" 
                  message="Loading pending registrations..." 
                />
              ) : pendingUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    No pending registrations at this time.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 'calc(100% - 60px)' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        {!isMobile && <TableCell>Company</TableCell>}
                        {!isMobile && <TableCell>Location</TableCell>}
                        {!isMobile && <TableCell>Registration Date</TableCell>}
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: 'table-row' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person sx={{ mr: 1, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.first_name} {user.last_name}
                                </Typography>
                                {isMobile && (
                                  <Typography variant="caption" color="textSecondary">
                                    {user.email}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              <Typography variant="body2">{user.email}</Typography>
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Business sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                <Typography variant="body2">
                                  {user.company_name || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                <Typography variant="body2">
                                  {user.location || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              <Typography variant="body2">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <Chip 
                              label="Pending" 
                              color="warning" 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                                onClick={() => openConfirmDialog(user, 'approve')}
                                sx={{ minWidth: isMobile ? 'auto' : 'unset', px: isMobile ? 1 : 2 }}
                              >
                                {isMobile ? '' : 'Approve'}
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<Close />}
                                onClick={() => openConfirmDialog(user, 'reject')}
                                sx={{ minWidth: isMobile ? 'auto' : 'unset', px: isMobile ? 1 : 2 }}
                              >
                                {isMobile ? '' : 'Reject'}
                              </Button>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {actionType === 'approve' ? 'Approve' : 'Reject'} Accountant Registration
        </DialogTitle>
        <DialogContent id="confirm-dialog-description">
          <Typography>
            Are you sure you want to {actionType} the registration for{' '}
            <strong>{selectedUser?.name}</strong> from{' '}
            <strong>{selectedUser?.company_name}</strong>?
          </Typography>
          {actionType === 'approve' && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This will grant them access to the query page and accounting features.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboard