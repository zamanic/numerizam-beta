import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  Business,
  Person,
  Storage,
  Assessment,
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  CheckCircle,
  Cancel,
  Warning,
  TrendingUp,
  TrendingDown,
  People,
  Computer,
  CloudUpload,
  HowToReg,
  ArrowUpward,
  ArrowDownward,
  Check,
  Close,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { adminService } from '../services/adminService'
import ApprovalManagement from '../components/admin/ApprovalManagement'

// Types
type DataModel = {
  id: string
  name: string
  description: string
  recordCount: number
  lastUpdated: Date
}

type UsageStat = {
  label: string
  value: number
  change: number
  unit: string
}

// Real data state will be managed in component

const mockDataModels: DataModel[] = [
  { id: 'm1', name: 'General Ledger', description: 'Core financial transactions', recordCount: 1245, lastUpdated: new Date(2023, 5, 28) },
  { id: 'm2', name: 'Calendar', description: 'Fiscal periods and date configurations', recordCount: 36, lastUpdated: new Date(2023, 5, 25) },
  { id: 'm3', name: 'Chart of Accounts', description: 'Account structure and hierarchy', recordCount: 87, lastUpdated: new Date(2023, 5, 27) },
  { id: 'm4', name: 'Vendors', description: 'Supplier and vendor information', recordCount: 53, lastUpdated: new Date(2023, 5, 26) },
  { id: 'm5', name: 'Customers', description: 'Client and customer records', recordCount: 128, lastUpdated: new Date(2023, 5, 28) },
]

const mockUsageStats: UsageStat[] = [
  { label: 'Total Transactions', value: 12458, change: 8.5, unit: '' },
  { label: 'Active Users', value: 42, change: 12.3, unit: '' },
  { label: 'Average Response Time', value: 0.8, change: -15.2, unit: 's' },
  { label: 'Storage Used', value: 256, change: 5.7, unit: 'MB' },
]

const AdminPanel = () => {
  const { user, switchCompany } = useContext(AuthContext)
  const [tabIndex, setTabIndex] = useState(0)
  const [dataModelTab, setDataModelTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  
  // Real data state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Data fetching functions
  const fetchUsers = async () => {
    const { users: fetchedUsers, error: usersError } = await adminService.getAllUsers()
    if (usersError) {
      setError(usersError)
    } else {
      setUsers(fetchedUsers)
    }
  }

  const fetchCompanies = async () => {
    const { companies: fetchedCompanies, error: companiesError } = await adminService.getAllCompanies()
    if (companiesError) {
      setError(companiesError)
    } else {
      setCompanies(fetchedCompanies)
    }
  }

  const fetchUserStats = async () => {
    const { stats, error: statsError } = await adminService.getUserStats()
    if (statsError) {
      setError(statsError)
    } else {
      setUserStats(stats)
    }
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    await Promise.all([
      fetchUsers(),
      fetchCompanies(),
      fetchUserStats()
    ])
    
    setIsLoading(false)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  // Load data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // User action handlers
  const handleApproveUser = async (userId: string) => {
    const { error } = await adminService.approveUser(userId)
    if (error) {
      setError(error)
    } else {
      await fetchUsers() // Refresh users list
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const { error } = await adminService.deleteUser(userId)
    if (error) {
      setError(error)
    } else {
      await fetchUsers() // Refresh users list
      setShowDeleteDialog(false)
      setItemToDelete(null)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await adminService.updateUserRole(userId, newRole)
    if (error) {
      setError(error)
    } else {
      await fetchUsers() // Refresh users list
    }
  }

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  // Handle data model tab change
  const handleDataModelTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setDataModelTab(newValue)
  }

  // Handle company switch
  const handleCompanySwitch = (companyId: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      switchCompany(companyId)
      setIsLoading(false)
    }, 800)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    if (itemToDelete.type === 'user') {
      await handleDeleteUser(itemToDelete.id)
    } else {
      // Handle other types of deletions (companies, etc.)
      setIsLoading(true)
      setTimeout(() => {
        console.log(`Deleted ${itemToDelete.type} ${itemToDelete.id}: ${itemToDelete.name}`)
        setShowDeleteDialog(false)
        setItemToDelete(null)
        setIsLoading(false)
      }, 800)
    }
  }

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter data models based on search term
  const filteredDataModels = mockDataModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
          Admin Panel
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={refreshData}
            disabled={refreshing}
            startIcon={refreshing ? <LoadingSpinner type="circular" size="small" /> : <Refresh />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="company-select-label">Currently Managing</InputLabel>
            <Select
              labelId="company-select-label"
              value={user?.currentCompany?.id || ''}
              onChange={(e) => handleCompanySwitch(e.target.value)}
              label="Currently Managing"
              startAdornment={
                <InputAdornment position="start">
                  <Business fontSize="small" />
                </InputAdornment>
              }
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Business />} label="Companies" />
          <Tab icon={<Person />} label="Users" />
          <Tab icon={<Storage />} label="Data Models" />
          <Tab icon={<Assessment />} label="Usage & Health" />
          <Tab icon={<HowToReg />} label="Approvals" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabIndex !== 4 && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <TextField
                placeholder={`Search ${tabIndex === 0 ? 'companies' : tabIndex === 1 ? 'users' : tabIndex === 2 ? 'data models' : 'stats'}`}
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {tabIndex !== 3 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => alert(`Add new ${tabIndex === 0 ? 'company' : tabIndex === 1 ? 'user' : 'data model'} dialog would open here`)}
                >
                  Add {tabIndex === 0 ? 'Company' : tabIndex === 1 ? 'User' : 'Record'}
                </Button>
              )}
            </Box>
          )}

          {/* Companies Tab */}
          {tabIndex === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <LoadingSpinner type="dots" size="medium" message="Loading companies..." />
                      </TableCell>
                    </TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No companies found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id} hover>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={company.status}
                            size="small"
                            color={
                              company.status === 'active'
                                ? 'success'
                                : company.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={company.plan}
                            size="small"
                            color={
                              company.plan === 'premium'
                                ? 'primary'
                                : company.plan === 'standard'
                                ? 'info'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{company.usersCount}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => alert(`Edit ${company.name}`)}>  
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setItemToDelete({
                                  type: 'company',
                                  id: company.id,
                                  name: company.name,
                                })
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Users Tab */}
          {tabIndex === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <LoadingSpinner type="wave" size="medium" message="Loading users..." />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={
                              user.role === 'Admin'
                                ? 'primary'
                                : user.role === 'Accountant'
                                ? 'info'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{user.company_name || 'N/A'}</TableCell>
                        <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell align="right">
                          {!user.is_approved && (
                            <Tooltip title="Approve User">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleApproveUser(user.id)}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Change Role">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const newRole = user.role === 'admin' ? 'accountant' : 'admin'
                                handleUpdateUserRole(user.id, newRole)
                              }}
                            >
                              <Person fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setItemToDelete({
                                  type: 'user',
                                  id: user.id,
                                  name: user.name,
                                })
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Data Models Tab */}
          {tabIndex === 2 && (
            <Box>
              <Tabs
                value={dataModelTab}
                onChange={handleDataModelTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {mockDataModels.map((model, _index) => (
                  <Tab key={model.id} label={model.name} />
                ))}
              </Tabs>

              {filteredDataModels.length > 0 && dataModelTab < filteredDataModels.length ? (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{filteredDataModels[dataModelTab].name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {filteredDataModels[dataModelTab].description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={`${filteredDataModels[dataModelTab].recordCount} Records`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        Last updated: {filteredDataModels[dataModelTab].lastUpdated.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => alert(`Refresh ${filteredDataModels[dataModelTab].name} data`)}
                    >
                      Refresh Data
                    </Button>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => alert(`Edit schema for ${filteredDataModels[dataModelTab].name}`)}
                      >
                        Edit Schema
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => alert(`Add record to ${filteredDataModels[dataModelTab].name}`)}
                      >
                        Add Record
                      </Button>
                    </Box>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      This is a placeholder for the data table of {filteredDataModels[dataModelTab].name}.
                      In a real application, this would display the actual records with CRUD functionality.
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        Data Table for {filteredDataModels[dataModelTab].name}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="textSecondary">No data models found</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Usage & Health Tab */}
          {tabIndex === 3 && (
            <Box>
              <Grid container spacing={3}>
                {(userStats ? [
                  { label: 'Total Users', value: userStats.totalUsers, change: 0, unit: '' },
                  { label: 'Approved Users', value: userStats.approvedUsers, change: 0, unit: '' },
                  { label: 'Pending Users', value: userStats.pendingUsers, change: 0, unit: '' },
                  { label: 'Total Companies', value: userStats.totalCompanies, change: 0, unit: '' },
                ] : mockUsageStats).map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {stat.label}
                          </Typography>
                          <Typography variant="h4">
                            {stat.value.toLocaleString()}{stat.unit}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {stat.change > 0 ? (
                              <ArrowUpward fontSize="small" color="success" />
                            ) : (
                              <ArrowDownward fontSize="small" color="error" />
                            )}
                            <Typography
                              variant="body2"
                              color={stat.change > 0 ? 'success.main' : 'error.main'}
                              sx={{ ml: 0.5 }}
                            >
                              {Math.abs(stat.change)}% {stat.change > 0 ? 'increase' : 'decrease'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      API Performance
                    </Typography>
                    <Box sx={{ height: 200, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Response Time (ms)</Typography>
                        <Typography variant="body2" color="success.main">Avg: 245ms</Typography>
                      </Box>
                      <Box sx={{ height: 120, display: 'flex', alignItems: 'end', gap: 1 }}>
                        {[180, 220, 195, 245, 210, 235, 190, 260, 225, 240, 215, 250].map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: `${(value / 300) * 100}%`,
                              bgcolor: value > 250 ? 'error.main' : value > 200 ? 'warning.main' : 'success.main',
                              borderRadius: '2px 2px 0 0',
                              minHeight: '4px'
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">12h ago</Typography>
                        <Typography variant="caption" color="textSecondary">Now</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Error Rates
                    </Typography>
                    <Box sx={{ height: 200, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">Error Rate (%)</Typography>
                        <Typography variant="body2" color="success.main">Avg: 0.8%</Typography>
                      </Box>
                      <Box sx={{ height: 120, display: 'flex', alignItems: 'end', gap: 1 }}>
                        {[0.5, 1.2, 0.8, 0.3, 0.9, 1.5, 0.6, 0.4, 1.1, 0.7, 0.9, 1.0].map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: `${(value / 2) * 100}%`,
                              bgcolor: value > 1.5 ? 'error.main' : value > 1 ? 'warning.main' : 'success.main',
                              borderRadius: '2px 2px 0 0',
                              minHeight: '4px'
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">12h ago</Typography>
                        <Typography variant="caption" color="textSecondary">Now</Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%', mr: 1 }} />
                          <Typography variant="caption">Good (&lt;1%)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: '50%', mr: 1 }} />
                          <Typography variant="caption">Warning (1-1.5%)</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', mr: 1 }} />
                          <Typography variant="caption">Critical (&gt;1.5%)</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Approvals Tab */}
          {tabIndex === 4 && (
            <ApprovalManagement />
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {itemToDelete?.type} <strong>{itemToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Close />}
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Check />}
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminPanel